import { Header } from './Header';
import { AuthGate } from './AuthGate';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Header />
      <div className="mx-auto w-full max-w-5xl px-6 py-8">{children}</div>
    </AuthGate>
  );
}
