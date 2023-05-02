import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "../components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

import { postsRouter } from "~/server/api/routers/posts";

dayjs.extend(relativeTime);

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { RequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { object } from "zod";

type PostwithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostwithUser) => {
  const { post, author } = props;
  const { user } = useUser();
  const ctx = api.useContext();
  const id = post.id;
  const postId = id;
  const comments = api.posts.getCommentsByPostId.useQuery({
    postId,
  }).data;
  const postTime = post.createdAt.toString().substring(0, 33);
  const { mutate, isLoading: isDeleting } = api.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Deleted");

      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete");
      }
    },
  });

  return (
    <div
      className=" relative m-1 flex gap-1 rounded-md border-y border-slate-400 bg-gray-900 bg-opacity-40 p-1 text-left"
      key={post.id}
    >
      <div className="flex flex-col">
        <div className="col-3 flex gap-3 p-2">
          <Image
            src={author.profilepicture}
            alt={author.username || ""}
            className="rounded-full"
            width={36}
            height={36}
          />
          <span className="text-s">
            <Link href={`/@${author.username!}`}>
              <span>{author.username}</span>
            </Link>{" "}
            [<span className="text-xs">{dayjs(postTime).fromNow()}</span>]
          </span>
        </div>

        <Link href={`/post/${post.id}`}>
          <span className="w-4/4 m-4 ml-10 flex rounded-md ">
            {post.content}
          </span>
        </Link>

        <div className="w-4/4 my-2 ml-10 flex border-slate-100">
          <Link className="" href={`/post/${post.id}`}>
            {comments?.length} comments
          </Link>
          {user?.id === author.id && (
            <button
              className="mx-5 text-slate-100 hover:text-red-800"
              onClick={() => mutate({ id })}
            >
              [Delete]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
