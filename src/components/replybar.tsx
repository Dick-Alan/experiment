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

export const ReplyBar = (props: { id: string }) => {
  const [input, setInput] = useState("");

  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.createReply.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getRepliesByCommentId.invalidate();
      toast.success("reply posted");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post reply");
      }
    },
  });
  if (!user) return null;

  return (
    <div className="ml-2">
      <textarea
        cols={1}
        wrap="hard"
        className=" z-10 m-1 ml-20 h-[150px] w-[300px] grow rounded-sm border-2 border-green-500 bg-gray-900  p-1 outline-none"
        placeholder="reply..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        // onKeyDown={(e) => {
        //   if (e.key === "Enter") {
        //     e.preventDefault();
        //     if (input !== "") {
        //       mutate({ content: input, commentId: props.id });
        //     }
        //   }
        // }}
      ></textarea>

      {input !== "" && !isPosting && (
        <button
          className="rounded-md bg-gray-800 p-3 text-slate-300 hover:border hover:bg-green-500"
          onClick={() => {
            mutate({ content: input, commentId: props.id });
          }}
        >
          Reply
        </button>
      )}
    </div>
  );
};
