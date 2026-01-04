const db = require('../config/db.js');

const leaveRequestModel = {
    async createLeaveRequest(leaveData) {
        const {
            student_id,
            from_date,
            to_date,
            reason
        } = leaveData;

        const query = `
            INSERT INTO leave_requests (student_id, from_date, to_date, reason)
            VALUES (?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, from_date, to_date, reason];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllLeaveRequests() {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            ORDER BY lr.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getLeaveRequestById(leave_id) {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            WHERE lr.leave_id = ?
        `;
        const { rows } = await db.query(query, [leave_id]);
        return rows[0];
    },

    async getLeaveRequestsByStudent(student_id) {
        const query = `
            SELECT lr.*, s.first_name, s.last_name,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            WHERE lr.student_id = ?
            ORDER BY lr.created_at DESC
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getLeaveRequestsByStatus(status) {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            WHERE lr.status = ?
            ORDER BY lr.created_at DESC
        `;
        const { rows } = await db.query(query, [status]);
        return rows;
    },

    async getLeaveRequestsByDateRange(start_date, end_date) {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            WHERE lr.from_date BETWEEN ? AND ? OR lr.to_date BETWEEN ? AND ?
            ORDER BY lr.created_at DESC
        `;
        const values = [start_date, end_date, start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getPendingLeaveRequests() {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   s.phone, s.email, r.room_number, h.hostel_name
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN room_allocation ra ON s.student_id = ra.student_id AND ra.status = 'active'
            LEFT JOIN rooms r ON ra.room_id = r.room_id
            LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE lr.status = 'pending'
            ORDER BY lr.from_date ASC, lr.created_at ASC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getActiveLeaveRequests() {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            WHERE lr.status = 'approved' 
            AND lr.from_date <= CURDATE() 
            AND lr.to_date >= CURDATE()
            ORDER BY lr.from_date ASC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async approveLeaveRequest(leave_id, approved_by) {
        const query = `
            UPDATE leave_requests
            SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE leave_id = ?
            RETURNING *
        `;
        const values = [approved_by, leave_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async rejectLeaveRequest(leave_id, approved_by, rejection_reason) {
        const query = `
            UPDATE leave_requests
            SET status = 'rejected', approved_by = ?, approved_at = CURRENT_TIMESTAMP,
                rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
            WHERE leave_id = ?
            RETURNING *
        `;
        const values = [approved_by, rejection_reason, leave_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async updateLeaveRequest(leave_id, leaveData) {
        const {
            from_date,
            to_date,
            reason,
            status
        } = leaveData;

        const query = `
            UPDATE leave_requests
            SET from_date = ?, to_date = ?, reason = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE leave_id = ?
            RETURNING *
        `;
        const values = [from_date, to_date, reason, status, leave_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteLeaveRequest(leave_id) {
        const query = `
            DELETE FROM leave_requests
            WHERE leave_id = ?
            RETURNING leave_id
        `;
        const { rows } = await db.query(query, [leave_id]);
        return rows[0];
    },

    async getLeaveStats() {
        const query = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN from_date <= CURDATE() AND to_date >= CURDATE() AND status = 'approved' THEN 1 END) as currently_on_leave
            FROM leave_requests
        `;
        const { rows } = await db.query(query);
        return rows[0];
    },

    async getLeaveStatsByMonth(year, month) {
        const query = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                SUM(CASE WHEN status = 'approved' THEN DATEDIFF(to_date, from_date) + 1 ELSE 0 END) as total_leave_days
            FROM leave_requests
            WHERE YEAR(from_date) = ? AND MONTH(from_date) = ?
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getStudentLeaveStats(student_id, start_date, end_date) {
        const query = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                SUM(CASE WHEN status = 'approved' THEN DATEDIFF(to_date, from_date) + 1 ELSE 0 END) as total_leave_days
            FROM leave_requests
            WHERE student_id = ? AND from_date BETWEEN ? AND ?
        `;
        const values = [student_id, start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getOverlappingLeaveRequests(student_id, from_date, to_date, exclude_leave_id = null) {
        let query = `
            SELECT lr.*, s.first_name, s.last_name
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            WHERE lr.student_id = ? 
            AND lr.status = 'approved'
            AND (
                (lr.from_date <= ? AND lr.to_date >= ?) OR
                (lr.from_date <= ? AND lr.to_date >= ?) OR
                (lr.from_date >= ? AND lr.to_date <= ?)
            )
        `;
        let values = [student_id, from_date, from_date, to_date, to_date, from_date, to_date];

        if (exclude_leave_id) {
            query += ` AND lr.leave_id != ?`;
            values.push(exclude_leave_id);
        }

        const { rows } = await db.query(query, values);
        return rows;
    },

    async getLeaveRequestsByApprover(approved_by) {
        const query = `
            SELECT lr.*, s.first_name, s.last_name, s.student_id,
                   u.username as approved_by_username
            FROM leave_requests lr
            JOIN students s ON lr.student_id = s.student_id
            LEFT JOIN users u ON lr.approved_by = u.user_id
            WHERE lr.approved_by = ?
            ORDER BY lr.approved_at DESC
        `;
        const { rows } = await db.query(query, [approved_by]);
        return rows;
    }
};

module.exports = leaveRequestModel;
