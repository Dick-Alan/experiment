import Image from "next/image";

import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "../components/loading";

import toast from "react-hot-toast";

dayjs.extend(relativeTime);
import { useState } from "react";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { RequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { object } from "zod";
import { ReplyBar } from "~/components/replybar";
import { ReplyView } from "~/components/replyview";

type CommentwithUser = RouterOutputs["posts"]["getCommentsByPostId"][number];

export const CommentView = (props: CommentwithUser) => {
  const { comment, author } = props;
  const [repliesOn, setRepliesOn] = useState(false);
  const { user } = useUser();
  const ctx = api.useContext();
  console.log(props, "props log");
  const id = comment.id;
  const commentId = comment.id;
  const replies = api.posts.getRepliesByCommentId.useQuery({
    commentId,
  }).data;

  const postTime = comment.createdAt.toString().substring(0, 33);
  const { mutate, isLoading: isDeleting } = api.posts.deleteComment.useMutation(
    {
      onSuccess: () => {
        toast.success("Deleted");

        void ctx.posts.getCommentsByPostId.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to delete");
        }
      },
    }
  );

  return (
    <div>
      <div
        className=" relative m-1 ml-10 flex gap-1 rounded-2xl border-y border-l-8 border-r-4 border-slate-800 bg-gradient-to-r from-slate-900  from-0% via-black via-5% to-black to-100% p-1 text-left"
        key={id}
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
              [
              <span className="text-xs">
                {dayjs(comment.createdAt.toString().substring(0, 33)).fromNow()}
              </span>
              ]
            </span>
          </div>

          <span className="my-5 ml-10 rounded-md text-slate-50 ">
            {comment.content}
          </span>

          <div className="w-4/4 my-2 flex border-slate-100">
            <button className="ml-5" onClick={(e) => setRepliesOn(!repliesOn)}>
              {replies?.length ? (
                <div>
                  {replies.length} replies {repliesOn ? "[ - ]" : "[ + ]"}
                </div>
              ) : (
                <button>reply {repliesOn ? "[ - ]" : "[ + ]"}</button>
              )}
            </button>
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
      {repliesOn ? (
        <div className="t-0 ml-10 mt-0   rounded-bl-2xl border-l-4 border-slate-300">
          <ReplyBar id={id} />{" "}
          {replies?.map((e) => (
            <ReplyView
              key={e.reply.id}
              reply={{
                id: e.reply.id,
                createdAt: e.reply.createdAt,
                commentId: e.reply.commentId,
                content: e.reply.content,
                authorId: e.author.id,
              }}
              author={e.author}
            />
          ))}{" "}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
