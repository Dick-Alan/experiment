import { type NextPage } from "next";
import { api } from "../utils/api";
import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRef, useState } from "react";
import { ChatContent, type ChatItem } from "../components/chatcontent";
import { ChatInput } from "../components/chatinput";

const Chat: NextPage<{ id: string }> = ({ id }) => {
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [waiting, setWaiting] = useState<boolean>(false);
  const scrollToRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const name = user?.fullName || "guest";
  const scrollToBottom = () => {
    setTimeout(
      () => scrollToRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const generatedTextMutation = api.ai.generateText.useMutation({
    onSuccess: (data) => {
      setChatItems([
        ...chatItems,
        {
          content: data.generatedText,
          author: "🧙‍♂️",
        },
      ]);
    },

    onError: (error) => {
      setChatItems([
        ...chatItems,
        {
          content: error.message ?? "An error occurred",
          author: "🧙‍♂️",
          isError: true,
        },
      ]);
    },

    onSettled: () => {
      setWaiting(false);
      scrollToBottom();
    },
  });

  const resetMutation = api.ai.reset.useMutation();

  const handleUpdate = (prompt: string) => {
    setWaiting(true);

    setChatItems([
      ...chatItems,
      {
        content: prompt.replace(/\n/g, "\n\n"),
        author: name,
      },
    ]);

    scrollToBottom();

    generatedTextMutation.mutate({ prompt });
  };

  const handleReset = () => {
    setChatItems(chatItems.slice(1, chatItems.length));
    resetMutation.mutate();
  };

  return (
    <>
      <Head>
        <title>AI Chat</title>
        <meta name="description" content="AI Chat Playground" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center bg-black text-lime-600">
        <section className="w-full">
          Context length = {chatItems.length} messages
        </section>

        <section className="relative m-1 flex w-3/4 flex-grow flex-col gap-1 overflow-y-scroll rounded-2xl bg-gradient-to-r from-slate-900 from-0%  via-black via-5% to-black to-100% p-1 text-left ">
          <ChatContent chatItems={chatItems} />
          <div ref={scrollToRef} />
        </section>

        <div className="flex w-[500px] flex-col items-center">
          <ChatInput
            onUpdate={handleUpdate}
            onReset={handleReset}
            waiting={waiting}
          />
        </div>
      </div>
    </>
  );
};

export default Chat;
