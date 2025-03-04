'use client';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword, action: 'reset_password' })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Failed to reset password.');
      } else {
        toast.success(data.message || 'Password reset successfully.');
        // Optionally redirect to login page or dashboard
        router.push('/login');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <main className="flex items-center justify-center">
    <div className="w-full max-w-md p-8 bg-blue-900 rounded shadow-md">
    <h2 className="text-2xl font-bold text-white mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-white">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          required
        />
        <label className="block text-sm font-medium text-white">Reset Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          required
        />
        <label className="block text-sm font-medium text-white">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          required
        />
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded">
          Reset Password
        </button>
      </form>
    </div>
    </main>
  );
}
