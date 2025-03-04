'use client';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to send reset token.');
      } else {
        toast.success(data.message || 'Reset token sent. Please check your email.');
        // Navigate to the reset password page
        router.push('/reset-password');
      }
    } catch (error) {
      console.error('Error submitting forgot password:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <main className="flex items-center justify-center">
    <div className="w-full max-w-md p-8 bg-blue-900 rounded shadow-md">
    <h2 className="text-2xl font-bold text-center text-white">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Enter your email address
        </label>
        <input 
          type="email" 
          id="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          placeholder="your-email@example.com"
          required
        />
        <button type="submit" className="w-full py-2 text-black bg-blue-300 rounded-md hover:bg-blue-400">
          Send Reset Token
        </button>
      </form>
    </div>
    </main>
  );
}
