const db = require('../config/db.js');

const auditLogModel = {
    async createLog(logData) {
        const {
            user_id,
            action,
            table_name = null,
            record_id = null,
            old_values = null,
            new_values = null,
            ip_address = null,
            user_agent = null
        } = logData;

        const query = `
            INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [
            user_id, action, table_name, record_id,
            old_values ? JSON.stringify(old_values) : null,
            new_values ? JSON.stringify(new_values) : null,
            ip_address, user_agent
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllLogs() {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getLogById(log_id) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.log_id = ?
        `;
        const { rows } = await db.query(query, [log_id]);
        return rows[0];
    },

    async getLogsByUser(user_id) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.user_id = ?
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query, [user_id]);
        return rows;
    },

    async getLogsByAction(action) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.action = ?
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query, [action]);
        return rows;
    },

    async getLogsByTable(table_name) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.table_name = ?
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query, [table_name]);
        return rows;
    },

    async getLogsByRecord(table_name, record_id) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.table_name = ? AND al.record_id = ?
            ORDER BY al.created_at DESC
        `;
        const values = [table_name, record_id];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getLogsByDateRange(start_date, end_date) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.created_at BETWEEN ? AND ?
            ORDER BY al.created_at DESC
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getLogsByRole(role) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE u.role = ?
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query, [role]);
        return rows;
    },

    async getRecentLogs(limit = 50) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            ORDER BY al.created_at DESC
            LIMIT ?
        `;
        const { rows } = await db.query(query, [limit]);
        return rows;
    },

    async getTodayLogs() {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE DATE(al.created_at) = CURDATE()
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getLogStats() {
        const query = `
            SELECT 
                COUNT(*) as total_logs,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT table_name) as affected_tables,
                COUNT(DISTINCT action) as unique_actions,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_logs
            FROM audit_logs
        `;
        const { rows } = await db.query(query);
        return rows[0];
    },

    async getLogStatsByAction() {
        const query = `
            SELECT 
                action,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users,
                MAX(created_at) as last_occurrence
            FROM audit_logs
            GROUP BY action
            ORDER BY count DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getLogStatsByUser() {
        const query = `
            SELECT 
                u.username,
                u.role,
                COUNT(*) as log_count,
                COUNT(DISTINCT action) as unique_actions,
                MAX(al.created_at) as last_activity
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            GROUP BY u.user_id, u.username, u.role
            ORDER BY log_count DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getLogStatsByTable() {
        const query = `
            SELECT 
                table_name,
                COUNT(*) as log_count,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT action) as unique_actions,
                MAX(created_at) as last_activity
            FROM audit_logs
            WHERE table_name IS NOT NULL
            GROUP BY table_name
            ORDER BY log_count DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getLogStatsByMonth(year, month) {
        const query = `
            SELECT 
                DATE(created_at) as log_date,
                COUNT(*) as log_count,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT table_name) as affected_tables
            FROM audit_logs
            WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
            GROUP BY DATE(created_at)
            ORDER BY log_date
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getFailedLoginAttempts() {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.action LIKE '%failed_login%' OR al.action LIKE '%login_failed%'
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getSecurityLogs() {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.action LIKE '%login%' OR al.action LIKE '%logout%' OR 
                  al.action LIKE '%password%' OR al.action LIKE '%security%' OR
                  al.action LIKE '%unauthorized%'
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getDataModificationLogs() {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.action LIKE '%create%' OR al.action LIKE '%update%' OR 
                  al.action LIKE '%delete%' OR al.action LIKE '%insert%'
            ORDER BY al.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async deleteOldLogs(days_to_keep = 90) {
        const query = `
            DELETE FROM audit_logs
            WHERE created_at < DATE_SUB(CURDATE(), INTERVAL ? DAY)
        `;
        const { rows } = await db.query(query, [days_to_keep]);
        return rows.affectedRows;
    },

    async searchLogs(searchTerm) {
        const query = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            JOIN users u ON al.user_id = u.user_id
            WHERE al.action LIKE ? OR al.table_name LIKE ? OR u.username LIKE ?
            ORDER BY al.created_at DESC
        `;
        const searchPattern = `%${searchTerm}%`;
        const values = [searchPattern, searchPattern, searchPattern];
        const { rows } = await db.query(query, values);
        return rows;
    }
};

module.exports = auditLogModel;
