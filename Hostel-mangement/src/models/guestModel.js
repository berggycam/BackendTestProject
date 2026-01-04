const db = require('../config/db.js');

const guestModel = {

    async getGuests() {
        const { rows } = await db.query('SELECT * FROM guests ORDER BY created_at DESC');
        return rows;
    },

    async getGuestById(guest_id) {
        const query = 'SELECT * FROM guests WHERE guest_id = ?';
        const { rows } = await db.query(query, [guest_id]);
        return rows[0] || null;
    },

    async createGuest(data) {
        const { full_name, email, phone, purpose, visit_date } = data;

        const query = `
            INSERT INTO guests (full_name, email, phone, purpose, visit_date)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
        `;

        const values = [full_name, email, phone, purpose, visit_date];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async updateGuest(guest_id, data) {
        const fields = [];
        const values = [];
        let index = 1;

        Object.entries(data).forEach(([key, value]) => {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index += 1;
        });

        if (fields.length === 0) {
            return null;
        }

        const query = `
            UPDATE guests
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE guest_id = $${index}
            RETURNING *
        `;
        values.push(guest_id);

        const { rows } = await db.query(query, values);
        return rows[0] || null;
    },

    async deleteGuest(guest_id) {
        const query = `
            DELETE FROM guests
            WHERE guest_id = ?
            RETURNING guest_id
        `;

        const { rows } = await db.query(query, [guest_id]);
        return rows[0] || null;
    }
};


module.exports = guestModel;