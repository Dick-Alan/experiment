import Image from "next/image";

import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "../components/loading";

import toast from "react-hot-toast";

dayjs.extend(relativeTime);

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { RequestCookiesAdapter } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { object } from "zod";

type CommentwithUser = RouterOutputs["posts"]["getCommentsByPostId"][number];

export const CommentView = (props: CommentwithUser) => {
  const { comment, author } = props;
  const { user } = useUser();
  const ctx = api.useContext();
  console.log(props, "props log");
  const id = comment.id;

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

        <span className="my-5 ml-10 rounded-md ">{comment.content}</span>

        <div className="w-4/4 my-2flex border-slate-100">
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
