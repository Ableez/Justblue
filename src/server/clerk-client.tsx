import { env } from "@/env";
import { createClerkClient } from "@clerk/backend";

export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
});
