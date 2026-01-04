const db = require('../config/db.js');

const gateEntryModel = {
    async createGateEntry(entryData) {
        const {
            student_id,
            date,
            in_time = null,
            out_time = null,
            purpose = null
        } = entryData;

        const query = `
            INSERT INTO gate_entry (student_id, date, in_time, out_time, purpose)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, date, in_time, out_time, purpose];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllGateEntries() {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            ORDER BY ge.date DESC, ge.in_time DESC, ge.out_time DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getGateEntryById(entry_id) {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.entry_id = ?
        `;
        const { rows } = await db.query(query, [entry_id]);
        return rows[0];
    },

    async getGateEntriesByStudent(student_id) {
        const query = `
            SELECT ge.*, s.first_name, s.last_name
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.student_id = ?
            ORDER BY ge.date DESC, ge.in_time DESC, ge.out_time DESC
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getGateEntriesByDate(date) {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.date = ?
            ORDER BY ge.in_time ASC, ge.out_time ASC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    },

    async getGateEntriesByDateRange(start_date, end_date) {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.date BETWEEN ? AND ?
            ORDER BY ge.date DESC, ge.in_time DESC, ge.out_time DESC
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getTodayGateEntries() {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.date = CURDATE()
            ORDER BY ge.in_time DESC, ge.out_time DESC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getActiveGateEntries() {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.date = CURDATE() AND ge.in_time IS NOT NULL AND ge.out_time IS NULL
            ORDER BY ge.in_time DESC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getStudentsOutside() {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id,
                   s.phone, s.email, r.room_number, h.hostel_name
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            LEFT JOIN room_allocation ra ON s.student_id = ra.student_id AND ra.status = 'active'
            LEFT JOIN rooms r ON ra.room_id = r.room_id
            LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE ge.in_time IS NOT NULL AND ge.out_time IS NULL
            ORDER BY ge.in_time DESC, s.last_name, s.first_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async recordEntry(entry_id, in_time) {
        const query = `
            UPDATE gate_entry
            SET in_time = ?
            WHERE entry_id = ?
            RETURNING *
        `;
        const values = [in_time, entry_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async recordExit(entry_id, out_time) {
        const query = `
            UPDATE gate_entry
            SET out_time = ?
            WHERE entry_id = ?
            RETURNING *
        `;
        const values = [out_time, entry_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async updateGateEntry(entry_id, entryData) {
        const {
            date,
            in_time,
            out_time,
            purpose
        } = entryData;

        const query = `
            UPDATE gate_entry
            SET date = ?, in_time = ?, out_time = ?, purpose = ?
            WHERE entry_id = ?
            RETURNING *
        `;
        const values = [date, in_time, out_time, purpose, entry_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteGateEntry(entry_id) {
        const query = `
            DELETE FROM gate_entry
            WHERE entry_id = ?
            RETURNING entry_id
        `;
        const { rows } = await db.query(query, [entry_id]);
        return rows[0];
    },

    async getGateEntryStats(date) {
        const query = `
            SELECT 
                COUNT(*) as total_entries,
                COUNT(CASE WHEN in_time IS NOT NULL THEN 1 END) as entry_count,
                COUNT(CASE WHEN out_time IS NOT NULL THEN 1 END) as exit_count,
                COUNT(CASE WHEN in_time IS NOT NULL AND out_time IS NULL THEN 1 END) as active_outside,
                COUNT(DISTINCT student_id) as unique_students
            FROM gate_entry
            WHERE date = ?
        `;
        const { rows } = await db.query(query, [date]);
        return rows[0];
    },

    async getGateEntryStatsByMonth(year, month) {
        const query = `
            SELECT 
                DATE(date) as entry_date,
                COUNT(*) as total_entries,
                COUNT(CASE WHEN in_time IS NOT NULL THEN 1 END) as entry_count,
                COUNT(CASE WHEN out_time IS NOT NULL THEN 1 END) as exit_count,
                COUNT(DISTINCT student_id) as unique_students
            FROM gate_entry
            WHERE YEAR(date) = ? AND MONTH(date) = ?
            GROUP BY DATE(date)
            ORDER BY entry_date
        `;
        const values = [year, month];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getStudentGateStats(student_id, start_date, end_date) {
        const query = `
            SELECT 
                COUNT(*) as total_entries,
                COUNT(CASE WHEN in_time IS NOT NULL THEN 1 END) as entry_count,
                COUNT(CASE WHEN out_time IS NOT NULL THEN 1 END) as exit_count,
                COUNT(CASE WHEN in_time IS NOT NULL AND out_time IS NULL THEN 1 END) as currently_outside,
                AVG(CASE WHEN in_time IS NOT NULL AND out_time IS NOT NULL 
                    THEN TIMESTAMPDIFF(MINUTE, in_time, out_time) 
                    ELSE NULL END) as avg_duration_minutes
            FROM gate_entry
            WHERE student_id = ? AND date BETWEEN ? AND ?
        `;
        const values = [student_id, start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getFrequentExitStudents(limit = 10) {
        const query = `
            SELECT 
                s.student_id,
                s.first_name,
                s.last_name,
                COUNT(*) as exit_count,
                MAX(ge.date) as last_exit_date
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            WHERE ge.out_time IS NOT NULL
            GROUP BY s.student_id, s.first_name, s.last_name
            HAVING exit_count > 1
            ORDER BY exit_count DESC
            LIMIT ?
        `;
        const { rows } = await db.query(query, [limit]);
        return rows;
    },

    async getLateNightEntries(date, hour = 22) {
        const query = `
            SELECT ge.*, s.first_name, s.last_name, s.student_id,
                   s.phone, s.email, r.room_number, h.hostel_name
            FROM gate_entry ge
            JOIN students s ON ge.student_id = s.student_id
            LEFT JOIN room_allocation ra ON s.student_id = ra.student_id AND ra.status = 'active'
            LEFT JOIN rooms r ON ra.room_id = r.room_id
            LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE ge.date = ? AND ge.in_time IS NOT NULL AND HOUR(ge.in_time) >= ?
            ORDER BY ge.in_time DESC, s.last_name, s.first_name
        `;
        const values = [date, hour];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async getAbsentStudents(date) {
        const query = `
            SELECT s.student_id, s.first_name, s.last_name, s.phone, s.email,
                   r.room_number, h.hostel_name
            FROM students s
            LEFT JOIN room_allocation ra ON s.student_id = ra.student_id AND ra.status = 'active'
            LEFT JOIN rooms r ON ra.room_id = r.room_id
            LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE s.student_id NOT IN (
                SELECT DISTINCT student_id 
                FROM gate_entry 
                WHERE date = ? AND in_time IS NOT NULL
            )
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await db.query(query, [date]);
        return rows;
    }
};

module.exports = gateEntryModel;
