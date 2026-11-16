import type { Metadata } from "next";
import { Figtree, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const body = Figtree({ variable: "--font-body", subsets: ["latin"] });
const head = Bricolage_Grotesque({ variable: "--font-head", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Hotseat: mock interviews that talk back",
  description: "Sit in the hotseat before the real one. An AI interviewer grills you on your own resume, out loud. Built on Gnani AI voice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${head.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
