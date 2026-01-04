const db = require('../config/db.js');

const studentAttendanceModel = {
    async markAttendance(attendanceData) {
        const {
            student_id,
            date,
            status,
            marked_by,
            remarks = null
        } = attendanceData;

        const query = `
            INSERT INTO student_attendance (student_id, date, status, marked_by, remarks)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, date, status, marked_by, remarks];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllAttendance() {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            ORDER BY sa.date DESC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getAttendanceById(attendance_id) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.attendance_id = ?
        `;
        const { rows } = await db.query(query, [attendance_id]);
        return rows[0];
    },

    async getAttendanceByStudent(student_id) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.student_id = ?
            ORDER BY sa.date DESC
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getAttendanceByDate(date) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.date = ?
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    },

    async getAttendanceByDateRange(start_date, end_date) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.date BETWEEN ? AND ?
            ORDER BY sa.date DESC, s.last_name, s.first_name
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getAttendanceByStatus(status) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.status = ?
            ORDER BY sa.date DESC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [status]);
        return rows;
    },

    async getTodayAttendance() {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.date = CURDATE()
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async updateAttendance(attendance_id, attendanceData) {
        const { status, remarks } = attendanceData;

        const query = `
            UPDATE student_attendance
            SET status = ?, remarks = ?
            WHERE attendance_id = ?
            RETURNING *
        `;
        const values = [status, remarks, attendance_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteAttendance(attendance_id) {
        const query = `
            DELETE FROM student_attendance
            WHERE attendance_id = ?
            RETURNING attendance_id
        `;
        const { rows } = await db.query(query, [attendance_id]);
        return rows[0];
    },

    async getAttendanceStats(date) {
        const query = `
            SELECT 
                COUNT(*) as total_students,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_count,
                ROUND(COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
            FROM student_attendance
            WHERE date = ?
        `;
        const { rows } = await db.query(query, [date]);
        return rows[0];
    },

    async getStudentAttendanceStats(student_id, start_date, end_date) {
        const query = `
            SELECT 
                COUNT(*) as total_days,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_count,
                ROUND(COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
            FROM student_attendance
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
                COUNT(*) as total_students,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN status = 'leave' THEN 1 END) as leave_count,
                ROUND(COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
            FROM student_attendance
            WHERE YEAR(date) = ? AND MONTH(date) = ?
            GROUP BY DATE(date)
            ORDER BY attendance_date
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getAbsentStudents(date) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   s.phone, s.email, r.room_number, h.hostel_name
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN room_allocation ra ON s.student_id = ra.student_id AND ra.status = 'active'
            LEFT JOIN rooms r ON ra.room_id = r.room_id
            LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE sa.date = ? AND sa.status = 'absent'
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    },

    async bulkMarkAttendance(attendanceRecords) {
        const query = `
            INSERT INTO student_attendance (student_id, date, status, marked_by, remarks)
            VALUES ?
            ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)
        `;
        
        const values = attendanceRecords.map(record => 
            [record.student_id, record.date, record.status, record.marked_by, record.remarks]
        );
        
        const { rows } = await db.query(query, [values]);
        return rows;
    },

    async getAttendanceByMarkedBy(marked_by) {
        const query = `
            SELECT sa.*, s.first_name, s.last_name, s.student_id,
                   u.username as marked_by_username
            FROM student_attendance sa
            JOIN students s ON sa.student_id = s.student_id
            LEFT JOIN users u ON sa.marked_by = u.user_id
            WHERE sa.marked_by = ?
            ORDER BY sa.date DESC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [marked_by]);
        return rows;
    }
};

module.exports = studentAttendanceModel;
