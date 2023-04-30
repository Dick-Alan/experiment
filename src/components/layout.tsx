import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="bg-grey-800 h-full w-full  border-lime-600 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
