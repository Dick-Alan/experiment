import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import type { RouterOutputs } from "~/utils/api";
import { CommentBar } from "./commentbar";
import { CommentView } from "./commentview";
import { RenderContent } from "./rendercontent";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { useState } from "react";
dayjs.extend(relativeTime);
type PostwithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostwithUser) => {
  const { post, author } = props;
  const [active, setActive] = useState(false);
  const { user } = useUser();
  const [commenting, setCommenting] = useState(false);
  const ctx = api.useContext();
  const [commentsOn, setCommentsOn] = useState(false);
  const id = post.id;
  const postId = id;
  const comments = api.posts.getCommentsByPostId.useQuery({
    postId,
  }).data;
  const postTime = post.createdAt.toString().substring(0, 33);

  //code for handling content from backend and converting it into frontend object.

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
    <div>
      <div
        className="relative m-1 flex gap-1 rounded-2xl border-x-4 border-y border-slate-800 bg-gradient-to-r from-slate-900 from-0%  via-black via-5% to-black to-100% p-1 text-left hover:border-slate-300"
        key={post.id}
        onMouseOver={(e) => setActive(true)}
        onMouseLeave={(e) => {
          setActive(false);
          setCommenting(false);
        }}
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

          <div className="w-4/4  flex max-w-fit">
            <div className="w-4/4 m-4 ml-10 flex rounded-md text-slate-50 ">
              <RenderContent content={post.content} />
            </div>
          </div>

          <Link
            className="absolute right-0 top-0 mx-2 content-end justify-end text-right text-3xl hover:text-green-500"
            href={`/post/${post.id}`}
          >{`>`}</Link>

          <div className="w-4/4 my-2 ml-10 flex border-slate-100">
            <button className="" onClick={(e) => setCommentsOn(!commentsOn)}>
              {comments?.length ? (
                <div
                  className={`text-xs ${
                    commentsOn ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {commentsOn
                    ? "Collapse "
                    : `Expand ${comments.length} ${
                        comments.length > 1 ? "comments" : "comment"
                      }`}

                  {commentsOn ? " [ - ]" : " [ + ]"}
                </div>
              ) : (
                ""
              )}
            </button>
            {active ? (
              <div className="grid-col-2 ">
                {user?.id === author.id && (
                  <button
                    className="ml-5 rounded-md bg-slate-900 px-2 text-slate-300 hover:bg-red-800"
                    onClick={() => mutate({ id })}
                  >
                    Delete
                  </button>
                )}
                {commenting ? (
                  <CommentBar id={postId} />
                ) : (
                  <button
                    className="ml-2 rounded-md bg-slate-900 px-2 text-slate-300 hover:bg-green-500"
                    onClick={(e) => {
                      setCommenting(!commenting);
                      setCommentsOn(true);
                    }}
                  >
                    Comment
                  </button>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      {commentsOn ? (
        <div className="t-0 ml-5 mt-0   rounded-bl-2xl border-l-4 border-slate-500">
          {comments?.map((e) => (
            <CommentView
              key={e.comment.id}
              comment={{
                id: e.comment.id,
                createdAt: e.comment.createdAt,
                postId: e.comment.postId,
                content: e.comment.content,
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
