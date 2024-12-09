import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/settings(.*)",
  "/api/protected(.*)",
  "/profile(.*)",
  // Add other protected routes here
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    console.log("\x1b[41m%s\x1b[0m", "PROTECTED", `${request.url}`);
    await auth.protect();
  } else {
    console.log("\x1b[42m%s\x1b[0m", "PUBLIC", `${request.url}`);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
