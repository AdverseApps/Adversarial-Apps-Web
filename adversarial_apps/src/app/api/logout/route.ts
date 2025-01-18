import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // Remove the JWT cookie by setting it to an expired date
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', '', {
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    return response;
}
