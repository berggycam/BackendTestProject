const db = require('../config/db.js');

const messAttendanceModel = {
    async markAttendance(attendanceData) {
        const {
            student_id,
            date,
            meal_type,
            status
        } = attendanceData;

        const query = `
            INSERT INTO mess_attendance (student_id, date, meal_type, status)
            VALUES (?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, date, meal_type, status];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllAttendance() {
        const query = `
            SELECT ma.*, s.first_name, s.last_name, s.student_id
            FROM mess_attendance ma
            JOIN students s ON ma.student_id = s.student_id
            ORDER BY ma.date DESC, ma.meal_type, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getAttendanceById(attendance_id) {
        const query = `
            SELECT ma.*, s.first_name, s.last_name, s.student_id
            FROM mess_attendance ma
            JOIN students s ON ma.student_id = s.student_id
            WHERE ma.attendance_id = ?
        `;
        const { rows } = await db.query(query, [attendance_id]);
        return rows[0];
    },

    async getAttendanceByStudent(student_id) {
        const query = `
            SELECT ma.*, s.first_name, s.last_name
            FROM mess_attendance ma
            JOIN students s ON ma.student_id = s.student_id
            WHERE ma.student_id = ?
            ORDER BY ma.date DESC, ma.meal_type
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getAttendanceByDate(date) {
        const query = `
            SELECT ma.*, s.first_name, s.last_name, s.student_id
            FROM mess_attendance ma
            JOIN students s ON ma.student_id = s.student_id
            WHERE ma.date = ?
            ORDER BY ma.meal_type, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    },

    async getAttendanceByDateRange(start_date, end_date) {
        const query = `
            SELECT ma.*, s.first_name, s.last_name, s.student_id
            FROM mess_attendance ma
            JOIN students s ON ma.student_id = s.student_id
            WHERE ma.date BETWEEN ? AND ?
            ORDER BY ma.date DESC, ma.meal_type, s.last_name, s.first_name
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getAttendanceByMeal(date, meal_type) {
        const query = `
            SELECT ma.*, s.first_name, s.last_name, s.student_id
            FROM mess_attendance ma
            JOIN students s ON ma.student_id = s.student_id
            WHERE ma.date = ? AND ma.meal_type = ?
            ORDER BY s.last_name, s.first_name
        `;
        const values = [date, meal_type];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async updateAttendance(attendance_id, attendanceData) {
        const { status } = attendanceData;

        const query = `
            UPDATE mess_attendance
            SET status = ?
            WHERE attendance_id = ?
            RETURNING *
        `;
        const values = [status, attendance_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteAttendance(attendance_id) {
        const query = `
            DELETE FROM mess_attendance
            WHERE attendance_id = ?
            RETURNING attendance_id
        `;
        const { rows } = await db.query(query, [attendance_id]);
        return rows[0];
    },

    async getAttendanceStats(date) {
        const query = `
            SELECT 
                meal_type,
                COUNT(*) as total_students,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                ROUND(COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
            FROM mess_attendance
            WHERE date = ?
            GROUP BY meal_type
            ORDER BY meal_type
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    },

    async getStudentAttendanceStats(student_id, start_date, end_date) {
        const query = `
            SELECT 
                COUNT(*) as total_meals,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                ROUND(COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
            FROM mess_attendance
            WHERE student_id = ? AND date BETWEEN ? AND ?
        `;
        const values = [student_id, start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getMonthlyStats(year, month) {
        const query = `
            SELECT 
                DATE(date) as attendance_date,
                meal_type,
                COUNT(*) as total_students,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count
            FROM mess_attendance
            WHERE YEAR(date) = ? AND MONTH(date) = ?
            GROUP BY DATE(date), meal_type
            ORDER BY attendance_date, meal_type
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async bulkMarkAttendance(attendanceRecords) {
        const query = `
            INSERT INTO mess_attendance (student_id, date, meal_type, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE status = VALUES(status)
        `;
        
        const values = attendanceRecords.map(record => 
            [record.student_id, record.date, record.meal_type, record.status]
        );
        
        const { rows } = await db.query(query, [values]);
        return rows;
    }
};

module.exports = messAttendanceModel;
