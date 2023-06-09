import { useEffect, useState } from "react";

type Props = {
  onUpdate: (prompt: string) => void;
  onReset: () => void;
  waiting: boolean;
};

export const ChatInput = ({ onUpdate, onReset, waiting }: Props) => {
  const [prompt, setPrompt] = useState<string>("");
  const [rows, setRows] = useState<number>(2);

  useEffect(() => {
    const lines = prompt.split(/\r*\n/).length;
    setRows(Math.max(2, Math.min(lines, 5)));
  }, [prompt]);

  const handleUpdate = () => {
    setPrompt("");
    onUpdate(prompt);
  };

  return (
    <div className="w-full flex-col  items-center rounded-md border-2 border-lime-600 bg-black   p-5 py-2">
      <div className="container mx-auto ">
        <div className=" flex">
          <textarea
            className="h-auto w-full bg-slate-900 p-2"
            placeholder="..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleUpdate();
              }
            }}
            disabled={waiting}
            rows={rows}
          />
        </div>
        <div className="my-2 flex items-center justify-between">
          <button
            className="mx-2 rounded-md bg-slate-600 px-2 text-slate-200 hover:bg-slate-800"
            onClick={onReset}
            disabled={waiting}
          >
            Reduce Tokens
          </button>
          <button
            className="mx-2 rounded-md bg-slate-600 px-2 text-slate-200 hover:bg-slate-800"
            onClick={handleUpdate}
            disabled={waiting}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
