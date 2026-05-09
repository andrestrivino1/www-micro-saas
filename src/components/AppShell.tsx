import { Header } from './Header';
import { AuthGate } from './AuthGate';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Header />
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </div>
    </AuthGate>
  );
}
