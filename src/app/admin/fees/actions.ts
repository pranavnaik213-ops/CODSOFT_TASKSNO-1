'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';

export async function markFeePaid(feeId: string) {
  try {
    await db.fee.update({
      where: { id: feeId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    revalidatePath('/admin/fees');
    return { success: true };
  } catch (error: any) {
    console.error('Error marking fee as paid:', error);
    return { error: error.message || 'Failed to update fee status' };
  }
}

export async function createFeeInvoice(formData: FormData) {
  try {
    const studentId = formData.get('studentId') as string;
    const title = formData.get('title') as string;
    const amountStr = formData.get('amount') as string;
    const dueDateStr = formData.get('dueDate') as string;

    if (!studentId || !title || !amountStr || !dueDateStr) {
      return { error: 'Required fields missing' };
    }

    await db.fee.create({
      data: {
        studentId,
        title,
        amount: parseFloat(amountStr),
        dueDate: new Date(dueDateStr),
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/fees');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating fee invoice:', error);
    return { error: error.message || 'Failed to create fee invoice' };
  }
}
