import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Linkify from "react-linkify";
import Highlight from "react-highlight";
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
  const codex = new RegExp(/(?<=``)((.|\n)*)(?=``)/g);

  const codeblock = props.content.match(codex);
  const text: string[] = props.content.replace(codex, "$CODEBLOCK").split(" ");
  const regex = new RegExp(`(?:jpg|png)`);

  // const screenwidth = window.innerWidth >= 775 ? "md" : "sm";

  // console.log(screenwidth, window.innerWidth);
  console.log(isBreakpoint);
  return (
    <div>
      {isBreakpoint ? (
        <div className={`flex  max-w-sm gap-1`}>
          <Linkify>
            <pre className={``}>
              {text.map((e: string) =>
                e.includes("$CODEBLOCK") ? (
                  <div key={e} className={` border border-green-500 p-1`}>
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
      ) : (
        <div className={`flex  max-w-xl gap-1`}>
          <Linkify>
            <pre className={``}>
              {text.map((e: string) =>
                e.includes("$CODEBLOCK") ? (
                  <div key={e} className={` border border-green-500 p-1`}>
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
      )}
    </div>
  );
};
