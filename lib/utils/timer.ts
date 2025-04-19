import logger from "./Logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function timedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const start = Date.now();
    const result = await fn(...args);
    const duration = Date.now() - start;

    logger.info(`Execution time for ${fn.name}: ${duration}ms`);
    return result;
  } as T;
}
