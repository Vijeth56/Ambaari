import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import awsconfig from "../src/aws-exports";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({ ...awsconfig, ssr: true });

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
