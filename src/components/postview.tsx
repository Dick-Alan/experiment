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

dayjs.extend(relativeTime);

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { PageLayout } from "~/components/layout";

type PostwithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostwithUser) => {
  const { post, author } = props;
  const postTime = post.createdAt.toString().substring(0, 33);

  return (
    <div
      className="m-1 flex gap-1 rounded-md border-y border-lime-400 bg-gray-900 bg-opacity-40 p-1 text-left"
      key={post.id}
    >
      <div className="flex flex-col">
        <div className="">
          <Image
            src={author.profilepicture}
            alt={author.username || ""}
            className="rounded-full"
            width={36}
            height={36}
          />
        </div>
        <span className="text-s">
          <Link href={`/@${author.username!}`}>
            <span>{author.username}</span>
          </Link>{" "}
          [<span className="text-xs">{dayjs(postTime).fromNow()}</span>]
        </span>
        <Link href={`/post/${post.id}`}>
          <span className="m-4 rounded-md p-2">{post.content}</span>
        </Link>
      </div>
    </div>
  );
};
