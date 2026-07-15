'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg py-3 font-semibold"
    >
      Logout
    </button>
  );
}
