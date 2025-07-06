import { auth } from '@/lib/auth';

export async function getAuthUserFromSession() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return {
    id: session.user.id || '',
    email: session.user.email,
    name: session.user.name || session.user.email,
    hasCompletedOnboarding: (session.user as any).hasCompletedOnboarding || false,
  };
}
