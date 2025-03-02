import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();
    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Email, token, and new password are required." }, { status: 400 });
    }

    // Hash the new password before storing it
    const hashedPassword = await argon2.hash(newPassword);

    // Call your Python API endpoint to verify the token and update the password.
    // We assume an action "reset_password" that checks the token and updates the user record.
    const data = { action: "reset_password", email, token, newPassword: hashedPassword };
    const headersList = headers();
    const domain = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const dbResponse = await fetch(`${protocol}://${domain}/api/call-python-api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const dbResult = await dbResponse.json();

    if (dbResult.status !== "success") {
      return NextResponse.json({ error: dbResult.message || "Failed to reset password." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error("Error in reset-password API:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
