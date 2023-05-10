import { createTRPCRouter } from "~/server/api/trpc";
import { postsRouter } from "./routers/posts";
import { aiRouter } from "./routers/ai";
import { profileRouter } from "./routers/profile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  ai: aiRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
