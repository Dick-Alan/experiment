import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
// import "highlight.js/styles/ir-black.css";

import { api } from "~/utils/api";
import Head from "next/head";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps} appearance={{ baseTheme: dark }}>
      <Head>
        <title>Chat</title>
        <meta name="description" content="x" />
        <link
        // rel="stylesheet"
        // href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/styles/tommorrow-night.css"
        />
      </Head>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
