import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Linkify from "react-linkify";
import Highlight from "react-highlight";
const useMediaQuery = (width) => {
  const [targetReached, setTargetReached] = useState(false);

  const updateTarget = useCallback((e) => {
    if (e.matches) {
      setTargetReached(true);
    } else {
      setTargetReached(false);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${width}px)`);
    media.addListener(updateTarget);

    // Check on mount (callback is not called until a change occurs)
    if (media.matches) {
      setTargetReached(true);
    }

    return () => media.removeListener(updateTarget);
  }, []);

  return targetReached;
};
export const RenderContent = (props: { content: string }) => {
  const isBreakpoint = useMediaQuery(768);
  const codex = new RegExp(/(?<=``)((.|\n)*)(?=``)/g);
  const codeblock = props.content.match(codex);
  const text: string[] = props.content.replace(codex, "$CODEBLOCK").split(" ");
  const regex = new RegExp(`(?:jpg|png)`);
  // const screenwidth = width >= 775 ? "xl" : "sm";

  // console.log(screenwidth, typeof screenwidth, window.innerWidth, width);

  return (
    <div className={` flex gap-1`}>
      <Linkify>
        <pre className={`max-w-${isBreakpoint ? "sm" : "xl"}`}>
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
