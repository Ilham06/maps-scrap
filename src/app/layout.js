import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "WFC Cafe Finder — Temukan Cafe Unik di Kotamu",
  description:
    "Bosen WFC di cafe yang itu-itu aja? Temukan cafe unik dan hidden gem di kotamu dengan AI-powered vibe descriptions dan WFC score.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
