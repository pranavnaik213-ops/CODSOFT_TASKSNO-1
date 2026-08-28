'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function createExam(
  subjectId: string,
  name: string,
  dateStr: string,
  maxMarks: number
) {
  try {
    if (!subjectId || !name || !dateStr || !maxMarks) {
      return { error: 'Required fields missing' };
    }

    const exam = await db.exam.create({
      data: {
        subjectId,
        name,
        date: new Date(dateStr),
        maxMarks: Number(maxMarks),
      },
    });

    revalidatePath('/teacher/marks');
    return { success: true, exam };
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return { error: error.message || 'Failed to schedule exam' };
  }
}

export interface ExamResultInput {
  studentId: string;
  marksObtained: number;
  remarks?: string;
}

export async function saveExamResults(
  examId: string,
  results: ExamResultInput[]
) {
  try {
    if (!examId || !results || results.length === 0) {
      return { error: 'Invalid payload' };
    }

    // Run in a transaction
    await db.$transaction(
      results.map((res) => {
        return db.examResult.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: res.studentId,
            },
          },
          update: {
            marksObtained: Number(res.marksObtained),
            remarks: res.remarks || '',
          },
          create: {
            examId,
            studentId: res.studentId,
            marksObtained: Number(res.marksObtained),
            remarks: res.remarks || '',
          },
        });
      })
    );

    revalidatePath('/teacher/marks');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving exam results:', error);
    return { error: error.message || 'Failed to record grades' };
  }
}
