import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

interface DecodedToken {
    username: string;
    exp: number;
    iat: number; // issued at time
}

export async function GET(req: NextRequest) {
    const cookieToken = req.cookies.get('auth_token')?.value;

    if (!cookieToken) {
        return NextResponse.json({ error: "Authentication token required" }, { status: 401 });
    }

    try {
        const decoded: DecodedToken = jwt.verify(cookieToken, JWT_SECRET) as DecodedToken;
        return NextResponse.json({ success: true, user: decoded.username }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
