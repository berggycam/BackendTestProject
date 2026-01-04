const db = require('../config/db.js');

const messModel = {
    async createMess(messData) {
        const {
            hostel_id,
            mess_name,
            mess_type = 'both',
            monthly_fee,
            is_active = true
        } = messData;

        const query = `
            INSERT INTO mess (hostel_id, mess_name, mess_type, monthly_fee, is_active)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [hostel_id, mess_name, mess_type, monthly_fee, is_active];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllMess() {
        const query = `
            SELECT m.*, h.hostel_name, h.hostel_type
            FROM mess m
            JOIN hostels h ON m.hostel_id = h.hostel_id
            ORDER BY h.hostel_name, m.mess_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getMessById(mess_id) {
        const query = `
            SELECT m.*, h.hostel_name, h.hostel_type
            FROM mess m
            JOIN hostels h ON m.hostel_id = h.hostel_id
            WHERE m.mess_id = ?
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows[0];
    },

    async getMessByHostel(hostel_id) {
        const query = `
            SELECT m.*, h.hostel_name, h.hostel_type
            FROM mess m
            JOIN hostels h ON m.hostel_id = h.hostel_id
            WHERE m.hostel_id = ?
            ORDER BY m.mess_name
        `;
        const { rows } = await db.query(query, [hostel_id]);
        return rows;
    },

    async getActiveMess() {
        const query = `
            SELECT m.*, h.hostel_name, h.hostel_type
            FROM mess m
            JOIN hostels h ON m.hostel_id = h.hostel_id
            WHERE m.is_active = true
            ORDER BY h.hostel_name, m.mess_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async updateMess(mess_id, messData) {
        const {
            mess_name,
            mess_type,
            monthly_fee,
            is_active
        } = messData;

        const query = `
            UPDATE mess
            SET mess_name = ?, mess_type = ?, monthly_fee = ?, is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE mess_id = ?
            RETURNING *
        `;
        const values = [mess_name, mess_type, monthly_fee, is_active, mess_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteMess(mess_id) {
        const query = `
            DELETE FROM mess
            WHERE mess_id = ?
            RETURNING mess_id
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows[0];
    },

    async activateMess(mess_id) {
        const query = `
            UPDATE mess
            SET is_active = true, updated_at = CURRENT_TIMESTAMP
            WHERE mess_id = ?
            RETURNING *
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows[0];
    },

    async deactivateMess(mess_id) {
        const query = `
            UPDATE mess
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE mess_id = ?
            RETURNING *
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows[0];
    }
};

module.exports = messModel;
