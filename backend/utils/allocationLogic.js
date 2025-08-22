'use strict';

/*
 Smart allocation algorithm:
 - Distribute students evenly among teachers
 - Respect capacity
 - Balance by academic year (1-4)
*/

function groupByYear(students) {
    return students.reduce((acc, s) => {
        const y = Number(s.year) || 0;
        acc[y] = acc[y] || [];
        acc[y].push(s);
        return acc;
    }, {});
}

function allocateStudents({ students, teachers }) {
    // Initialize teacher state
    const teacherState = teachers.map((t) => ({
        id: t.id,
        max: Number(t.max_capacity) || 20,
        load: Number(t.allocated_count) || 0,
        byYear: { 1: 0, 2: 0, 3: 0, 4: 0 },
    }));

    const byYearStudents = groupByYear(students);

    const assignments = [];
    // Aim: up to 5 per year per teacher
    const perYearTarget = 5;

    // First pass: round-robin per year
    for (const year of [1, 2, 3, 4]) {
        const queue = [...(byYearStudents[year] || [])];
        let index = 0;
        while (queue.length) {
            const s = queue.shift();
            let placed = false;
            for (let i = 0; i < teacherState.length; i++) {
                const tIdx = (index + i) % teacherState.length;
                const t = teacherState[tIdx];
                if (t.load < t.max && t.byYear[year] < perYearTarget) {
                    assignments.push({ teacher_id: t.id, student_id: s.id });
                    t.load += 1;
                    t.byYear[year] += 1;
                    index = (tIdx + 1) % teacherState.length;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                // push to second pass
                queue.unshift(s);
                break;
            }
        }
    }

    // Second pass: fill remaining capacity irrespective of year
    const remaining = [];
    for (const year of [1, 2, 3, 4]) {
        for (const s of byYearStudents[year] || []) {
            if (!assignments.find((a) => a.student_id === s.id)) remaining.push(s);
        }
    }
    let idx = 0;
    while (remaining.length) {
        const s = remaining.shift();
        let placed = false;
        for (let i = 0; i < teacherState.length; i++) {
            const tIdx = (idx + i) % teacherState.length;
            const t = teacherState[tIdx];
            if (t.load < t.max) {
                assignments.push({ teacher_id: t.id, student_id: s.id });
                t.load += 1;
                idx = (tIdx + 1) % teacherState.length;
                placed = true;
                break;
            }
        }
        if (!placed) break; // no capacity left
    }

    return assignments;
}

module.exports = { allocateStudents };


