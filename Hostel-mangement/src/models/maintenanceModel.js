const db = require('../config/db.js');

const maintenanceModel = {
    async createMaintenance(maintenanceData) {
        const {
            room_id,
            issue,
            description,
            reported_date,
            priority = 'medium'
        } = maintenanceData;

        const query = `
            INSERT INTO maintenance (room_id, issue, description, reported_date, priority)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [room_id, issue, description, reported_date, priority];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllMaintenance() {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            ORDER BY m.reported_date DESC, m.status
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getMaintenanceById(maintenance_id) {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.maintenance_id = ?
        `;
        const { rows } = await db.query(query, [maintenance_id]);
        return rows[0];
    },

    async getMaintenanceByRoom(room_id) {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.room_id = ?
            ORDER BY m.reported_date DESC
        `;
        const { rows } = await db.query(query, [room_id]);
        return rows;
    },

    async getMaintenanceByStatus(status) {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.status = ?
            ORDER BY m.reported_date DESC
        `;
        const { rows } = await db.query(query, [status]);
        return rows;
    },

    async getMaintenanceByPriority(priority) {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.priority = ?
            ORDER BY m.reported_date DESC
        `;
        const { rows } = await db.query(query, [priority]);
        return rows;
    },

    async getMaintenanceByAssignedTo(assigned_to) {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.assigned_to = ?
            ORDER BY m.reported_date DESC
        `;
        const { rows } = await db.query(query, [assigned_to]);
        return rows;
    },

    async getMaintenanceByDateRange(start_date, end_date) {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.reported_date BETWEEN ? AND ?
            ORDER BY m.reported_date DESC
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async updateMaintenance(maintenance_id, maintenanceData) {
        const {
            issue,
            description,
            status,
            assigned_to,
            cost
        } = maintenanceData;

        const query = `
            UPDATE maintenance
            SET issue = ?, description = ?, status = ?, assigned_to = ?, cost = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE maintenance_id = ?
            RETURNING *
        `;
        const values = [issue, description, status, assigned_to, cost, maintenance_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async assignMaintenance(maintenance_id, assigned_to) {
        const query = `
            UPDATE maintenance
            SET assigned_to = ?, status = 'in-progress', updated_at = CURRENT_TIMESTAMP
            WHERE maintenance_id = ?
            RETURNING *
        `;
        const values = [assigned_to, maintenance_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async completeMaintenance(maintenance_id, resolved_date, cost = null) {
        const query = `
            UPDATE maintenance
            SET status = 'completed', resolved_date = ?, cost = ?, updated_at = CURRENT_TIMESTAMP
            WHERE maintenance_id = ?
            RETURNING *
        `;
        const values = [resolved_date, cost, maintenance_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteMaintenance(maintenance_id) {
        const query = `
            DELETE FROM maintenance
            WHERE maintenance_id = ?
            RETURNING maintenance_id
        `;
        const { rows } = await db.query(query, [maintenance_id]);
        return rows[0];
    },

    async getMaintenanceStats() {
        const query = `
            SELECT 
                COUNT(*) as total_maintenance,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_count,
                COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_count,
                COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_count,
                SUM(CASE WHEN cost IS NOT NULL THEN cost ELSE 0 END) as total_cost,
                AVG(CASE WHEN resolved_date IS NOT NULL 
                    THEN DATEDIFF(resolved_date, reported_date) 
                    ELSE NULL END) as avg_resolution_days
            FROM maintenance
        `;
        const { rows } = await db.query(query);
        return rows[0];
    },

    async getMaintenanceStatsByMonth(year, month) {
        const query = `
            SELECT 
                COUNT(*) as maintenance_count,
                SUM(CASE WHEN cost IS NOT NULL THEN cost ELSE 0 END) as total_cost,
                AVG(CASE WHEN resolved_date IS NOT NULL 
                    THEN DATEDIFF(resolved_date, reported_date) 
                    ELSE NULL END) as avg_resolution_days,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
            FROM maintenance
            WHERE YEAR(reported_date) = ? AND MONTH(reported_date) = ?
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getPendingMaintenance() {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.status = 'pending'
            ORDER BY m.priority DESC, m.reported_date ASC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getOverdueMaintenance() {
        const query = `
            SELECT m.*, r.room_number, h.hostel_name, h.hostel_type,
                   u.username as assigned_to_username,
                   DATEDIFF(CURDATE(), m.reported_date) as days_overdue
            FROM maintenance m
            JOIN rooms r ON m.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            LEFT JOIN users u ON m.assigned_to = u.user_id
            WHERE m.status != 'completed' AND m.reported_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY days_overdue DESC, m.priority DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = maintenanceModel;
