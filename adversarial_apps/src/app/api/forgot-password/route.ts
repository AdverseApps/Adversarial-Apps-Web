import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Call the Python API with the new action "send_reset_token"
    const data = { action: "send_reset_token", email };
    const headersList = headers();
    const domain = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const pythonResponse = await fetch(`${protocol}://${domain}/api/call-python-api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const dbResult = await pythonResponse.json();

    // Log the full response for debugging purposes
    console.log('Python API response:', dbResult);

    if (dbResult.status !== "success") {
      // Forward the exact error message from the Python API to the client
      return NextResponse.json(
        { error: dbResult.message || "Failed to generate reset token" },
        { status: 400 }
      );
    }

    const { token } = dbResult;

    // Setup Nodemailer transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 587),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL, // your "from" email address
      to: email,
      subject: 'Your Password Reset Token',
      text: `Your password reset token is:\n\n${token}\n\nThis token is valid for 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'If that email exists, a reset token has been sent.',
    });
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
