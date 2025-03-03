// app/forgot-password/page.tsx
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Forgot Password</h2>
        <label htmlFor="email" className="block text-white mb-2">
          Enter your email address
        </label>
        <input 
          type="email" 
          id="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-2 mb-4 rounded border border-gray-300"
          placeholder="your-email@example.com"
          required
        />
        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send Reset Token
        </button>
      </form>
    </div>
  );
}
