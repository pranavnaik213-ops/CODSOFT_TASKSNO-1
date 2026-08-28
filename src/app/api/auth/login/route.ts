import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { setMockSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real app we'd hash and compare passwords, but since this is a demonstration
    // we'll fetch the user and compare the password directly.
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set the cookie session
    await setMockSession(user.email);

    // Return the user details and default redirect path
    let redirectPath = '/';
    if (user.role === 'ADMIN') redirectPath = '/admin';
    else if (user.role === 'TEACHER') redirectPath = '/teacher';
    else if (user.role === 'STUDENT') redirectPath = '/student';

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectPath,
    });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}
