import { clerkMiddleware, ClerkMiddlewareOptions } from "@clerk/nextjs/server";

const options = {
  signInUrl: "/",
  afterSignInUrl: "/dashboard",
} satisfies ClerkMiddlewareOptions;

export default clerkMiddleware({
  ...options,
});

// publishableKey?: string;
// domain?: string;
// isSatellite?: boolean;
// proxyUrl?: string;
// signInUrl?: string;
// signUpUrl?: string;
// afterSignInUrl?: string;
// afterSignUpUrl?: string;
// organizationSyncOptions?: OrganizationSyncOptions;
// apiClient?: ApiClient;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
