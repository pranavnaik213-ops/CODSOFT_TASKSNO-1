'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function createTeacher(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const employeeId = formData.get('employeeId') as string;
    const department = formData.get('department') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!email || !name || !employeeId || !department) {
      return { error: 'Required fields missing' };
    }

    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: 'Email already exists' };
    }

    // Check if employee ID exists
    const existingEmp = await db.teacher.findUnique({ where: { employeeId } });
    if (existingEmp) {
      return { error: 'Employee ID already assigned' };
    }

    // Create user and teacher profile
    await db.user.create({
      data: {
        email,
        password: 'teacherpassword', // Default password
        name,
        role: 'TEACHER',
        teacher: {
          create: {
            employeeId,
            department,
            phone: phone || 'N/A',
            address: address || 'N/A',
          },
        },
      },
    });

    revalidatePath('/admin/teachers');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return { error: error.message || 'Failed to create teacher' };
  }
}

export async function deleteTeacher(teacherId: string) {
  try {
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return { error: 'Teacher not found' };
    }

    // Delete the user record (onDelete: Cascade will delete teacher record)
    await db.user.delete({
      where: { id: teacher.userId },
    });

    revalidatePath('/admin/teachers');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting teacher:', error);
    return { error: error.message || 'Failed to delete teacher' };
  }
}
