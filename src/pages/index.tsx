import { type NextPage } from "next";
import Image from "next/image";
import { PostView } from "~/components/postview";
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

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post");
      }
    },
  });

  if (!user) return null;
  return (
    <div className="flex-col-2 flex gap-1 rounded-md border border-slate-200 p-1">
      <div>
        {user.fullName}
        <Image
          className="rounded-full"
          src={user.profileImageUrl}
          alt="Profile image"
          width={56}
          height={56}
        />
      </div>
      <div className="flex w-3/4 flex-col">
        <input
          className=" m-1  h-12 grow rounded-sm bg-gray-900 bg-opacity-50 p-1 outline-none"
          placeholder="Type message"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input !== "") {
                mutate({ content: input });
              }
            }
          }}
          disabled={isPosting}
        />
        {input !== "" && !isPosting && (
          <button
            className="rounded-md bg-gray-800 p-1 hover:border hover:border-slate-100"
            onClick={() => mutate({ content: input })}
          >
            Post
          </button>
        )}

        {isPosting && (
          <div className="flex justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};
const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();
  //return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div>
        {!isSignedIn && (
          <div className="m-4 flex w-32 rounded-md bg-gray-900 px-4 text-right hover:bg-gray-700">
            <SignInButton />
          </div>
        )}
        {!!isSignedIn && (
          <div className="max-h-26 max-w-26 rounded-full p-4">
            <CreatePostWizard />
          </div>
        )}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
