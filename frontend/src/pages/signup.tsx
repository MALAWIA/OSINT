import SignupForm from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - NSE Intelligence Platform',
  description: 'Create your account to access the NSE Intelligence Platform',
};

export default function SignupPage() {
  return <SignupForm />;
}
