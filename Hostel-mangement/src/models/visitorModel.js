const db = require('../config/db.js');

const visitorModel = {
    async createVisitor(visitorData) {
        const {
            student_id,
            visitor_name,
            relation,
            visit_date,
            in_time,
            purpose = null
        } = visitorData;

        const query = `
            INSERT INTO visitors (student_id, visitor_name, relation, visit_date, in_time, purpose)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, visitor_name, relation, visit_date, in_time, purpose];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllVisitors() {
        const query = `
            SELECT v.*, s.first_name, s.last_name, s.student_id
            FROM visitors v
            JOIN students s ON v.student_id = s.student_id
            ORDER BY v.visit_date DESC, v.in_time DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getVisitorById(visitor_id) {
        const query = `
            SELECT v.*, s.first_name, s.last_name, s.student_id
            FROM visitors v
            JOIN students s ON v.student_id = s.student_id
            WHERE v.visitor_id = ?
        `;
        const { rows } = await db.query(query, [visitor_id]);
        return rows[0];
    },

    async getVisitorsByStudent(student_id) {
        const query = `
            SELECT v.*, s.first_name, s.last_name
            FROM visitors v
            JOIN students s ON v.student_id = s.student_id
            WHERE v.student_id = ?
            ORDER BY v.visit_date DESC, v.in_time DESC
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getVisitorsByDate(visit_date) {
        const query = `
            SELECT v.*, s.first_name, s.last_name, s.student_id
            FROM visitors v
            JOIN students s ON v.student_id = s.student_id
            WHERE v.visit_date = ?
            ORDER BY v.in_time ASC
        `;
        const { rows } = await db.query(query, [visit_date]);
        return rows;
    },

    async getVisitorsByDateRange(start_date, end_date) {
        const query = `
            SELECT v.*, s.first_name, s.last_name, s.student_id
            FROM visitors v
            JOIN students s ON v.student_id = s.student_id
            WHERE v.visit_date BETWEEN ? AND ?
            ORDER BY v.visit_date DESC, v.in_time DESC
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getActiveVisitors() {
        const query = `
            SELECT v.*, s.first_name, s.last_name, s.student_id
            FROM visitors v
            JOIN students s ON v.student_id = s.student_id
            WHERE v.out_time IS NULL
            ORDER BY v.visit_date DESC, v.in_time DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async updateVisitor(visitor_id, visitorData) {
        const {
            visitor_name,
            relation,
            visit_date,
            in_time,
            out_time,
            purpose
        } = visitorData;

        const query = `
            UPDATE visitors
            SET visitor_name = ?, relation = ?, visit_date = ?, in_time = ?,
                out_time = ?, purpose = ?
            WHERE visitor_id = ?
            RETURNING *
        `;
        const values = [visitor_name, relation, visit_date, in_time, out_time, purpose, visitor_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async checkOutVisitor(visitor_id, out_time) {
        const query = `
            UPDATE visitors
            SET out_time = ?
            WHERE visitor_id = ?
            RETURNING *
        `;
        const values = [out_time, visitor_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteVisitor(visitor_id) {
        const query = `
            DELETE FROM visitors
            WHERE visitor_id = ?
            RETURNING visitor_id
        `;
        const { rows } = await db.query(query, [visitor_id]);
        return rows[0];
    },

    async getVisitorStats() {
        const query = `
            SELECT 
                COUNT(*) as total_visitors,
                COUNT(CASE WHEN out_time IS NULL THEN 1 END) as active_visitors,
                COUNT(CASE WHEN DATE(visit_date) = CURDATE() THEN 1 END) as today_visitors,
                COUNT(CASE WHEN DATE(visit_date) = CURDATE() - INTERVAL 1 DAY THEN 1 END) as yesterday_visitors
            FROM visitors
        `;
        const { rows } = await db.query(query);
        return rows[0];
    },

    async getVisitorStatsByMonth(year, month) {
        const query = `
            SELECT 
                COUNT(*) as visitor_count,
                COUNT(DISTINCT student_id) as unique_students,
                COUNT(DISTINCT DATE(visit_date)) as active_days
            FROM visitors
            WHERE YEAR(visit_date) = ? AND MONTH(visit_date) = ?
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getFrequentVisitors(limit = 10) {
        const query = `
            SELECT 
                visitor_name,
                relation,
                COUNT(*) as visit_count,
                MAX(visit_date) as last_visit
            FROM visitors
            GROUP BY visitor_name, relation
            HAVING visit_count > 1
            ORDER BY visit_count DESC
            LIMIT ?
        `;
        const { rows } = await db.query(query, [limit]);
        return rows;
    }
};

module.exports = visitorModel;
