import Auth from "@/components/Auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Auth>{children}</Auth>
      </body>
    </html>
  );
}