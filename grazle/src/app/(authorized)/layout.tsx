import Auth from "@/components/Auth";
// const [isAuthenticated, setIsAuthenticated] = useState(false);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Auth />
      {children}
    </div>
  );
}
