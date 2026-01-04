const db = require('../config/db.js');

const paymentModel = {
    async createPayment(paymentData) {
        const {
            student_id,
            fee_id,
            amount_paid,
            payment_date,
            payment_mode,
            transaction_id = null,
            status = 'paid',
            remarks = null
        } = paymentData;

        const query = `
            INSERT INTO payments (
                student_id, fee_id, amount_paid, payment_date, payment_mode,
                transaction_id, status, remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [
            student_id, fee_id, amount_paid, payment_date, payment_mode,
            transaction_id, status, remarks
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllPayments() {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            ORDER BY p.payment_date DESC, p.created_at DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getPaymentById(payment_id) {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.payment_id = ?
        `;
        const { rows } = await db.query(query, [payment_id]);
        return rows[0];
    },

    async getPaymentsByStudent(student_id) {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.student_id = ?
            ORDER BY p.payment_date DESC, p.created_at DESC
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows;
    },

    async getPaymentsByFee(fee_id) {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.fee_id = ?
            ORDER BY p.payment_date DESC, p.created_at DESC
        `;
        const { rows } = await db.query(query, [fee_id]);
        return rows;
    },

    async getPaymentsByStatus(status) {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.status = ?
            ORDER BY p.payment_date DESC, p.created_at DESC
        `;
        const { rows } = await db.query(query, [status]);
        return rows;
    },

    async getPaymentsByDateRange(start_date, end_date) {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.payment_date BETWEEN ? AND ?
            ORDER BY p.payment_date DESC, p.created_at DESC
        `;
        const values = [start_date, end_date];
        const { rows } = await db.query(query, values);
        return rows;
    },

    async updatePayment(payment_id, paymentData) {
        const {
            amount_paid,
            payment_date,
            payment_mode,
            transaction_id,
            status,
            remarks
        } = paymentData;

        const query = `
            UPDATE payments
            SET amount_paid = ?, payment_date = ?, payment_mode = ?,
                transaction_id = ?, status = ?, remarks = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE payment_id = ?
            RETURNING *
        `;
        const values = [
            amount_paid, payment_date, payment_mode, transaction_id,
            status, remarks, payment_id
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deletePayment(payment_id) {
        const query = `
            DELETE FROM payments
            WHERE payment_id = ?
            RETURNING payment_id
        `;
        const { rows } = await db.query(query, [payment_id]);
        return rows[0];
    },

    async getPaymentStats() {
        const query = `
            SELECT 
                COUNT(*) as total_payments,
                SUM(amount_paid) as total_amount,
                AVG(amount_paid) as average_amount,
                COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
                SUM(CASE WHEN status = 'paid' THEN amount_paid ELSE 0 END) as paid_amount
            FROM payments
        `;
        const { rows } = await db.query(query);
        return rows[0];
    },

    async getPaymentStatsByFeeType() {
        const query = `
            SELECT 
                f.fee_type,
                COUNT(*) as payment_count,
                SUM(p.amount_paid) as total_amount,
                AVG(p.amount_paid) as average_amount,
                COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_count,
                COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_count
            FROM payments p
            JOIN fees f ON p.fee_id = f.fee_id
            GROUP BY f.fee_type
            ORDER BY total_amount DESC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getPendingPayments() {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.status = 'pending'
            ORDER BY p.payment_date ASC
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getOverduePayments() {
        const query = `
            SELECT p.*, s.first_name, s.last_name, f.fee_type, f.frequency,
                   f.description as fee_description
            FROM payments p
            JOIN students s ON p.student_id = s.student_id
            JOIN fees f ON p.fee_id = f.fee_id
            WHERE p.status = 'pending' AND p.payment_date < CURDATE()
            ORDER BY p.payment_date ASC
        `;
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = paymentModel;
