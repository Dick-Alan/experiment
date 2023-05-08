import Link from "next/link";
import Image from "next/image";
export const RenderContent = (props: { content: string }) => {
  const links: string[] =
    props.content.match(
      /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g
    ) || [];

  const unSplitText = props.content;

  const text: string[] = unSplitText.split(" ");
  const regex = new RegExp(`(?:jpg|png)`);
  return (
    <div className="flex gap-1">
      <pre className="max-w-xl">
        {text.map((e: string) => (
          <span className="object-contain font-normal" key={e}>
            {links.includes(e) ? (
              regex.test(e) ? (
                <Link className="h-auto max-w-[300px] object-contain" href={e}>
                  <img
                    src={e}
                    className="hover: m-3 h-auto max-w-[300px]     object-scale-down "
                    alt={e}
                  />
                </Link>
              ) : (
                <Link
                  className="text-purple-500 underline  hover:text-green-500"
                  href={`${e}`}
                >{`${e} `}</Link>
              )
            ) : (
              `${e} `
            )}
          </span>
        ))}
      </pre>
    </div>
  );
};
