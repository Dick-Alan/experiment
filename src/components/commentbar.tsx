import { type NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { useState } from "react";
import toast from "react-hot-toast";
import { CommentView } from "~/components/commentview";
dayjs.extend(relativeTime);

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import type { GetStaticProps } from "next";

import { PageLayout } from "~/components/layout";

export const CommentBar = (props: { id: string }) => {
  const [input, setInput] = useState("");
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.createComment.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getCommentsByPostId.invalidate();
      toast.success("comment posted");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post comment");
      }
    },
  });
  if (!user) return null;

  return (
    <div className="relative bottom-0 left-1/2 z-50  -translate-x-1/2 transform rounded-xl   bg-transparent px-10">
      <input
        className=" m-1 h-12 grow rounded-md border border-slate-800 bg-transparent p-1 outline-none active:border-slate-500"
        placeholder="Type comment"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input, postId: props.id });
            }
          }
        }}
      ></input>
      {input !== "" && !isPosting && (
        <button
          className="rounded-md bg-gray-800 p-3 hover:border hover:border-slate-100"
          onClick={() => mutate({ content: input, postId: props.id })}
        >
          Leave comment
        </button>
      )}
    </div>
  );
};
