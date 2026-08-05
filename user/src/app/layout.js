import "./globals.css";

export const metadata = {
  title: "Jewellers Storefront",
  description: "E-Commerce Jewellers Storefront Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900">
      
        <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
