import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="bg-grey-800 h-full w-full  border-slate-100 md:max-w-2xl">
        {props.children}

        <div className="h-[150px] w-full bg-transparent text-center text-transparent ">
          Dick Alan
        </div>
      </div>
    </main>
  );
};
