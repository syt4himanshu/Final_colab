const { allocateStudents } = require('../utils/allocationLogic');
const { query } = require('../config/database');

// Mock database
jest.mock('../config/database', () => ({
    query: jest.fn(),
    getConnection: jest.fn(),
}));

describe('Allocation Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('allocateStudents', () => {
        it('should allocate students evenly among teachers', () => {
            const students = [
                { id: 1, year: 1 },
                { id: 2, year: 1 },
                { id: 3, year: 2 },
                { id: 4, year: 2 },
                { id: 5, year: 3 },
                { id: 6, year: 3 },
            ];

            const teachers = [
                { id: 1, max_capacity: 20, allocated_count: 0 },
                { id: 2, max_capacity: 20, allocated_count: 0 },
            ];

            const assignments = allocateStudents({ students, teachers });

            expect(assignments).toHaveLength(6);

            // Check that students are distributed between teachers
            const teacher1Assignments = assignments.filter(a => a.teacher_id === 1);
            const teacher2Assignments = assignments.filter(a => a.teacher_id === 2);

            expect(teacher1Assignments).toHaveLength(3);
            expect(teacher2Assignments).toHaveLength(3);
        });

        it('should respect teacher capacity limits', () => {
            const students = [
                { id: 1, year: 1 },
                { id: 2, year: 1 },
                { id: 3, year: 1 },
                { id: 4, year: 1 },
                { id: 5, year: 1 },
            ];

            const teachers = [
                { id: 1, max_capacity: 2, allocated_count: 0 },
                { id: 2, max_capacity: 3, allocated_count: 0 },
            ];

            const assignments = allocateStudents({ students, teachers });

            expect(assignments).toHaveLength(5);

            const teacher1Assignments = assignments.filter(a => a.teacher_id === 1);
            const teacher2Assignments = assignments.filter(a => a.teacher_id === 2);

            expect(teacher1Assignments).toHaveLength(2);
            expect(teacher2Assignments).toHaveLength(3);
        });

        it('should balance students by year', () => {
            const students = [
                { id: 1, year: 1 },
                { id: 2, year: 1 },
                { id: 3, year: 2 },
                { id: 4, year: 2 },
                { id: 5, year: 3 },
                { id: 6, year: 3 },
                { id: 7, year: 4 },
                { id: 8, year: 4 },
            ];

            const teachers = [
                { id: 1, max_capacity: 20, allocated_count: 0 },
                { id: 2, max_capacity: 20, allocated_count: 0 },
            ];

            const assignments = allocateStudents({ students, teachers });

            // Check year distribution for each teacher
            const teacher1Assignments = assignments.filter(a => a.teacher_id === 1);
            const teacher2Assignments = assignments.filter(a => a.teacher_id === 2);

            const teacher1Years = teacher1Assignments.map(a =>
                students.find(s => s.id === a.student_id).year
            );
            const teacher2Years = teacher2Assignments.map(a =>
                students.find(s => s.id === a.student_id).year
            );

            // Each teacher should have students from different years
            expect(new Set(teacher1Years).size).toBeGreaterThan(1);
            expect(new Set(teacher2Years).size).toBeGreaterThan(1);
        });

        it('should handle empty students array', () => {
            const students = [];
            const teachers = [
                { id: 1, max_capacity: 20, allocated_count: 0 },
            ];

            const assignments = allocateStudents({ students, teachers });

            expect(assignments).toHaveLength(0);
        });

        it('should handle empty teachers array', () => {
            const students = [
                { id: 1, year: 1 },
                { id: 2, year: 2 },
            ];
            const teachers = [];

            const assignments = allocateStudents({ students, teachers });

            expect(assignments).toHaveLength(0);
        });

        it('should handle teachers with existing allocations', () => {
            const students = [
                { id: 1, year: 1 },
                { id: 2, year: 1 },
                { id: 3, year: 2 },
            ];

            const teachers = [
                { id: 1, max_capacity: 5, allocated_count: 2 },
                { id: 2, max_capacity: 5, allocated_count: 0 },
            ];

            const assignments = allocateStudents({ students, teachers });

            expect(assignments).toHaveLength(3);

            // Teacher 1 should get fewer students due to existing allocations
            const teacher1Assignments = assignments.filter(a => a.teacher_id === 1);
            const teacher2Assignments = assignments.filter(a => a.teacher_id === 2);

            expect(teacher1Assignments.length).toBeLessThanOrEqual(teacher2Assignments.length);
        });
    });
});

describe('Allocation API Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle auto-allocation request', async () => {
        const mockStudents = [
            { id: 1, year: 1 },
            { id: 2, year: 2 },
        ];

        const mockTeachers = [
            { id: 1, max_capacity: 20, allocated_count: 0 },
        ];

        query.mockResolvedValueOnce(mockStudents);
        query.mockResolvedValueOnce(mockTeachers);
        query.mockResolvedValueOnce({ insertId: 1 });
        query.mockResolvedValueOnce({ affectedRows: 1 });

        // This would be tested with supertest in a real integration test
        expect(query).toHaveBeenCalledWith(
            'SELECT id, year FROM students WHERE mentor_id IS NULL ORDER BY year'
        );
    });
});
