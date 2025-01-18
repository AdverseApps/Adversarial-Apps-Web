'use client';
import { FormEvent, useState } from "react";

// calls API to add user to the database
async function addUserToDatabase(username: string, password: string) {
    const data = { action: "add_user", username, password_hashed: password, company: null };
    const response = await fetch('/api/call-python-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.status === "success") {
        return result.message;
    } else {
        throw new Error (result.message);
    }
}

async function createUserSessionAPI(username: string, password: string) {
    const response = await fetch('/api/create-user-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to create session');
    }

    return result;
}

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        var password = formData.get("password") as string;
        const confirmPassword = formData.get("confirm-password") as string;

        if (password !== confirmPassword) {
            setError("Passwords must match!");
            // return prevents sign up if passwords don't match
            return;
        }

        try {
            // Call function to add user to database
            // the await ensures that we finish this before proceeding in case it errors
            await addUserToDatabase(email, password);

            // If user is successfully added, proceed to JWT creation
            await createUserSessionAPI(email, password);
            password = "" // clear password from memory
            console.log("User signed up, JWT stored in cookie");

        } catch (error: any) {
            setError(error.message || "An error occurred, please try again.");
            console.error("Error:", error);
            // return prevents sign up if there is an error
            return;
        }

        // Redirect to a page after successful sign up
        // window.location.href = '/';

        setError(null); // Reset error after successful submission
    };

    return (
        <main className="flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-blue-900 rounded shadow-md">
                <h2 className="text-2xl font-bold text-center text-white">Create your account</h2>
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white">
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
                        <label htmlFor="password" className="block text-sm font-medium text-white">
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
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-white">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            name="confirm-password"
                            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    {error && (
                        <div className="p-4 bg-red-500 rounded-md">
                            <p className="text-sm white">{error}</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full py-2 text-black bg-blue-300 rounded-md hover:bg-blue-400"
                    >
                        Sign up
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-white">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-300 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </main>
    );
}
