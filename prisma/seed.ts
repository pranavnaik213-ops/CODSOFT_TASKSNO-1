import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear database
  await prisma.fee.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@edumanage.com',
      password: 'adminpassword',
      name: 'Dr. Sarah Jenkins',
      role: 'ADMIN',
    },
  });

  console.log('Created Admin:', adminUser.email);

  // 3. Create Teachers
  const teacherData = [
    {
      email: 'teacher.smith@edumanage.com',
      password: 'teacherpassword',
      name: 'John Smith',
      employeeId: 'T101',
      department: 'Mathematics',
      phone: '+1 555-0101',
      address: '123 Maple St, Springfield',
    },
    {
      email: 'teacher.davis@edumanage.com',
      password: 'teacherpassword',
      name: 'Emily Davis',
      employeeId: 'T102',
      department: 'Science',
      phone: '+1 555-0102',
      address: '456 Oak Ave, Springfield',
    },
    {
      email: 'teacher.jones@edumanage.com',
      password: 'teacherpassword',
      name: 'Robert Jones',
      employeeId: 'T103',
      department: 'English',
      phone: '+1 555-0103',
      address: '789 Pine Rd, Springfield',
    },
  ];

  const teachers: any[] = [];
  for (const t of teacherData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password: t.password,
        name: t.name,
        role: 'TEACHER',
        teacher: {
          create: {
            employeeId: t.employeeId,
            department: t.department,
            phone: t.phone,
            address: t.address,
          },
        },
      },
      include: {
        teacher: true,
      },
    });
    teachers.push(user.teacher);
    console.log('Created Teacher:', user.email);
  }

  // 4. Create Classes
  const classA = await prisma.class.create({
    data: {
      name: 'Grade 10-A',
      teacherId: teachers[0].id, // John Smith is the class teacher
    },
  });

  const classB = await prisma.class.create({
    data: {
      name: 'Grade 11-A',
      teacherId: teachers[1].id, // Emily Davis is the class teacher
    },
  });

  console.log('Created Classes:', classA.name, ',', classB.name);

  // 5. Create Subjects
  const subjects = [
    {
      name: 'Mathematics',
      code: 'MATH10',
      classId: classA.id,
      teacherId: teachers[0].id, // John Smith
    },
    {
      name: 'Physics',
      code: 'PHYS10',
      classId: classA.id,
      teacherId: teachers[1].id, // Emily Davis
    },
    {
      name: 'Chemistry',
      code: 'CHEM11',
      classId: classB.id,
      teacherId: teachers[1].id, // Emily Davis
    },
    {
      name: 'English Literature',
      code: 'ENGL11',
      classId: classB.id,
      teacherId: teachers[2].id, // Robert Jones
    },
  ];

  const createdSubjects: any[] = [];
  for (const sub of subjects) {
    const created = await prisma.subject.create({
      data: sub,
    });
    createdSubjects.push(created);
  }
  console.log(`Created ${createdSubjects.length} subjects.`);

  // 6. Create Students
  const studentData = [
    {
      email: 'student.alex@edumanage.com',
      password: 'studentpassword',
      name: 'Alex Rivera',
      rollNumber: '1001',
      parentName: 'Maria Rivera',
      parentPhone: '+1 555-0201',
      address: '11 Elm Dr, Springfield',
      dateOfBirth: new Date('2011-04-12'),
      gender: 'MALE',
      classId: classA.id,
    },
    {
      email: 'student.bella@edumanage.com',
      password: 'studentpassword',
      name: 'Bella Chen',
      rollNumber: '1002',
      parentName: 'David Chen',
      parentPhone: '+1 555-0202',
      address: '22 Cedar Ave, Springfield',
      dateOfBirth: new Date('2011-09-25'),
      gender: 'FEMALE',
      classId: classA.id,
    },
    {
      email: 'student.connor@edumanage.com',
      password: 'studentpassword',
      name: 'Connor McDonald',
      rollNumber: '1101',
      parentName: 'Lisa McDonald',
      parentPhone: '+1 555-0203',
      address: '33 Birch Ln, Springfield',
      dateOfBirth: new Date('2010-02-14'),
      gender: 'MALE',
      classId: classB.id,
    },
    {
      email: 'student.diana@edumanage.com',
      password: 'studentpassword',
      name: 'Diana Prince',
      rollNumber: '1102',
      parentName: 'Hippolyta Prince',
      parentPhone: '+1 555-0204',
      address: '44 Paradise Rd, Springfield',
      dateOfBirth: new Date('2010-07-04'),
      gender: 'FEMALE',
      classId: classB.id,
    },
  ];

  const students: any[] = [];
  for (const s of studentData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        password: s.password,
        name: s.name,
        role: 'STUDENT',
        student: {
          create: {
            rollNumber: s.rollNumber,
            parentName: s.parentName,
            parentPhone: s.parentPhone,
            address: s.address,
            dateOfBirth: s.dateOfBirth,
            gender: s.gender,
            classId: s.classId,
          },
        },
      },
      include: {
        student: true,
      },
    });
    students.push(user.student);
    console.log('Created Student:', user.email);
  }

  // 7. Create Attendance Records
  // We'll seed attendance for the last 5 days
  const days = [1, 2, 3, 4, 5];
  const today = new Date();
  
  for (const dayOffset of days) {
    const date = new Date();
    date.setDate(today.getDate() - dayOffset);
    // Format to midnight
    date.setHours(0, 0, 0, 0);

    for (const student of students) {
      // Determine status (mostly present, some late/absent)
      let status = 'PRESENT';
      let remarks = 'On time';
      
      const rand = Math.random();
      if (rand > 0.9) {
        status = 'ABSENT';
        remarks = 'Unexcused absence';
      } else if (rand > 0.8) {
        status = 'LATE';
        remarks = 'Late by 10 minutes';
      }

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date,
          status,
          remarks,
        },
      });
    }
  }
  console.log('Seeded attendance records for the last 5 days.');

  // 8. Create Exams & Results
  const examData = [
    {
      name: 'Midterm Exam',
      subjectId: createdSubjects[0].id, // Mathematics (Class A)
      maxMarks: 100,
      date: new Date('2026-08-15'),
      results: [
        { rollNumber: '1001', marks: 84.5, remarks: 'Good logic, check calculations' },
        { rollNumber: '1002', marks: 95.0, remarks: 'Excellent performance!' },
      ],
    },
    {
      name: 'Midterm Exam',
      subjectId: createdSubjects[1].id, // Physics (Class A)
      maxMarks: 100,
      date: new Date('2026-08-18'),
      results: [
        { rollNumber: '1001', marks: 78.0, remarks: 'Formulas are correct, units missed' },
        { rollNumber: '1002', marks: 88.5, remarks: 'Great analytical skills' },
      ],
    },
    {
      name: 'Organic Chem Quiz',
      subjectId: createdSubjects[2].id, // Chemistry (Class B)
      maxMarks: 50,
      date: new Date('2026-08-20'),
      results: [
        { rollNumber: '1101', marks: 42.0, remarks: 'Very good' },
        { rollNumber: '1102', marks: 48.0, remarks: 'Almost perfect!' },
      ],
    },
    {
      name: 'Shakespeare Essay',
      subjectId: createdSubjects[3].id, // English Lit (Class B)
      maxMarks: 50,
      date: new Date('2026-08-22'),
      results: [
        { rollNumber: '1101', marks: 38.5, remarks: 'Strong arguments, minor grammar errors' },
        { rollNumber: '1102', marks: 46.0, remarks: 'Compelling writing style!' },
      ],
    },
  ];

  for (const ex of examData) {
    const exam = await prisma.exam.create({
      data: {
        name: ex.name,
        subjectId: ex.subjectId,
        maxMarks: ex.maxMarks,
        date: ex.date,
      },
    });

    for (const res of ex.results) {
      const student = students.find((s) => s.rollNumber === res.rollNumber);
      if (student) {
        await prisma.examResult.create({
          data: {
            examId: exam.id,
            studentId: student.id,
            marksObtained: res.marks,
            remarks: res.remarks,
          },
        });
      }
    }
  }
  console.log('Seeded exam schedules and results.');

  // 9. Create Fees
  for (const student of students) {
    // 1st Fee: Annual Library Fee (Paid)
    await prisma.fee.create({
      data: {
        studentId: student.id,
        title: 'Annual Library Fee',
        amount: 150.0,
        dueDate: new Date('2026-06-30'),
        status: 'PAID',
        paidAt: new Date('2026-06-25'),
      },
    });

    // 2nd Fee: Term 1 Tuition Fee (Paid for Alex & Bella, Pending for Connor, Overdue for Diana)
    let tuitionStatus = 'PAID';
    let tuitionPaidDate: Date | null = new Date('2026-07-28');

    if (student.rollNumber === '1101') {
      tuitionStatus = 'PENDING';
      tuitionPaidDate = null;
    } else if (student.rollNumber === '1102') {
      tuitionStatus = 'OVERDUE';
      tuitionPaidDate = null;
    }

    await prisma.fee.create({
      data: {
        studentId: student.id,
        title: 'Term 1 Tuition Fee',
        amount: 1200.0,
        dueDate: new Date('2026-08-01'),
        status: tuitionStatus,
        paidAt: tuitionPaidDate,
      },
    });

    // 3rd Fee: Laboratory Fee Q3 (Pending for all)
    await prisma.fee.create({
      data: {
        studentId: student.id,
        title: 'Laboratory Fee Q3',
        amount: 250.0,
        dueDate: new Date('2026-09-15'),
        status: 'PENDING',
        paidAt: null,
      },
    });
  }

  console.log('Seeded student fee structures.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
