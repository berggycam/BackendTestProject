const db = require('../config/db.js');

const bedModel = {
    async createBed(bedData) {
        const { room_id, bed_number, status = 'available' } = bedData;

        const query = `
            INSERT INTO beds (room_id, bed_number, status)
            VALUES (?, ?, ?)
            RETURNING *
        `;
        const values = [room_id, bed_number, status];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllBeds() {
        const query = `
            SELECT b.*, r.room_number, h.hostel_name, h.hostel_type
            FROM beds b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            ORDER BY h.hostel_name, r.room_number, b.bed_number
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getBedsByRoom(room_id) {
        const query = `
            SELECT b.*, r.room_number, h.hostel_name
            FROM beds b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE b.room_id = ?
            ORDER BY b.bed_number
        `;
        const { rows } = await db.query(query, [room_id]);
        return rows;
    },

    async getBedById(bed_id) {
        const query = `
            SELECT b.*, r.room_number, h.hostel_name, h.hostel_type
            FROM beds b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE b.bed_id = ?
        `;
        const { rows } = await db.query(query, [bed_id]);
        return rows[0];
    },

    async updateBed(bed_id, bedData) {
        const { status } = bedData;

        const query = `
            UPDATE beds
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE bed_id = ?
            RETURNING *
        `;
        const values = [status, bed_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteBed(bed_id) {
        const query = `
            DELETE FROM beds
            WHERE bed_id = ?
            RETURNING bed_id
        `;
        const { rows } = await db.query(query, [bed_id]);
        return rows[0];
    },

    async getAvailableBeds(hostel_id = null) {
        let query = `
            SELECT b.*, r.room_number, h.hostel_name, h.hostel_type
            FROM beds b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE b.status = 'available'
        `;
        let params = [];

        if (hostel_id) {
            query += ` AND h.hostel_id = ?`;
            params.push(hostel_id);
        }

        query += ` ORDER BY h.hostel_name, r.room_number, b.bed_number`;

        const { rows } = await db.query(query, params);
        return rows;
    },

    async getOccupiedBeds() {
        const query = `
            SELECT b.*, r.room_number, h.hostel_name, s.first_name, s.last_name,
                   ra.allocation_date, ra.student_id
            FROM beds b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            JOIN room_allocation ra ON b.bed_id = ra.bed_id AND ra.status = 'active'
            JOIN students s ON ra.student_id = s.student_id
            WHERE b.status = 'occupied'
            ORDER BY h.hostel_name, r.room_number, b.bed_number
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async createBedsForRoom(room_id, capacity) {
        const beds = [];
        for (let i = 1; i <= capacity; i++) {
            const bed_number = i.toString();
            const query = `
                INSERT INTO beds (room_id, bed_number, status)
                VALUES (?, ?, 'available')
                RETURNING *
            `;
            const { rows } = await db.query(query, [room_id, bed_number]);
            beds.push(rows[0]);
        }
        return beds;
    }
};

module.exports = bedModel;
