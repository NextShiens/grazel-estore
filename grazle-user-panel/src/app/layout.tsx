import "./globals.css";
import type { Metadata } from "next";
import Menu from "@/components/menu";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import InitCart from "@/components/initCart";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Inter, Poppins } from "next/font/google";
import ClientProvider from "@/components/client-provider";
// const inter = Inter({ subsets: ["latin"] });

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Grazel Website",
  description: "Modern shopping plateform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={poppins.className}
      // className={`${poppins.variable}`}
    >
      {/* <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet"
      /> */}
      <body
      // style={{ fontFamily: '"Poppins", sans-serif' }}
      // className={inter.className}
      >
        <ClientProvider>
          <ToastContainer />
          <Navbar />
          <InitCart />
          {children}

          <Footer />
          <Menu />
        </ClientProvider>
      </body>
    </html>
  );
}
