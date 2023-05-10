import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Linkify from "react-linkify";
import Highlight from "react-highlight";

// media query for grabbing client screen size
const useMediaQuery = (width: number) => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e: { matches: any }) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${width}px)`);
    media.addEventListener("change", (e) => updateTarget(e));

    // Check on mount (callback is not called until a change occurs)
    if (media.matches) {
      setTargetReached(true);
    }

    return () => media.removeEventListener("change", (e) => updateTarget(e));
  }, []);

  return targetReached;
};
export const RenderContent = (props: { content: string }) => {
  const isBreakpoint = useMediaQuery(768) || false;
  const codex = new RegExp(/(```)((.|\n)*)(```)/g);

  const codeblock = props.content.match(codex);
  const trimmedBlock = codeblock
    ? codeblock[0].substring(3, codeblock[0].length - 3)
    : "";
  const text: string[] = props.content
    .replace(codex, "   $CODEBLOCK   ")
    .split(" ");
  const regex = new RegExp(`(?:jpg|png)`);

  return (
    // conditional rendering based on client screen size
    <div className="flex flex-col ">
      {isBreakpoint ? (
        <div className={`max-w-xs gap-1 `}>
          <Linkify>
            <div className={``}>
              {text.map((e: string) =>
                e.includes("$CODEBLOCK") ? (
                  <div
                    key={e}
                    className={`rounded-md border border-green-500 p-1`}
                  >
                    <pre className="">
                      <Highlight>{trimmedBlock}</Highlight>
                    </pre>
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
            </div>
          </Linkify>
        </div>
      ) : (
        <div className={` max-w-xl gap-1`}>
          <Linkify>
            <div className={``}>
              {text.map((e: string) =>
                e.includes("$CODEBLOCK") ? (
                  <div
                    key={e}
                    className={` rounded-md border border-green-500 p-1`}
                  >
                    <pre className="">
                      <Highlight>{trimmedBlock}</Highlight>
                    </pre>
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
            </div>
          </Linkify>
        </div>
      )}
    </div>
  );
};
