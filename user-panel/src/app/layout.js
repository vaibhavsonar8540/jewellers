import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jewellers | Premium Fine Jewelry",
  description: "Exquisite handmade gold, diamond, and precious stone jewelry collections.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-secondary text-black font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
