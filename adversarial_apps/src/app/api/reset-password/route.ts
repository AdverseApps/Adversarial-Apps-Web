import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();
    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Email, token, and new password are required." }, { status: 400 });
    }

    // Optionally, you can hash newPassword here if you don't plan to do it in Python.
    // If your Python API is already hashing, you can send it in plain text.
    // const hashedPassword = await argon2.hash(newPassword);

    // Call your Python API for resetting password
    const data = { action: "reset_password", email, token, newPassword };
    const headersList = headers();
    const domain = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const pythonResponse = await fetch(`${protocol}://${domain}/api/call-python-api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const pythonResult = await pythonResponse.json();

    if (pythonResult.status !== "success") {
      return NextResponse.json({ error: pythonResult.message || "Failed to reset password." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: pythonResult.message });
  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
