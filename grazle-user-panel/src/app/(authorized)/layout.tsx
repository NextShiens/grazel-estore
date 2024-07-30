import ProtectedRoute from '@/components/ProtectedRoute';

export default function AuthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}