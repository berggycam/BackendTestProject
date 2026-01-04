const db = require('../config/db.js');

const complaintModel = {
    async createComplaint(complaintData) {
        const {
            student_id,
            complaint_type,
            description,
            priority = 'medium'
        } = complaintData;

        const query = `
            INSERT INTO complaints (student_id, complaint_type, description, priority)
            VALUES (?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, complaint_type, description, priority];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllComplaints() {
        const query = `
            SELECT c.*, s.first_name, s.last_name, s.student_id,
                   u.username as resolved_by_username
            FROM complaints c
            JOIN students s ON c.student_id = s.student_id
            LEFT JOIN users u ON c.resolved_by = u.user_id
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getComplaintById(complaint_id) {
        const query = `
            SELECT c.*, s.first_name, s.last_name, s.student_id,
                   u.username as resolved_by_username
            FROM complaints c
            JOIN students s ON c.student_id = s.student_id
            LEFT JOIN users u ON c.resolved_by = u.user_id
            WHERE c.complaint_id = ?
        `;
        const { rows } = await db.query(query, [complaint_id]);
        return rows[0];
    },

    async getComplaintsByStudent(student_id) {
        const query = `
            SELECT c.*, s.first_name, s.last_name,
                   u.username as resolved_by_username
            FROM complaints c
            JOIN students s ON c.student_id = s.student_id
            LEFT JOIN users u ON c.resolved_by = u.user_id
            WHERE c.student_id = ?
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getComplaintsByStatus(status) {
        const query = `
            SELECT c.*, s.first_name, s.last_name, s.student_id,
                   u.username as resolved_by_username
            FROM complaints c
            JOIN students s ON c.student_id = s.student_id
            LEFT JOIN users u ON c.resolved_by = u.user_id
            WHERE c.status = ?
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [status]);
        return rows;
    },

    async getComplaintsByType(complaint_type) {
        const query = `
            SELECT c.*, s.first_name, s.last_name, s.student_id,
                   u.username as resolved_by_username
            FROM complaints c
            JOIN students s ON c.student_id = s.student_id
            LEFT JOIN users u ON c.resolved_by = u.user_id
            WHERE c.complaint_type = ?
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [complaint_type]);
        return rows;
    },

    async getComplaintsByPriority(priority) {
        const query = `
            SELECT c.*, s.first_name, s.last_name, s.student_id,
                   u.username as resolved_by_username
            FROM complaints c
            JOIN students s ON c.student_id = s.student_id
            LEFT JOIN users u ON c.resolved_by = u.user_id
            WHERE c.priority = ?
            ORDER BY c.created_at DESC
        `;
        const { rows } = await db.query(query, [priority]);
        return rows;
    },

    async updateComplaint(complaint_id, complaintData) {
        const {
            complaint_type,
            description,
            priority,
            status
        } = complaintData;

        const query = `
            UPDATE complaints
            SET complaint_type = ?, description = ?, priority = ?, status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE complaint_id = ?
            RETURNING *
        `;
        const values = [complaint_type, description, priority, status, complaint_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async resolveComplaint(complaint_id, resolved_by, resolution_remarks) {
        const query = `
            UPDATE complaints
            SET status = 'resolved', resolved_by = ?, resolved_at = CURRENT_TIMESTAMP,
                resolution_remarks = ?, updated_at = CURRENT_TIMESTAMP
            WHERE complaint_id = ?
            RETURNING *
        `;
        const values = [resolved_by, resolution_remarks, complaint_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteComplaint(complaint_id) {
        const query = `
            DELETE FROM complaints
            WHERE complaint_id = ?
            RETURNING complaint_id
        `;
        const { rows } = await db.query(query, [complaint_id]);
        return rows[0];
    },

    async getComplaintStats() {
        const query = `
            SELECT 
                COUNT(*) as total_complaints,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_count,
                COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_count,
                COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_count,
                COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_count
            FROM complaints
        `;
        const { rows } = await db.query(query);
        return rows[0];
    },

    async getComplaintStatsByType() {
        const query = `
            SELECT 
                complaint_type,
                COUNT(*) as count,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
                AVG(CASE WHEN status = 'resolved' 
                    THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
                    ELSE NULL END) as avg_resolution_hours
            FROM complaints
            GROUP BY complaint_type
            ORDER BY count DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = complaintModel;
