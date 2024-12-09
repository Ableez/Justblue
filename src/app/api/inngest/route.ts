import { functions } from "@/server/inngest/functions";
import { inngestClient } from "@/server/inngest/client";
import { serve } from "inngest/next";

/**
 * Try to automatically choose the edge runtime if `INNGEST_STREAMING` is set.
 *
 * See https://innge.st/streaming.
 */

export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions,
});
