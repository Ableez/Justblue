import { createRouteHandler } from "uploadthing/next";

import { PostFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: PostFileRouter,
});
