import Link from "next/link";
import Image from "next/image";
export const RenderContent = (props: { content: string }) => {
  const links: string[] =
    props.content.match(
      /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g
    ) || [];

  var unSplitText = props.content;

  const text: string[] = unSplitText.split(" ");
  const regex = new RegExp(`(?:jpg|png)`);
  return (
    <div>
      <div>
        {text.map((e: string) => (
          <span>
            {links.includes(e) ? (
              regex.test(e) ? (
                <Link href={e}>
                  <img src={e} className="m-3 h-auto max-w-[300px]" alt={e} />
                </Link>
              ) : (
                <Link
                  className="text-red-500 underline"
                  href={`${e}`}
                >{`${e} `}</Link>
              )
            ) : (
              `${e} `
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
