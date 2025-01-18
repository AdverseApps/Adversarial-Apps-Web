import { NextRequest, NextResponse } from 'next/server';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
    const cookieToken = req.cookies.get('auth_token')?.value;

    if (!cookieToken) {
        return NextResponse.json({ error: "Authentication token required" }, { status: 401 });
    }

    try {
        const decoded: any = jwt.verify(cookieToken, JWT_SECRET);
        return NextResponse.json({ success: true, user: decoded.username }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
