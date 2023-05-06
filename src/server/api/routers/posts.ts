import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { clerkClient } from "@clerk/nextjs/server";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post, Comment, Reply } from "@prisma/client";
import { CssSyntaxError, comment } from "postcss";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

const addUserDataToComments = async (comments: Comment[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: comments.map((comment) => comment.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return comments.map((comment) => {
    const author = users.find((user) => user.id === comment.authorId);
    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return {
      comment,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

const addUserDataToReplies = async (replies: Reply[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: replies.map((reply) => reply.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return replies.map((reply) => {
    const author = users.find((user) => user.id === reply.authorId);
    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return {
      reply,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};
// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),

  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const postId = input.id;
      const post = await ctx.prisma.post.findUnique({
        where: { id: postId },
      });
      const comments = await ctx.prisma.comment.findMany({
        where: {
          postId: postId,
        },
      });
      if (!!comments) {
        for (let i = 0; i < comments.length; i++) {
          const commentId = comments[i]?.id;
          const replies = await ctx.prisma.reply.findMany({
            where: {
              commentId: commentId,
            },
          });
          if (!!replies) {
            await ctx.prisma.reply.deleteMany({
              where: {
                commentId: commentId,
              },
            });
          }
        }
        await ctx.prisma.comment.deleteMany({
          where: {
            postId: postId,
          },
        });
      }
      if (!post || post.authorId !== authorId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.prisma.post.delete({
        where: {
          id: postId,
        },
      });
      return { success: true };
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });
    return addUserDataToPosts(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(12000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId!;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId: authorId,
          content: input.content,
        },
      });
      return post;
    }),

  // create new comment
  createComment: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(12000),
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId!;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const comment = await ctx.prisma.comment.create({
        data: {
          authorId: authorId,
          content: input.content,
          postId: input.postId,
        },
      });
      return comment;
    }),

  //delete comment
  deleteComment: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const id = input.id;
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: id },
      });
      const replies = await ctx.prisma.reply.findMany({
        where: {
          commentId: id,
        },
      });
      if (!!replies) {
        await ctx.prisma.reply.deleteMany({
          where: {
            commentId: id,
          },
        });
      }

      if (!comment || comment.authorId !== authorId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.prisma.comment.delete({
        where: {
          id: id,
        },
      });
      return { success: true };
    }),

  getCommentsByPostId: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.comment
        .findMany({
          where: {
            postId: input.postId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToComments)
    ),
  //get replies
  getRepliesByCommentId: publicProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.reply
        .findMany({
          where: {
            commentId: input.commentId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToReplies)
    ),

  //delete reply
  deleteReply: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const id = input.id;
      const reply = await ctx.prisma.reply.findUnique({
        where: { id: id },
      });
      if (!reply || reply.authorId !== authorId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.prisma.reply.delete({
        where: {
          id: id,
        },
      });
      return { success: true };
    }),

  //create reply
  createReply: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(12000),
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId!;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const reply = await ctx.prisma.reply.create({
        data: {
          authorId: authorId,
          content: input.content,
          commentId: input.commentId,
        },
      });
      return reply;
    }),
  getAllReplies: publicProcedure.query(async ({ ctx }) => {
    const replies = await ctx.prisma.reply.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });
    return addUserDataToReplies(replies);
  }),
});
