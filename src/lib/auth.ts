import { cookies } from 'next/headers';
import db from './db';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  profileId: string; // teacherId or studentId
  classId?: string;  // classId if student
}

export async function getMockSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get('mock_session_email')?.value;

    if (!sessionEmail) return null;

    const user = await db.user.findUnique({
      where: { email: sessionEmail },
      include: {
        teacher: true,
        student: true,
      },
    });

    if (!user) return null;

    let profileId = '';
    let classId = undefined;

    if (user.role === 'TEACHER' && user.teacher) {
      profileId = user.teacher.id;
    } else if (user.role === 'STUDENT' && user.student) {
      profileId = user.student.id;
      classId = user.student.classId;
    } else if (user.role === 'ADMIN') {
      profileId = user.id; // Just use userId for admin
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      profileId,
      classId,
    };
  } catch (error) {
    console.error('Error getting mock session:', error);
    return null;
  }
}

export async function setMockSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set('mock_session_email', email, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'lax',
  });
}

export async function clearMockSession() {
  const cookieStore = await cookies();
  cookieStore.delete('mock_session_email');
}
