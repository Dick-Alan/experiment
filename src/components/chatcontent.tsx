import { type Author } from "../utils/types";

import { RenderContent } from "./rendercontent";
export type ChatItem = {
  author: Author;
  content: string;
  isError?: boolean;
};

type Props = {
  chatItems: ChatItem[];
};

export const ChatContent = ({ chatItems }: Props) => (
  <>
    {chatItems.map((chatItem, index) => (
      <div key={index}>
        <div className="container ml-8 mt-2 flex max-w-3xl grid-cols-2 p-2">
          <div className=" flex h-[26px] w-[140px]  px-2 text-purple-700">
            {chatItem.author === "🧙‍♂️" ? (
              <div className="text-4xl">{chatItem.author}</div>
            ) : (
              <div>{chatItem.author}</div>
            )}
          </div>
          <div className="ml-10">
            <RenderContent content={chatItem.content}></RenderContent>
          </div>
        </div>
      </div>
    ))}
  </>
);
