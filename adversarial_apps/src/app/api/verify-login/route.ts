import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!; // Ensure this is not undefined at runtime

interface DecodedToken extends JwtPayload {
    username: string;
}

export async function GET(req: NextRequest) {
    const cookieToken = req.cookies.get('auth_token')?.value;

    if (!cookieToken) {
        return NextResponse.json({ error: "Authentication token required" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(cookieToken, JWT_SECRET) as JwtPayload | DecodedToken;

        if (typeof decoded !== 'object' || !decoded || !('username' in decoded)) {
            throw new Error("Invalid token structure");
        }

        return NextResponse.json({ success: true, user: (decoded as DecodedToken).username }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
