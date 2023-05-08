import Link from "next/link";
import Image from "next/image";
import Linkify from "react-linkify";
import Highlight from "react-highlight";
export const RenderContent = (props: { content: string }) => {
  const codex = new RegExp(/(?<=``)((.|\n)*)(?=``)/g);
  const codeblock = props.content.match(codex);
  const text: string[] = props.content.replace(codex, "$CODEBLOCK").split(" ");
  const regex = new RegExp(`(?:jpg|png)`);
  const screenwidth = window.innerWidth;
  const fivehundred = 300;
  console.log(screenwidth, typeof screenwidth, window.innerWidth);
  return (
    <div className={` flex gap-1`}>
      <Linkify>
        <pre className={`max-w-sm`}>
          {text.map((e: string) =>
            e.includes("$CODEBLOCK") ? (
              <div key={e} className="border border-green-500 p-1">
                <div className="border border-white">
                  <Highlight>{codeblock}</Highlight>
                </div>
              </div>
            ) : (
              <span className="object-contain font-normal" key={e}>
                {regex.test(e) ? (
                  <img
                    src={e}
                    className="hover: m-3 h-auto max-w-[300px]     object-scale-down "
                    alt={e}
                  ></img>
                ) : (
                  <>{e} </>
                )}
              </span>
            )
          )}
        </pre>
      </Linkify>
    </div>
  );
};
