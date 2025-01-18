'use client';
import { FormEvent } from "react";

export default function LoginPage() {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
    
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
    
        console.log({ email, password }); 
    };
    
    return (
      <main className="flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-blue-900 rounded shadow-md">
          <h2 className="text-2xl font-bold text-center text-white">Sign in to your account</h2>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium white">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                placeholder="Enter your email"
                required
                />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium white">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 text-black bg-blue-300 rounded-md hover:bg-blue-400"
              >
              Sign in
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-white">
            Don’t have an account yet?{' '}
            <a href="/signup" className="text-blue-200 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </main>
    );
  }