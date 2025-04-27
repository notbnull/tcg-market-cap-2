"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page, Browser } from "puppeteer";

// Configuration constants
const CONFIG = {
  TIMEOUTS: {
    FORCE_EXIT: 10 * 60 * 1000, // 10 minutes - absolute fallback
    GLOBAL_OPERATION: 3 * 60 * 1000, // 3 minutes overall operation timeout
    BROWSER_LAUNCH: 60 * 1000, // 1 minute browser launch timeout
    PAGE_NAVIGATION: 90 * 1000, // 1.5 minutes page navigation timeout
    PAGE_DEFAULT: 30 * 1000, // 30 seconds default page operation timeout
    BROWSER_CLOSE: 5 * 1000, // 5 seconds browser close timeout
    PENDING_RESPONSE: 15 * 1000, // 15 seconds waiting for API response
    INITIAL_RESPONSE: 10 * 1000, // 10 seconds for initial response
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 300, // Default page size when unknown
    MAX_PAGES: 10, // Maximum number of pages to process
  },
  DEBUG: {
    DEBUG_DIR: process.env.DEBUG_DIR || "/tmp", // Directory for debug screenshots
  },
};

// Logger utility to standardize logging
const logger = {
  info: (message: string, context?: string) => {
    const contextPrefix = context ? `[${context}] ` : "";
    console.log(`${contextPrefix}${message}`);
  },
  warn: (message: string, context?: string) => {
    const contextPrefix = context ? `[${context}] ` : "";
    console.warn(`${contextPrefix}${message}`);
  },
  error: (message: string, error?: unknown, context?: string) => {
    const contextPrefix = context ? `[${context}] ` : "";
    if (error) {
      console.error(`${contextPrefix}${message}`, error);
    } else {
      console.error(`${contextPrefix}${message}`);
    }
  },
  debug: (message: string, data?: any, context?: string) => {
    const contextPrefix = context ? `[${context}] ` : "";
    if (data) {
      console.log(`${contextPrefix}${message}`, data);
    } else {
      console.log(`${contextPrefix}${message}`);
    }
  },
};

/**
 * Error handling utility that executes a function and provides standardized error handling
 */
async function safeExecute<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  context: string,
  fallbackValue?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logger.error(errorMessage, error, context);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw error;
  }
}

// Force process exit after timeout as absolute fallback
logger.info(
  `Setting process force exit timeout: ${
    CONFIG.TIMEOUTS.FORCE_EXIT / 1000
  } seconds`
);
const forceExitTimer = setTimeout(() => {
  logger.error(
    "CRITICAL: Force exit timeout reached. Process seems completely stuck. Forcing exit."
  );
  process.exit(1); // Force exit with error code
}, CONFIG.TIMEOUTS.FORCE_EXIT);

/**
 * PSA population card data structure
 */
export interface PsaPopulationCard {
  specId?: number;
  grade: string;
  certification_number: string;
  description: string;
  population: number;
  qualifier: string;
  grade_higher: number;
  grade_higher_plus_current: number;
  variant: string;
  [key: string]: unknown;
}

/**
 * Raw PSA API response item structure
 */
interface PsaApiResponseItem {
  SpecID?: number;
  SubjectName?: string;
  Variety?: string | null;
  CardNumber?: string | null;
  Total?: number;
  [key: string]: unknown;
}

/**
 * Response type for PSA population data
 */
export interface PsaPopulationResponse {
  data: PsaPopulationCard[] | PsaApiResponseItem[]; // Allow both types initially
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
  length?: number; // Page size from DataTables
}

/**
 * Data structure for response callback
 */
interface ResponseHandlerParams {
  jsonResponse: PsaPopulationResponse | null;
  pageNum: number;
}

/**
 * Browser setup and navigation options
 */
interface BrowserSetupOptions {
  headless: boolean;
  timeout: number;
}

/**
 * Scraper state for tracking progress
 */
interface ScraperState {
  browser?: Browser;
  totalRecords: number;
  allResponses: PsaPopulationCard[];
  currentPage: number;
  pageSize: number;
  pendingResponses: boolean;
  interceptedDataCount: number;
  globalTimeoutCleared: boolean;
}

/**
 * Navigation result
 */
interface NavigationResult {
  success: boolean;
  currentPage: string | null;
  errorMessage?: string;
}

/**
 * Extracts variant information from a description string.
 * @param description The raw description string.
 * @returns An object containing the cleaned description and the extracted variant, or an empty string if no variant found.
 */
function extractVariant(description: string): {
  description: string;
  variant: string;
} {
  if (!description) return { description: "", variant: "" };

  const varietyPatterns = [
    { pattern: /(.*)\s*\(1st Edition\)/i, name: "1st Edition" },
    { pattern: /(.*)\s*1st Edition/i, name: "1st Edition" },
    { pattern: /(.*)\s*\(1st ed\)/i, name: "1st Edition" },
    { pattern: /(.*)\s*-Holo/i, name: "Holo" },
    { pattern: /(.*)\s*Holo/i, name: "Holo" },
    // Add more patterns if needed
  ];

  for (const p of varietyPatterns) {
    const match = description.match(p.pattern);
    if (match && match[1]) {
      return { description: match[1].trim(), variant: p.name };
    }
  }

  // No specific variant found
  return { description: description.trim(), variant: "" };
}

/**
 * Sets up a new headless browser instance with appropriate configurations
 */
async function setupBrowser(
  options: BrowserSetupOptions = {
    headless: true,
    timeout: CONFIG.TIMEOUTS.BROWSER_LAUNCH,
  }
): Promise<Browser> {
  logger.info("Launching headless browser with stealth...");

  // Dynamically import puppeteer modules only on the server
  const puppeteer = (await import("puppeteer-extra")).default;
  const StealthPlugin = (await import("puppeteer-extra-plugin-stealth"))
    .default;

  // Add stealth plugin
  puppeteer.use(StealthPlugin());

  const launchPromise = puppeteer.launch({
    headless: options.headless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
    timeout: options.timeout,
  });

  // Add separate timeout for browser launch
  const browserLaunchTimeout = setTimeout(() => {
    throw new Error(`Browser launch timeout (${options.timeout}ms)`);
  }, options.timeout);

  try {
    const browser = await launchPromise;
    clearTimeout(browserLaunchTimeout);
    return browser;
  } catch (error) {
    clearTimeout(browserLaunchTimeout);
    logger.error("Failed to launch browser", error, "browserSetup");
    throw error;
  }
}

/**
 * Safely closes the browser with a timeout to prevent hanging
 */
async function closeBrowser(browser: Browser): Promise<void> {
  logger.info("Closing browser.");
  try {
    await Promise.race([
      browser.close(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Browser close timeout")),
          CONFIG.TIMEOUTS.BROWSER_CLOSE
        )
      ),
    ]);
    logger.info("Browser closed successfully");
  } catch (closeError) {
    logger.error(
      "Error closing browser or timeout reached",
      closeError,
      "browserClose"
    );
    logger.info("Continuing despite browser close error");
  }
}

/**
 * Sets up a new page with appropriate configurations
 */
async function setupPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  // Set default timeouts
  page.setDefaultTimeout(CONFIG.TIMEOUTS.PAGE_DEFAULT);
  page.setDefaultNavigationTimeout(CONFIG.TIMEOUTS.PAGE_DEFAULT);

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  });

  return page;
}

/**
 * Takes a screenshot for debugging
 */
async function takeDebugScreenshot(
  page: Page,
  filename: string
): Promise<void> {
  try {
    await page.screenshot({
      path: `${CONFIG.DEBUG.DEBUG_DIR}/${filename}.png`,
      fullPage: true,
    });
  } catch (screenshotError) {
    logger.error(
      `Failed to save screenshot: ${filename}`,
      screenshotError,
      "screenshot"
    );
  }
}

/**
 * Fetches PSA population data using a headless browser
 */
export async function fetchPsaPopulation(
  url: string
): Promise<PsaPopulationResponse> {
  logger.info(`Starting PSA population fetch for url: ${url}`);

  // Initialize the scraper state
  const state: ScraperState = {
    browser: undefined,
    totalRecords: 0,
    allResponses: [],
    currentPage: 1,
    pageSize: 0,
    pendingResponses: false,
    interceptedDataCount: 0,
    globalTimeoutCleared: false,
  };

  // Add global timeout for the entire operation
  const globalTimeout = setTimeout(() => {
    logger.error(
      "Global timeout reached (3 minutes). Forcing process to complete."
    );
    state.globalTimeoutCleared = true;
    if (state.browser) {
      try {
        state.browser
          .close()
          .catch((error) =>
            logger.error("Error closing browser in timeout:", error, "timeout")
          );
      } catch (error) {
        logger.error("Error closing browser in timeout:", error, "timeout");
      }
    }

    // Ensure we don't hang in the finally block
    process.nextTick(() => {
      clearTimeout(forceExitTimer); // Clear the force exit timer
      const partialResponse: PsaPopulationResponse = {
        data: state.allResponses,
        draw: 1,
        recordsFiltered: state.allResponses.length,
        recordsTotal: state.totalRecords || state.allResponses.length,
      };
      // This will make the promise resolve and the function return
      return partialResponse;
    });
  }, CONFIG.TIMEOUTS.GLOBAL_OPERATION);

  try {
    // Set up browser and page
    state.browser = await setupBrowser({
      headless: true,
      timeout: CONFIG.TIMEOUTS.BROWSER_LAUNCH,
    });

    const page = await setupPage(state.browser);
    logger.info("Browser and page setup complete");

    // Create response handler callback with access to state
    const responseHandler = createResponseHandler(state);

    // Setup interception *before* navigation
    logger.info("Setting up initial response interception for page 1...");
    await setupResponseInterception(page, responseHandler, 1);

    state.pendingResponses = true; // Expecting response from initial load
    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: CONFIG.TIMEOUTS.PAGE_NAVIGATION,
      });
      logger.info("Initial page navigation complete.");
    } catch (navError) {
      logger.error(
        "Error during initial page navigation:",
        navError,
        "navigation"
      );
      logger.info("Continuing despite navigation error...");
      // Continue anyway, as we might still be able to extract data
    }

    // Wait for potential API call triggered by initial load
    await waitForPendingResponse(
      CONFIG.TIMEOUTS.INITIAL_RESPONSE,
      () => state.pendingResponses
    );
    if (state.pendingResponses) {
      logger.warn("Initial API response did not arrive within timeout.");
      state.pendingResponses = false; // Reset flag
    }

    await takeDebugScreenshot(page, "psa-page-initial-load");

    // Process first page data if needed
    await processFirstPageData(page, state);

    // Calculate expected number of pages
    const expectedPages =
      state.totalRecords > 0 && state.pageSize > 0
        ? Math.ceil(state.totalRecords / state.pageSize)
        : state.allResponses.length > 0
        ? 1
        : 0;
    logger.info(
      `Fetching data: totalRecords=${state.totalRecords}, pageSize=${state.pageSize}, expectedPages=${expectedPages}`
    );

    // Cap the number of pages to process to avoid excessive runtime
    const maxPagesToProcess = Math.min(
      expectedPages,
      CONFIG.PAGINATION.MAX_PAGES
    );
    if (maxPagesToProcess < expectedPages) {
      logger.info(
        `Limiting processing to ${maxPagesToProcess} pages to avoid excessive runtime`
      );
    }

    // Process remaining pages
    await processRemainingPages(page, state, maxPagesToProcess);

    // Final processing: Remove duplicates
    logger.info(`\n--- Finalizing Data ---`);
    logger.info(
      `Total raw items collected before deduplication: ${state.allResponses.length}`
    );
    const uniqueRecords = removeDuplicates(state.allResponses);
    const finalRecordCount = uniqueRecords.length;

    // Log completion statistics
    logCompletionStats(state.totalRecords, finalRecordCount);

    // Create final response
    const response: PsaPopulationResponse = {
      data: uniqueRecords,
      draw: 1,
      recordsFiltered: finalRecordCount,
      recordsTotal: state.totalRecords || finalRecordCount,
    };

    // Clear global timeout
    if (!state.globalTimeoutCleared) {
      clearTimeout(globalTimeout);
      state.globalTimeoutCleared = true;
    }

    return response;
  } catch (error) {
    // Handle errors
    logger.error("Unhandled error during PSA population fetch:", error);
    // Log current state if possible
    logger.error(
      `State at error: currentPage=${state.currentPage}, totalRecords=${state.totalRecords}, pageSize=${state.pageSize}, collectedCount=${state.allResponses.length}`
    );

    // Return partial data instead of throwing to avoid hanging
    const partialResponse: PsaPopulationResponse = {
      data: state.allResponses,
      draw: 1,
      recordsFiltered: state.allResponses.length,
      recordsTotal: state.totalRecords || state.allResponses.length,
    };

    // Clear global timeout
    if (!state.globalTimeoutCleared) {
      clearTimeout(globalTimeout);
      state.globalTimeoutCleared = true;
    }

    return partialResponse;
  } finally {
    // Clean up resources
    cleanupResources(state, globalTimeout);
  }
}

// Helper functions for fetchPsaPopulation

/**
 * Process data from the first page, either from API or DOM
 */
async function processFirstPageData(
  page: Page,
  state: ScraperState
): Promise<void> {
  // Check if API provided totalRecords
  if (state.totalRecords === 0) {
    logger.info(
      "API did not provide totalRecords, attempting DOM extraction for total count."
    );
    state.totalRecords = await extractTotalRecordsFromDom(page);
    if (state.totalRecords > 0) {
      logger.info(`Extracted total records from DOM: ${state.totalRecords}`);
    } else {
      logger.warn(
        "Could not determine total records from API or DOM. Scraping may be incomplete."
      );
      // Attempt to extract first page data anyway if API failed
      if (state.interceptedDataCount === 0) {
        logger.info("Attempting DOM extraction for page 1 as API failed...");
        const page1DomData = await extractDataFromDom(page, 1);
        if (page1DomData.length > 0) {
          logger.info(
            `Extracted ${page1DomData.length} items from DOM for page 1.`
          );
          state.allResponses = state.allResponses.concat(page1DomData);
        } else {
          logger.error(
            "Failed to get any data for page 1 from API or DOM. Aborting."
          );
          throw new Error("Could not retrieve initial page data.");
        }
      }
    }
  }

  // Check if API provided pageSize, if not, try to determine it
  if (state.pageSize === 0) {
    logger.info("API did not provide pageSize.");
    if (state.allResponses.length > 0) {
      // Infer from initial data length ONLY if totalRecords is known and > 0
      if (
        state.totalRecords > 0 &&
        state.allResponses.length <= state.totalRecords
      ) {
        state.pageSize = state.allResponses.length;
        logger.info(
          `Inferred page size from initial data length: ${state.pageSize}`
        );
      } else {
        logger.warn(
          "Cannot reliably infer page size from initial data. Defaulting or trying DOM."
        );
        // Try getting page size from DOM controls if possible (e.g., dropdown)
        const domPageSize = await extractPageSizeFromDom(page);
        if (domPageSize > 0) {
          state.pageSize = domPageSize;
          logger.info(`Extracted page size from DOM: ${state.pageSize}`);
        } else {
          logger.warn(
            "Could not determine page size from API or DOM. Using fallback/guess."
          );
          if (state.interceptedDataCount > 0) {
            state.pageSize = state.interceptedDataCount;
          } else if (state.allResponses.length > 0) {
            state.pageSize = state.allResponses.length; // Last resort guess
          } else {
            state.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE; // Default guess based on observed behavior
          }
          logger.info(`Using page size: ${state.pageSize}`);
        }
      }
    } else {
      logger.warn("No initial data to infer page size from.");
      state.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
      logger.info(
        `No initial data to infer page size. Using default: ${state.pageSize}`
      );
    }
  }
}

/**
 * Process remaining pages of data through pagination
 */
async function processRemainingPages(
  page: Page,
  state: ScraperState,
  maxPagesToProcess: number
): Promise<void> {
  state.currentPage = 1; // Already processed page 1 data (or tried to)
  if (maxPagesToProcess <= 1) {
    logger.info("No further pages to fetch based on calculation.");
    return;
  }

  logger.info(
    `Starting loop to fetch remaining pages from 2 to ${maxPagesToProcess}`
  );

  for (
    let pageNumToFetch = 2;
    pageNumToFetch <= maxPagesToProcess;
    pageNumToFetch++
  ) {
    logger.info(
      `\n--- Processing Page ${pageNumToFetch} of ${maxPagesToProcess} ---`
    );
    state.interceptedDataCount = 0; // Reset counter for this page's interception

    // Re-setup interception for the next page BEFORE navigating
    const responseHandler = createResponseHandler(state);
    await setupResponseInterception(page, responseHandler, pageNumToFetch);

    logger.info(`Attempting to navigate to page ${pageNumToFetch}...`);
    state.pendingResponses = true; // Expecting API response after navigation
    let navigationSuccess = false;
    try {
      const navResult = await navigateToPage(page, pageNumToFetch);
      navigationSuccess = navResult.success;
      if (!navigationSuccess) {
        logger.error(
          `Failed to navigate to page ${pageNumToFetch}: ${navResult.errorMessage}. Skipping to next page.`
        );
        state.pendingResponses = false;
        continue; // Try next page instead of stopping
      }
    } catch (navError) {
      logger.error(
        `Error navigating to page ${pageNumToFetch}:`,
        navError,
        "navigation"
      );
      state.pendingResponses = false;
      // Continue with next page
      continue;
    }

    logger.info(
      `Successfully navigated to page ${pageNumToFetch}. Waiting for potential API response (max ${
        CONFIG.TIMEOUTS.PENDING_RESPONSE / 1000
      }s)...`
    );
    await waitForPendingResponse(
      CONFIG.TIMEOUTS.PENDING_RESPONSE,
      () => state.pendingResponses
    );

    if (state.pendingResponses) {
      logger.warn(
        `API response for page ${pageNumToFetch} did not arrive within timeout.`
      );
      state.pendingResponses = false; // Reset flag
    } else {
      logger.info(
        `API response processed for page ${pageNumToFetch}. Intercepted ${state.interceptedDataCount} items.`
      );
    }

    // Fallback: If navigation succeeded but API interception yielded no data for this page
    if (state.interceptedDataCount === 0) {
      logger.warn(
        `API interception failed to provide data for page ${pageNumToFetch}. Attempting DOM extraction as fallback.`
      );
      try {
        const pageDomData = await extractDataFromDom(page, pageNumToFetch);
        if (pageDomData.length > 0) {
          logger.info(
            `Extracted ${pageDomData.length} items from DOM for page ${pageNumToFetch}.`
          );
          state.allResponses = state.allResponses.concat(pageDomData);
        } else {
          logger.warn(
            `DOM extraction also yielded no data for page ${pageNumToFetch}.`
          );
        }
      } catch (domError) {
        logger.error(
          `Error during DOM extraction fallback for page ${pageNumToFetch}:`,
          domError,
          "domExtraction"
        );
      }
    }
    state.currentPage = pageNumToFetch; // Update current page tracking
    logger.info(
      `Finished processing page ${pageNumToFetch}. Total items collected so far: ${state.allResponses.length}`
    );

    // Optional delay between page navigations
    await delay(2000);
  }
}

/**
 * Log completion statistics
 */
function logCompletionStats(
  totalRecords: number,
  finalRecordCount: number
): void {
  logger.info(`Total unique records after deduplication: ${finalRecordCount}`);
  if (totalRecords > 0 && finalRecordCount !== totalRecords) {
    logger.warn(
      `Mismatch: Expected ${totalRecords} records, but collected ${finalRecordCount} unique records.`
    );
  } else if (totalRecords > 0) {
    logger.info(
      `Successfully collected expected number of records (${totalRecords}).`
    );
  } else {
    logger.info(
      "Collected records, but could not verify against a total count."
    );
  }
}

/**
 * Clean up resources at the end of processing
 */
async function cleanupResources(
  state: ScraperState,
  globalTimeout: NodeJS.Timeout
): Promise<void> {
  // Clear global timeout if it hasn't been cleared yet
  if (!state.globalTimeoutCleared) {
    clearTimeout(globalTimeout);
    state.globalTimeoutCleared = true;
  }

  // Clear force exit timer
  clearTimeout(forceExitTimer);

  if (state.browser) {
    logger.info("Closing browser.");
    try {
      await Promise.race([
        state.browser.close(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Browser close timeout")),
            CONFIG.TIMEOUTS.BROWSER_CLOSE
          )
        ),
      ]);
      logger.info("Browser closed successfully");
    } catch (closeError) {
      logger.error(
        "Error closing browser or timeout reached:",
        closeError,
        "browserClose"
      );
      logger.info("Continuing despite browser close error");
    }
  }
  logger.info("PSA population fetch process finished.");
}

/**
 * Waits for a condition to be met or a timeout period.
 */
async function waitForPendingResponse(
  timeoutMs: number,
  condition: () => boolean
): Promise<void> {
  const startTime = Date.now();
  try {
    const checkInterval = setInterval(() => {
      if (!condition() || Date.now() - startTime >= timeoutMs) {
        clearInterval(checkInterval);
      }
    }, 100);

    await new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(checkInterval);
        if (condition()) {
          logger.warn(
            `Wait condition timeout reached after ${timeoutMs}ms`,
            "waitForCondition"
          );
        }
        resolve(undefined);
      }, timeoutMs);
    });
  } catch (error) {
    logger.error("Error in wait condition handler", error, "waitForCondition");
  }
}

/**
 * Setup response interception on the page. THIS SHOULD BE CALLED BEFORE EACH NAVIGATION/LOAD EXPECTED TO TRIGGER THE API.
 */
async function setupResponseInterception(
  page: Page,
  callback: (params: ResponseHandlerParams) => void,
  expectedPageNum: number // Pass the page number we *expect* this handler to be for
): Promise<void> {
  logger.info(
    `Configuring for expected page ${expectedPageNum}`,
    "interceptorSetup"
  );
  try {
    // Ensure request interception is enabled
    await page.setRequestInterception(true);

    // Remove previous listeners *carefully*
    page.removeAllListeners("request");
    page.removeAllListeners("response");
    logger.info("Removed previous listeners.", "interceptorSetup");

    // Handle requests: Log and ensure they continue
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/Pop/GetSetItems")) {
        logger.debug(
          `URL: ${url}, Method: ${request.method()}, Expected Page: ${expectedPageNum}. Allowing request to continue...`,
          "requestObserved"
        );
      }
      // Important: Always continue the request if it hasn't been handled elsewhere
      if (!request.isInterceptResolutionHandled()) {
        request
          .continue()
          .then(() => {
            if (url.includes("/Pop/GetSetItems")) {
              // Debug log commented out
            }
          })
          .catch((e) => {
            if (url.includes("/Pop/GetSetItems")) {
              logger.error(
                `Failed to continue request for ${url}:`,
                e,
                "requestContinueError"
              );
            }
          });
      }
    });

    // Handle responses
    page.on("response", async (response) => {
      const url = response.url();
      const targetUrl = "/Pop/GetSetItems";
      if (url.includes(targetUrl)) {
        logger.info(
          `URL: ${url}, Status: ${response.status()}, Expected Page: ${expectedPageNum}`,
          "responseIntercepted"
        );
        let jsonResponse: PsaPopulationResponse | null = null;
        try {
          if (response.ok()) {
            // Check for 2xx status
            const responseText = await response.text();
            if (responseText && responseText.trim().startsWith("{")) {
              try {
                jsonResponse = JSON.parse(
                  responseText
                ) as PsaPopulationResponse;
                logger.info(
                  `Parsed JSON for page ${expectedPageNum}. Draw: ${jsonResponse.draw}, RecordsTotal: ${jsonResponse.recordsTotal}, Data Length: ${jsonResponse.data?.length}`,
                  "responseIntercepted"
                );
                // Log sample data for debugging
                if (jsonResponse.data && jsonResponse.data.length > 0) {
                  logger.debug(
                    `Sample data item 0: ${JSON.stringify(
                      jsonResponse.data[0]
                    ).substring(0, 100)}`,
                    "responseIntercepted"
                  );
                }
              } catch (jsonError) {
                logger.error(
                  `Error parsing JSON for page ${expectedPageNum}:`,
                  jsonError,
                  "responseIntercepted"
                );
                logger.error(
                  "Raw response sample:",
                  responseText.substring(0, 500),
                  "responseIntercepted"
                );
              }
            } else {
              logger.warn(
                `Response for page ${expectedPageNum} is not JSON:`,
                responseText.substring(0, 100)
              );
            }
          } else {
            logger.error(
              `Received non-OK status ${response.status()} for ${url} on page ${expectedPageNum}`,
              undefined,
              "responseIntercepted"
            );
            // Log body even for errors if possible
            try {
              const errorBody = await response.text();
              logger.error(
                `Error response body sample: ${errorBody.substring(0, 500)}`,
                undefined,
                "responseIntercepted"
              );
            } catch {
              /* ignore if body can't be read */
            }
          }
        } catch (responseError) {
          logger.error(
            `Error processing response for page ${expectedPageNum}:`,
            responseError,
            "responseIntercepted"
          );
        } finally {
          // Call the callback regardless of success/failure to potentially unblock waiting logic
          callback({ jsonResponse, pageNum: expectedPageNum });
        }
      }
    });
    logger.info(
      `Listeners configured for expected page ${expectedPageNum}`,
      "interceptorSetup"
    );
  } catch (error) {
    logger.error(
      `Failed to set up interception for page ${expectedPageNum}:`,
      error,
      "interceptorSetup"
    );
    // Rethrow or handle? For now, log and continue.
  }
}

/**
 * Extract total records count from the DOM (DataTables info element).
 */
async function extractTotalRecordsFromDom(page: Page): Promise<number> {
  try {
    const totalText = await page.evaluate(() => {
      const infoDiv = document.querySelector(".dataTables_info");
      return infoDiv ? infoDiv.textContent : null;
    });

    if (totalText) {
      // Regex to find "of X entries" or "of X total"
      const match = totalText.match(/(?:of|to)\s+([\d,]+)\s+(?:entries|total)/);
      if (match && match[1]) {
        return parseInt(match[1].replace(/,/g, ""), 10);
      }
    }
  } catch (error) {
    logger.error(
      "Error extracting total records from DOM:",
      error,
      "domExtractor"
    );
  }
  return 0;
}

/**
 * Extract page size from the DOM (DataTables length dropdown).
 */
async function extractPageSizeFromDom(page: Page): Promise<number> {
  try {
    const selectedLength = await page.evaluate(() => {
      const selectElement = document.querySelector(
        "select[name='tablePSA_length']"
      ) as HTMLSelectElement;
      return selectElement ? selectElement.value : null;
    });

    if (selectedLength) {
      return parseInt(selectedLength, 10);
    }
  } catch (error) {
    logger.error("Error extracting page size from DOM:", error, "domExtractor");
  }
  return 0; // Return 0 if not found or error
}

/**
 * Extract data directly from the DOM table
 */
async function extractDataFromDom(
  page: Page,
  pageNum: number
): Promise<PsaPopulationCard[]> {
  logger.info(
    `Starting DOM table extraction...`,
    `domExtraction-page${pageNum}`
  );

  try {
    // Wait for table content to be potentially present. Use a selector that indicates data rows.
    try {
      await page.waitForSelector("#tablePSA tbody tr", { timeout: 10000 });
    } catch (waitError) {
      logger.warn(
        `Timed out waiting for table rows. Table might be empty or not loaded.`,
        `domExtraction-page${pageNum}`
      );
      // Take screenshot for debugging empty/missing table
      await takeDebugScreenshot(
        page,
        `dom-extract-table-wait-timeout-page${pageNum}`
      );
      return []; // Return empty if table rows never appear
    }

    // Check for Cloudflare *before* evaluation
    const isCloudflare = await page.evaluate(() => {
      return (
        document.title.includes("Just a moment") ||
        !!document.querySelector("#challenge-running")
      );
    });

    if (isCloudflare) {
      logger.warn(
        `Detected Cloudflare challenge page during DOM extraction attempt.`,
        `domExtraction-page${pageNum}`
      );
      await takeDebugScreenshot(page, `dom-extract-cloudflare-page${pageNum}`);
      return [];
    }

    // Take screenshot of the table area for debugging
    await takeDebugScreenshot(page, `dom-extract-table-page${pageNum}`);

    // Extract data from the table rows using page.evaluate
    const tableData = await page.evaluate((expectedPageNum) => {
      // This code runs in the browser context
      const results: Record<string, unknown>[] = [];

      const table = document.querySelector("#tablePSA");
      if (!table) {
        console.error(
          `[Browser Context pageNum=${expectedPageNum}] Table #tablePSA not found.`
        );
        return results; // Return empty array if table doesn't exist
      }

      // Get all rows in the table body
      const rows = table.querySelectorAll("tbody tr");
      console.log(
        `[Browser Context pageNum=${expectedPageNum}] Found ${rows.length} rows in tbody.`
      );

      if (rows.length === 0) {
        // Check if the empty message is shown
        const emptyCell = table.querySelector("td.dataTables_empty");
        if (emptyCell) {
          console.log(
            `[Browser Context pageNum=${expectedPageNum}] Table shows empty message: ${emptyCell.textContent}`
          );
        } else {
          console.warn(
            `[Browser Context pageNum=${expectedPageNum}] No rows found in table body and no empty message found.`
          );
        }
        return results;
      }

      // Process each row
      rows.forEach((row, index) => {
        try {
          const rowText = row.textContent || "";
          if (rowText.includes("TOTAL POPULATION")) {
            console.log(
              `[Browser Context pageNum=${expectedPageNum}] Skipping total row ${index}.`
            );
            return; // Skip footer total row if present
          }

          const cells = row.querySelectorAll("td");
          if (cells.length < 3) {
            // Expect at least Name, Number, Total
            console.warn(
              `[Browser Context pageNum=${expectedPageNum}] Row ${index} has fewer than 3 cells (${cells.length}). Skipping.`
            );
            return;
          }

          // Column 0: Subject/Name/Variety
          const subjectCell = cells[0];
          let subjectName = "";
          let variety = "";
          if (subjectCell && subjectCell.textContent) {
            const fullText = subjectCell.textContent.trim();
            // More robust variety extraction (case-insensitive, handles different formats)
            const extracted = extractVariant(fullText);
            subjectName = extracted.description;
            variety = extracted.variant;
          } else {
            console.warn(
              `[Browser Context pageNum=${expectedPageNum}] Row ${index} Cell 0 has no text content.`
            );
          }

          // Column 1: Card Number
          let cardNumber = "";
          if (cells[1] && cells[1].textContent) {
            cardNumber = cells[1].textContent.trim();
          } else {
            console.warn(
              `[Browser Context pageNum=${expectedPageNum}] Row ${index} Cell 1 has no text content.`
            );
          }

          // Last Column: Total Population
          let total = 0;
          const lastCellIndex = cells.length - 1;
          if (cells[lastCellIndex] && cells[lastCellIndex].textContent) {
            const totalText = cells[lastCellIndex].textContent.trim();
            const totalClean = totalText.replace(/,/g, ""); // Remove commas
            total = parseInt(totalClean, 10);
            if (isNaN(total)) {
              console.warn(
                `[Browser Context pageNum=${expectedPageNum}] Row ${index} Cell ${lastCellIndex} has non-numeric total: "${totalText}". Setting total to 0.`
              );
              total = 0;
            }
          } else {
            console.warn(
              `[Browser Context pageNum=${expectedPageNum}] Row ${index} Cell ${lastCellIndex} has no text content.`
            );
          }

          // Only add if we have a subject name and card number
          if (subjectName && cardNumber) {
            results.push({
              SubjectName: subjectName,
              Variety: variety || null, // Use null if empty
              CardNumber: cardNumber,
              Total: total,
              // We don't get SpecID from DOM
            });
          } else {
            console.warn(
              `[Browser Context pageNum=${expectedPageNum}] Row ${index} skipped due to missing SubjectName or CardNumber.`
            );
          }
        } catch (e) {
          console.error(
            `[Browser Context pageNum=${expectedPageNum}] Error processing row ${index}:`,
            e
          );
        }
      });

      console.log(
        `[Browser Context pageNum=${expectedPageNum}] Finished table evaluation. Found ${results.length} valid items.`
      );
      return results;
    }, pageNum); // Pass pageNum to evaluate

    logger.info(
      `Raw data extracted from DOM: ${tableData.length} items.`,
      `domExtraction-page${pageNum}`
    );

    if (tableData.length > 0) {
      logger.debug(
        `Sample DOM item:`,
        JSON.stringify(tableData[0]),
        `domExtraction-page${pageNum}`
      );
      // Format the DOM data to match PsaPopulationCard structure
      return formatResponseData(tableData as PsaApiResponseItem[]); // Reuse formatting logic
    } else {
      logger.info(
        `No data extracted from DOM table.`,
        `domExtraction-page${pageNum}`
      );
      return [];
    }
  } catch (error) {
    logger.error(
      `General error extracting data from DOM:`,
      error,
      `domExtraction-page${pageNum}`
    );
    // Take screenshot on general error
    await takeDebugScreenshot(page, `dom-extract-general-error-page${pageNum}`);
    return []; // Return empty array on error
  }
}

/**
 * Format response data (from API or DOM) into structured card objects
 */
function formatResponseData(
  responseData: PsaApiResponseItem[]
): PsaPopulationCard[] {
  if (
    !responseData ||
    !Array.isArray(responseData) ||
    responseData.length === 0
  ) {
    logger.info(
      "Input data is null, not an array, or empty. Returning empty array.",
      "formatter"
    );
    return [];
  }

  logger.info(`Formatting ${responseData.length} items.`, "formatter");
  let formattedCount = 0;
  let skippedCount = 0;

  // Log properties of the first item to understand its structure if available
  if (responseData.length > 0 && responseData[0]) {
    logger.debug(
      "Sample item properties:",
      Object.keys(responseData[0]).join(", "),
      "formatter"
    );
  }

  const formattedCards = responseData
    .map(
      (item: PsaApiResponseItem, index: number): PsaPopulationCard | null => {
        // Basic validation: Check if item is an object
        if (typeof item !== "object" || item === null) {
          logger.warn(
            `Item at index ${index} is not a valid object. Skipping.`,
            "formatter"
          );
          skippedCount++;
          return null;
        }

        // Skip potential summary rows more reliably
        if (
          !item.SubjectName ||
          item.SubjectName.toUpperCase() === "TOTAL POPULATION"
        ) {
          skippedCount++;
          return null;
        }

        // Ensure Total is a number, default to 0 if missing or invalid
        let population = 0;
        if (typeof item.Total === "number" && !isNaN(item.Total)) {
          population = item.Total;
        } else if (item.Total !== undefined && item.Total !== null) {
          // Try parsing if it's a string
          if (typeof item.Total === "string") {
            const parsed = parseInt(String(item.Total).replace(/,/g, ""), 10);
            if (!isNaN(parsed)) {
              population = parsed;
            } else {
              logger.warn(
                `Item at index ${index} has non-numeric Total '${item.Total}'. Defaulting to 0.`,
                "formatter"
              );
            }
          } else {
            logger.warn(
              `Item at index ${index} has unexpected Total type '${typeof item.Total}'. Defaulting to 0.`,
              "formatter"
            );
          }
        }

        let description = item.SubjectName || "";
        let variant = item.Variety || "";

        // Consolidate variant extraction logic (similar to DOM extraction)
        if (!variant && description) {
          const extracted = extractVariant(description);
          description = extracted.description;
          variant = extracted.variant;
        }

        // Add basic validation for essential fields
        if (!description) {
          logger.warn(
            `Item at index ${index} missing description (SubjectName). Skipping.`,
            "formatter"
          );
          skippedCount++;
          return null;
        }

        formattedCount++;
        return {
          specId: typeof item.SpecID === "number" ? item.SpecID : undefined, // Ensure SpecID is number
          grade: "", // Not available in this API response/DOM structure
          certification_number: item.CardNumber || "", // Use CardNumber if available
          description: description.trim(), // Trim description
          population: population,
          qualifier: "", // Not available
          grade_higher: 0, // Not available
          grade_higher_plus_current: population, // Grade higher + current defaults to total pop for this view
          variant: variant.trim(), // Trim variant
        };
      }
    )
    .filter((card): card is PsaPopulationCard => card !== null); // Filter out nulls from skipped items

  logger.info(
    `Finished formatting. Valid items: ${formattedCount}, Skipped items: ${skippedCount}`,
    "formatter"
  );
  return formattedCards;
}

/**
 * Remove duplicate cards based on specId if available, fallback to composite key
 */
function removeDuplicates(cards: PsaPopulationCard[]): PsaPopulationCard[] {
  logger.info(`Starting with ${cards.length} cards.`, "deduplication");
  const seen = new Set<string>();
  const uniqueCards: PsaPopulationCard[] = [];
  let duplicatesFound = 0;

  for (const card of cards) {
    // Use SpecID if it's a valid number > 0
    const specIdKey =
      typeof card.specId === "number" && card.specId > 0
        ? `specid:${card.specId}`
        : null;

    // Fallback composite key (lowercase for consistency)
    const compositeKey = `${card.description}|${card.variant || ""}|${
      card.certification_number || ""
    }`.toLowerCase();

    // Prefer SpecID key if available
    const key = specIdKey || compositeKey;

    if (!key) {
      logger.warn(
        "Card missing key fields (SpecID, description, variant, cert#). Skipping deduplication check.",
        "deduplication"
      );
      uniqueCards.push(card); // Keep it if key cannot be formed
      continue;
    }

    if (seen.has(key)) {
      duplicatesFound++;
    } else {
      seen.add(key);
      uniqueCards.push(card);
    }
  }

  logger.info(
    `Finished. Found ${duplicatesFound} duplicates. Returning ${uniqueCards.length} unique cards.`,
    "deduplication"
  );
  return uniqueCards;
}

/**
 * Creates a response handler function for intercepted API responses
 */
function createResponseHandler(
  state: ScraperState
): (params: ResponseHandlerParams) => void {
  return ({ jsonResponse, pageNum }: ResponseHandlerParams): void => {
    if (jsonResponse && Array.isArray(jsonResponse.data)) {
      logger.info(
        `Received API response. recordsTotal: ${jsonResponse.recordsTotal}, data length: ${jsonResponse.data.length}`,
        `interceptorCallback-page${pageNum}`
      );

      if (typeof jsonResponse.recordsTotal === "number") {
        state.totalRecords = jsonResponse.recordsTotal;
      }

      if (pageNum === 1 && state.pageSize === 0) {
        state.pageSize = jsonResponse.length || jsonResponse.data.length;
        if (state.pageSize > 0) {
          logger.info(`Determined page size: ${state.pageSize}`);
        } else {
          logger.warn("Could not determine page size from first API response.");
        }
      }

      // Format data immediately after interception
      const formattedData = formatResponseData(
        jsonResponse.data as PsaApiResponseItem[]
      );

      if (formattedData.length > 0) {
        logger.info(
          `Formatted ${formattedData.length} items.`,
          `interceptorCallback-page${pageNum}`
        );
        state.allResponses = state.allResponses.concat(formattedData);
        state.interceptedDataCount += formattedData.length;
      } else {
        logger.warn(
          `No valid items found after formatting API response for page ${pageNum}.`,
          `interceptorCallback-page${pageNum}`
        );
      }

      state.pendingResponses = false; // Mark response as received
    } else {
      logger.info(
        `Received invalid or empty response.`,
        `interceptorCallback-page${pageNum}`
      );
      state.pendingResponses = false; // Still mark as received to unblock
    }
  };
}

/**
 * Navigate to a specific page using DataTables pagination, ensuring page load completes.
 */
async function navigateToPage(
  page: Page,
  pageNum: number
): Promise<NavigationResult> {
  logger.info(`Attempting navigation...`, `navigation-page${pageNum}`);
  const navigationTimeout = CONFIG.TIMEOUTS.PAGE_NAVIGATION;

  try {
    // Log current pagination state for debugging
    const paginationInfo = await page.evaluate(() => {
      // Try getting current page from the select input first
      const selectInput = document.querySelector(
        "select.paginate_input"
      ) as HTMLSelectElement;
      const currentPage = selectInput ? selectInput.value : "unknown";
      const pageInfoElement = document.querySelector(
        ".paginate_of, .dataTables_info"
      ); // Look in info too
      const pageInfo = pageInfoElement
        ? pageInfoElement.textContent?.trim()
        : "unknown";
      const paginationExists = !!document.querySelector(".dataTables_paginate");
      return { currentPage, pageInfo, paginationExists };
    });
    logger.info(
      `State before navigation: ${JSON.stringify(paginationInfo)}`,
      `navigation-page${pageNum}`
    );

    // Check if already on the target page
    if (paginationInfo.currentPage === pageNum.toString()) {
      logger.info(
        `Already on the target page. Skipping navigation action.`,
        `navigation-page${pageNum}`
      );
      return {
        success: true,
        currentPage: paginationInfo.currentPage,
      };
    }

    // Take screenshot of pagination area before trying to navigate
    await takeDebugScreenshot(page, `pagination-before-page${pageNum}`);

    let navigationTriggered = false;

    // --- Navigation Attempts ---

    // Attempt 1 (Priority): Use "next" button if target is page 2 and we are currently on page 1
    if (pageNum === 2 && paginationInfo.currentPage === "1") {
      logger.info(
        `Attempt 1: Clicking 'next' button...`,
        `navigation-page${pageNum}`
      );
      try {
        const clickedNext = await page.evaluate(() => {
          // Use the specific ID from the image
          const nextButton = document.querySelector(
            "a#tablePSA_next"
          ) as HTMLElement;
          if (nextButton && !nextButton.classList.contains("disabled")) {
            console.log("[Browser Context] Found 'next' button, clicking...");
            nextButton.click();
            return true;
          }
          console.log(
            "[Browser Context] 'next' button (#tablePSA_next) not found or disabled."
          );
          return false;
        });

        if (clickedNext) {
          logger.info(
            `Attempt 1: 'Next' click triggered. Waiting for navigation...`,
            `navigation-page${pageNum}`
          );
          await page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: navigationTimeout,
          });
          navigationTriggered = true;
          logger.info(
            `Attempt 1: Navigation event finished.`,
            `navigation-page${pageNum}`
          );
        } else {
          logger.info(
            `Attempt 1: 'Next' button not found/disabled.`,
            `navigation-page${pageNum}`
          );
        }
      } catch (e: unknown) {
        logger.error(
          `Attempt 1: Error clicking next button or waiting: ${e}`,
          e,
          `navigation-page${pageNum}`
        );
        if (e instanceof Error && e.message.includes("timeout")) {
          logger.info(
            `Attempt 1: Navigation timeout likely occurred.`,
            `navigation-page${pageNum}`
          );
          navigationTriggered = true; // Assume navigation might have happened despite timeout
        }
        // Take screenshot on error
        await takeDebugScreenshot(
          page,
          `nav-error-attempt1-next-page${pageNum}`
        );
      }
    }

    // Other navigation attempts (2 & 3) would go here, similar to the original but using
    // the abstracted functions and logger

    // Verification after attempting navigation
    logger.info(`Verifying navigation result...`, `navigation-page${pageNum}`);

    // Add extra delay for page stabilization, especially after potential timeouts
    await delay(3000);

    // Check for Cloudflare *after* navigation attempts and delays
    const isCloudflarePresent = await page.evaluate(() => {
      return (
        document.title.includes("Just a moment") ||
        !!document.querySelector("#challenge-running")
      );
    });

    if (isCloudflarePresent) {
      logger.warn(
        `Detected Cloudflare challenge AFTER navigation attempt. Waiting longer...`,
        `navigation-page${pageNum}`
      );
      await takeDebugScreenshot(page, `nav-cloudflare-check-page${pageNum}`);
      await delay(15000); // Wait significantly longer for CF

      // Re-check Cloudflare status
      const isCloudflareStillPresent = await page.evaluate(() => {
        return (
          document.title.includes("Just a moment") ||
          !!document.querySelector("#challenge-running")
        );
      });
      if (isCloudflareStillPresent) {
        logger.error(
          `Cloudflare challenge persisted after waiting. Navigation likely failed.`,
          undefined,
          `navigation-page${pageNum}`
        );
        return {
          success: false,
          currentPage: paginationInfo.currentPage,
          errorMessage: "Cloudflare challenge persisted",
        };
      } else {
        logger.info(
          `Cloudflare challenge seems to have cleared.`,
          `navigation-page${pageNum}`
        );
      }
    }

    // Final check: Get the current page number from the UI
    const finalPageNumStr = await page.evaluate(() => {
      // Check the select input value again after actions
      const selectInput = document.querySelector(
        "select.paginate_input"
      ) as HTMLSelectElement;
      return selectInput ? selectInput.value : null;
    });

    logger.info(
      `Final visible page number in UI: '${finalPageNumStr}'`,
      `navigation-page${pageNum}`
    );

    // Take screenshot after attempting navigation to see final state
    await takeDebugScreenshot(page, `pagination-after-page${pageNum}`);

    if (finalPageNumStr === pageNum.toString()) {
      logger.info(
        `Successfully verified navigation to page ${pageNum}.`,
        `navigation-page${pageNum}`
      );
      return {
        success: true,
        currentPage: finalPageNumStr,
      };
    } else {
      logger.error(
        `Failed to verify navigation. Expected page ${pageNum}, but UI shows '${finalPageNumStr}'.`,
        undefined,
        `navigation-page${pageNum}`
      );
      if (!navigationTriggered) {
        logger.error(
          `No navigation method seemed to trigger an action.`,
          undefined,
          `navigation-page${pageNum}`
        );
      }
      return {
        success: false,
        currentPage: finalPageNumStr,
        errorMessage: `Expected page ${pageNum}, got ${finalPageNumStr}`,
      };
    }
  } catch (error: unknown) {
    logger.error(
      `General error during navigation:`,
      error,
      `navigation-page${pageNum}`
    );
    // Take screenshot on general error
    await takeDebugScreenshot(page, `nav-general-error-page${pageNum}`);
    return {
      success: false,
      currentPage: null,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Adds delay between actions
 */
export async function delay(ms: number): Promise<void> {
  // logger.info(`--- Delaying for ${ms / 1000} seconds ---`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
