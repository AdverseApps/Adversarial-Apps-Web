import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from "jsonwebtoken";
import argon2 from "argon2";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Environment variable JWT_SECRET must be set.");
}

interface AuthRequestBody {
    username: string;
    password: string;
}
async function validatePassword(username: string) {
    const data = { action: "get_password", username };
    const headersList = headers();
    const domain = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    // this is an api on server code, so next.js can't use relative paths
    // hence the need to build the full url
    const response = await fetch(`${protocol}://${domain}/api/call-python-api`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.status === "success") {
        return result.password;
    } else {
        throw new Error (result.message);
    }
}

export async function POST(req: NextRequest) {

    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        let { username, password }: AuthRequestBody = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
        }

        // grabs password from database, compares to input password to authenticate
        const storedPassword = await validatePassword(username);

        const isAuthenticated = await argon2.verify(storedPassword, password);

        password = ""; // clear password from memory

        if (!isAuthenticated) {
            return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
        }

        // Create and sign the JWT, username stored to identify user for api requests
        const payload = { username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

        // stores cookie with JWT token
        const isProduction = process.env.NODE_ENV === "production";
        const response = NextResponse.json({ success: true });
        response.headers.set("Set-Cookie", `auth_token=${token}; HttpOnly; Path=/; Max-Age=43200; Secure=${isProduction}; SameSite=Strict`);
        return response;
    } catch (error) {
        console.error("Error creating JWT:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
