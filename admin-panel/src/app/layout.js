import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Panel | Velora Fine Jewelry",
  description: "E-commerce Administration and Management Portal.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
