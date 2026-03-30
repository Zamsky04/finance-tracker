import { AppShell } from '@/components/app-shell';
import { requireUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const metadata = user.user_metadata ?? {};

  return (
    <AppShell
      user={{
        id: user.id,
        name:
          metadata.full_name ||
          metadata.name ||
          user.email?.split('@')[0] ||
          'User',
        email: user.email || '',
      }}
    >
      {children}
    </AppShell>
  );
}