const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await query(
            'INSERT INTO users (uid, password, role, status) VALUES (?, ?, ?, ?)',
            ['admin', adminPassword, 'admin', 'active']
        );
        console.log('✅ Admin user created');

        // Create teacher users
        const teacherPasswords = await Promise.all([
            bcrypt.hash('teacher123', 10),
            bcrypt.hash('teacher123', 10),
            bcrypt.hash('teacher123', 10),
        ]);

        const teacherUsers = await Promise.all([
            query(
                'INSERT INTO users (uid, password, role, status) VALUES (?, ?, ?, ?)',
                ['teacher1', teacherPasswords[0], 'teacher', 'active']
            ),
            query(
                'INSERT INTO users (uid, password, role, status) VALUES (?, ?, ?, ?)',
                ['teacher2', teacherPasswords[1], 'teacher', 'active']
            ),
            query(
                'INSERT INTO users (uid, password, role, status) VALUES (?, ?, ?, ?)',
                ['teacher3', teacherPasswords[2], 'teacher', 'active']
            ),
        ]);

        // Create teachers
        const teachers = await Promise.all([
            query(
                'INSERT INTO teachers (user_id, first_name, last_name, email, contact, max_capacity) VALUES (?, ?, ?, ?, ?, ?)',
                [teacherUsers[0].insertId, 'John', 'Smith', 'john.smith@university.edu', '+1234567890', 20]
            ),
            query(
                'INSERT INTO teachers (user_id, first_name, last_name, email, contact, max_capacity) VALUES (?, ?, ?, ?, ?, ?)',
                [teacherUsers[1].insertId, 'Sarah', 'Johnson', 'sarah.johnson@university.edu', '+1234567891', 20]
            ),
            query(
                'INSERT INTO teachers (user_id, first_name, last_name, email, contact, max_capacity) VALUES (?, ?, ?, ?, ?, ?)',
                [teacherUsers[2].insertId, 'Michael', 'Brown', 'michael.brown@university.edu', '+1234567892', 20]
            ),
        ]);

        console.log('✅ Teachers created');

        // Create student users
        const studentPasswords = await Promise.all(
            Array.from({ length: 30 }, () => bcrypt.hash('student123', 10))
        );

        const studentUsers = [];
        for (let i = 1; i <= 30; i++) {
            const result = await query(
                'INSERT INTO users (uid, password, role, status) VALUES (?, ?, ?, ?)',
                [`student${i}`, studentPasswords[i - 1], 'student', 'active']
            );
            studentUsers.push(result);
        }

        // Create students with varied data
        const students = [];
        for (let i = 1; i <= 30; i++) {
            const year = Math.floor((i - 1) / 8) + 1; // Distribute across 4 years
            const semester = year * 2;
            const section = String.fromCharCode(65 + (i % 3)); // A, B, C
            const sgpa = (3.0 + Math.random() * 1.5).toFixed(2); // 3.0 - 4.5
            const softSkillsRating = Math.floor(Math.random() * 5) + 1; // 1-5
            const careerGoals = ['Placement', 'Higher Studies', 'Entrepreneurship'];
            const careerGoal = careerGoals[Math.floor(Math.random() * careerGoals.length)];

            const result = await query(
                `INSERT INTO students (
                    user_id, first_name, last_name, uid, semester, section, year, sgpa, 
                    career_goal, soft_skills_rating, email, mobile, father_name, mother_name,
                    permanent_address, linkedin_id, strengths, weaknesses, opportunities, challenges
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    studentUsers[i - 1].insertId,
                    `Student${i}`,
                    `Last${i}`,
                    `student${i}`,
                    semester,
                    section,
                    year,
                    sgpa,
                    careerGoal,
                    softSkillsRating,
                    `student${i}@university.edu`,
                    `+1234567${String(i).padStart(3, '0')}`,
                    `Father${i}`,
                    `Mother${i}`,
                    `${i} Main Street, City, State`,
                    `linkedin.com/in/student${i}`,
                    `Strong analytical skills, Good communication`,
                    `Needs improvement in time management`,
                    `Internship opportunities, Research projects`,
                    `Balancing academics and extracurricular activities`
                ]
            );
            students.push(result);
        }

        console.log('✅ Students created');

        // Create some academic records
        for (let i = 1; i <= 30; i++) {
            const studentId = students[i - 1].insertId;
            const year = Math.floor((i - 1) / 8) + 1;

            for (let sem = 1; sem <= year * 2; sem++) {
                const sgpa = (3.0 + Math.random() * 1.5).toFixed(2);
                await query(
                    'INSERT INTO academic_records (student_id, semester, sgpa) VALUES (?, ?, ?)',
                    [studentId, sem, sgpa]
                );
            }
        }

        console.log('✅ Academic records created');

        // Create some sample allocations
        const allocationCount = Math.floor(students.length * 0.7); // 70% of students allocated
        for (let i = 0; i < allocationCount; i++) {
            const teacherId = (i % teachers.length) + 1;
            const studentId = students[i].insertId;

            await query(
                'INSERT INTO allocations (teacher_id, student_id) VALUES (?, ?)',
                [teacherId, studentId]
            );

            // Update student mentor_id
            await query(
                'UPDATE students SET mentor_id = ? WHERE id = ?',
                [teacherId, studentId]
            );
        }

        console.log('✅ Sample allocations created');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample Credentials:');
        console.log('Admin: admin / admin123');
        console.log('Teacher 1: teacher1 / teacher123');
        console.log('Teacher 2: teacher2 / teacher123');
        console.log('Teacher 3: teacher3 / teacher123');
        console.log('Student 1: student1 / student123');
        console.log('Student 2: student2 / student123');
        console.log('... (and so on for students 3-30)');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeder if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };
