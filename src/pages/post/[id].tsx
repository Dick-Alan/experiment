import { type NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "../../components/loading";
import { useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

const SinglePostPage: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();
  //return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="individual post view" />
      </Head>
      <main className="flex h-screen justify-center">
        <div>post view</div>
      </main>
    </>
  );
};

export default SinglePostPage;
