const db = require('../config/db.js');

const studentModel = {
    async createStudent(studentData) {
        const {
            user_id,
            first_name,
            last_name,
            gender,
            date_of_birth,
            phone,
            email,
            address,
            course,
            year,
            guardian_name,
            guardian_phone
        } = studentData;

        const query = `
            INSERT INTO students (
                user_id, first_name, last_name, gender, date_of_birth,
                phone, email, address, course, year, guardian_name, guardian_phone
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [
            user_id, first_name, last_name, gender, date_of_birth,
            phone, email, address, course, year, guardian_name, guardian_phone
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllStudents() {
        const query = `
            SELECT s.*, u.username, u.role, u.status as user_status
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            ORDER BY s.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getStudentById(student_id) {
        const query = `
            SELECT s.*, u.username, u.role, u.status as user_status
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE s.student_id = ?
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows[0];
    },

    async getStudentByUserId(user_id) {
        const query = `
            SELECT s.*, u.username, u.role, u.status as user_status
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE s.user_id = ?
        `;
        const { rows } = await db.query(query, [user_id]);
        return rows[0];
    },

    async updateStudent(student_id, studentData) {
        const {
            first_name,
            last_name,
            gender,
            date_of_birth,
            phone,
            email,
            address,
            course,
            year,
            guardian_name,
            guardian_phone
        } = studentData;

        const query = `
            UPDATE students
            SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?,
                phone = ?, email = ?, address = ?, course = ?, year = ?,
                guardian_name = ?, guardian_phone = ?, updated_at = CURRENT_TIMESTAMP
            WHERE student_id = ?
            RETURNING *
        `;
        const values = [
            first_name, last_name, gender, date_of_birth,
            phone, email, address, course, year,
            guardian_name, guardian_phone, student_id
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteStudent(student_id) {
        const query = `
            DELETE FROM students
            WHERE student_id = ?
            RETURNING student_id
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows[0];
    },

    async getStudentsByCourse(course) {
        const query = `
            SELECT s.*, u.username, u.role
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE s.course = ?
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [course]);
        return rows;
    },

    async getStudentsByYear(year) {
        const query = `
            SELECT s.*, u.username, u.role
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE s.year = ?
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [year]);
        return rows;
    }
};

module.exports = studentModel;
