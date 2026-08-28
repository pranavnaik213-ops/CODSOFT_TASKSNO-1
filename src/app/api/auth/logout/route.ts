import { NextResponse } from 'next/server';
import { clearMockSession } from '@/lib/auth';

export async function POST() {
  try {
    await clearMockSession();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
