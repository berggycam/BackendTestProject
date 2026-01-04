const db = require('../config/db.js');

const feeModel = {
    async createFee(feeData) {
        const {
            fee_type,
            amount,
            frequency,
            description,
            is_active = true
        } = feeData;

        const query = `
            INSERT INTO fees (fee_type, amount, frequency, description, is_active)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [fee_type, amount, frequency, description, is_active];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllFees() {
        const query = `
            SELECT * FROM fees
            ORDER BY fee_type, frequency
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getActiveFees() {
        const query = `
            SELECT * FROM fees
            WHERE is_active = true
            ORDER BY fee_type, frequency
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getFeeById(fee_id) {
        const query = `
            SELECT * FROM fees
            WHERE fee_id = ?
        `;
        const { rows } = await db.query(query, [fee_id]);
        return rows[0];
    },

    async getFeesByType(fee_type) {
        const query = `
            SELECT * FROM fees
            WHERE fee_type = ?
            ORDER BY frequency
        `;
        const { rows } = await db.query(query, [fee_type]);
        return rows;
    },

    async getFeesByFrequency(frequency) {
        const query = `
            SELECT * FROM fees
            WHERE frequency = ?
            ORDER BY fee_type
        `;
        const { rows } = await db.query(query, [frequency]);
        return rows;
    },

    async updateFee(fee_id, feeData) {
        const {
            fee_type,
            amount,
            frequency,
            description,
            is_active
        } = feeData;

        const query = `
            UPDATE fees
            SET fee_type = ?, amount = ?, frequency = ?, description = ?, 
                is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE fee_id = ?
            RETURNING *
        `;
        const values = [fee_type, amount, frequency, description, is_active, fee_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteFee(fee_id) {
        const query = `
            DELETE FROM fees
            WHERE fee_id = ?
            RETURNING fee_id
        `;
        const { rows } = await db.query(query, [fee_id]);
        return rows[0];
    },

    async activateFee(fee_id) {
        const query = `
            UPDATE fees
            SET is_active = true, updated_at = CURRENT_TIMESTAMP
            WHERE fee_id = ?
            RETURNING *
        `;
        const { rows } = await db.query(query, [fee_id]);
        return rows[0];
    },

    async deactivateFee(fee_id) {
        const query = `
            UPDATE fees
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE fee_id = ?
            RETURNING *
        `;
        const { rows } = await db.query(query, [fee_id]);
        return rows[0];
    },

    async getFeeStats() {
        const query = `
            SELECT 
                fee_type,
                COUNT(*) as count,
                AVG(amount) as average_amount,
                MIN(amount) as min_amount,
                MAX(amount) as max_amount,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count
            FROM fees
            GROUP BY fee_type
            ORDER BY fee_type
        `;
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = feeModel;
