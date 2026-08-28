'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function createStudent(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const rollNumber = formData.get('rollNumber') as string;
    const parentName = formData.get('parentName') as string;
    const parentPhone = formData.get('parentPhone') as string;
    const address = formData.get('address') as string;
    const dateOfBirthStr = formData.get('dateOfBirth') as string;
    const gender = formData.get('gender') as string;
    const classId = formData.get('classId') as string;

    if (!email || !name || !rollNumber || !classId) {
      return { error: 'Required fields missing' };
    }

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: 'Email already exists' };
    }

    // Create user and student profile
    await db.user.create({
      data: {
        email,
        password: 'studentpassword', // Default password
        name,
        role: 'STUDENT',
        student: {
          create: {
            rollNumber,
            parentName: parentName || 'N/A',
            parentPhone: parentPhone || 'N/A',
            address: address || 'N/A',
            dateOfBirth: new Date(dateOfBirthStr || Date.now()),
            gender: gender || 'OTHER',
            classId,
          },
        },
      },
    });

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating student:', error);
    return { error: error.message || 'Failed to create student' };
  }
}

export async function deleteStudent(studentId: string) {
  try {
    // Find the student to get the userId
    const student = await db.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return { error: 'Student not found' };
    }

    // Delete the user record (onDelete: Cascade will delete the student profile automatically)
    await db.user.delete({
      where: { id: student.userId },
    });

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return { error: error.message || 'Failed to delete student' };
  }
}
