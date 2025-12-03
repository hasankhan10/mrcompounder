import { Metadata } from 'next';
import { LoginForm } from '@/components/public/LoginForm';

export const metadata: Metadata = {
  title: 'Login - Access Your Dashboard',
  description: 'Secure login for clinic staff and administrators. Manage your patient queue efficiently.',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 p-4">
      <LoginForm />
    </div>
  );
}
