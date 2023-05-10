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
          author: "AI",
        },
      ]);
    },

    onError: (error) => {
      setChatItems([
        ...chatItems,
        {
          content: error.message ?? "An error occurred",
          author: "AI",
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
    setChatItems([]);
    resetMutation.mutate();
  };

  return (
    <>
      <Head>
        <title>AI Chat</title>
        <meta name="description" content="AI Chat Playground" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen flex-col items-center bg-slate-800">
        <section className="w-full"></section>

        <section className="w-full flex-grow overflow-y-scroll">
          <ChatContent chatItems={chatItems} />
          <div ref={scrollToRef} />
        </section>

        <section className="w-full">
          <ChatInput
            onUpdate={handleUpdate}
            onReset={handleReset}
            waiting={waiting}
          />
        </section>
      </div>
    </>
  );
};

export default Chat;
