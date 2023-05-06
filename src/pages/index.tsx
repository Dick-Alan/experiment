import { type NextPage } from "next";
import Image from "next/image";
import { PostView } from "~/components/postview";
import { SignIn, SignOutButton, useUser } from "@clerk/nextjs";
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
  const [signInClicked, setSignInClicked] = useState(false);
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
      toast.success("post successfull");
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
    <div className="flex-col-2 flex gap-3 rounded-md  border-slate-200 p-1">
      <div>
        <div className="text-xl">{user.fullName}</div>
        <Image
          className="mt-5 rounded-full"
          src={user.profileImageUrl}
          alt="Profile image"
          width={56}
          height={56}
        />
        <div>
          <SignOutButton />
        </div>
      </div>

      <div className="flex-grid w-full ">
        <textarea
          cols={1}
          wrap="hard"
          className=" z-10 m-1 mb-5 h-[150px] w-[300px] grow rounded-sm bg-gray-900 bg-opacity-50 p-1 outline-none"
          placeholder="Type message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter") {
          //     e.preventDefault();
          //     if (input !== "") {
          //       mutate({ content: input });
          //     }
          //   }
          // }}
          disabled={isPosting}
        />

        <div>
          {input !== "" && !isPosting && (
            <button
              className="rounded-md bg-slate-800 px-3 text-slate-300 hover:border hover:bg-green-500"
              onClick={() => mutate({ content: input })}
            >
              Post
            </button>
          )}
        </div>

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
      <div className="">
        {!isSignedIn && (
          <div className="relative m-3 flex flex-col content-center items-center  bg-transparent ">
            <SignIn
              appearance={{
                layout: {
                  logoPlacement: "none",
                },
                variables: {
                  colorBackground: "#0f172a",
                  colorText: "rgb(241, 245, 249)",
                },
              }}
            />
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
