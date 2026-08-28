'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export interface AttendanceRecordInput {
  studentId: string;
  status: string; // 'PRESENT', 'ABSENT', 'LATE'
  remarks?: string;
}

export async function saveAttendance(
  classId: string,
  dateStr: string,
  records: AttendanceRecordInput[]
) {
  try {
    if (!classId || !dateStr || !records || records.length === 0) {
      return { error: 'Invalid payload' };
    }

    const parsedDate = new Date(dateStr);
    parsedDate.setHours(0, 0, 0, 0); // Reset to midnight for consistent queries

    // Run in a transaction
    await db.$transaction(
      records.map((rec) => {
        return db.attendance.upsert({
          where: {
            studentId_date: {
              studentId: rec.studentId,
              date: parsedDate,
            },
          },
          update: {
            status: rec.status,
            remarks: rec.remarks || '',
          },
          create: {
            studentId: rec.studentId,
            classId,
            date: parsedDate,
            status: rec.status,
            remarks: rec.remarks || '',
          },
        });
      })
    );

    revalidatePath('/teacher/attendance');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return { error: error.message || 'Failed to record attendance logs' };
  }
}
