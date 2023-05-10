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
        <div className="container mx-auto mt-2 flex max-w-3xl">
          <div className="mx-2 rounded-md bg-slate-900 px-2 text-slate-200">
            {chatItem.author}:
          </div>

          <RenderContent content={chatItem.content}></RenderContent>
        </div>
      </div>
    ))}
  </>
);
