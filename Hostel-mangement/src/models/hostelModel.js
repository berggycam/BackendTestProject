const db = require('../config/db.js');

const hostelModel = {
    async createHostel(hostelData) {
        const {
            hostel_name,
            hostel_type,
            address,
            warden_name,
            warden_contact,
            total_rooms = 0
        } = hostelData;

        const query = `
            INSERT INTO hostels (hostel_name, hostel_type, address, warden_name, warden_contact, total_rooms)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [hostel_name, hostel_type, address, warden_name, warden_contact, total_rooms];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllHostels() {
        const query = `
            SELECT h.*, 
                   COUNT(r.room_id) as occupied_rooms,
                   (SELECT COUNT(*) FROM rooms WHERE hostel_id = h.hostel_id) as total_rooms_count
            FROM hostels h
            LEFT JOIN rooms r ON h.hostel_id = r.hostel_id AND r.status = 'full'
            GROUP BY h.hostel_id
            ORDER BY h.hostel_name
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getHostelById(hostel_id) {
        const query = `
            SELECT h.*, 
                   COUNT(r.room_id) as occupied_rooms,
                   (SELECT COUNT(*) FROM rooms WHERE hostel_id = h.hostel_id) as total_rooms_count
            FROM hostels h
            LEFT JOIN rooms r ON h.hostel_id = r.hostel_id AND r.status = 'full'
            WHERE h.hostel_id = ?
            GROUP BY h.hostel_id
        `;
        const { rows } = await db.query(query, [hostel_id]);
        return rows[0];
    },

    async updateHostel(hostel_id, hostelData) {
        const {
            hostel_name,
            hostel_type,
            address,
            warden_name,
            warden_contact,
            total_rooms
        } = hostelData;

        const query = `
            UPDATE hostels
            SET hostel_name = ?, hostel_type = ?, address = ?,
                warden_name = ?, warden_contact = ?, total_rooms = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE hostel_id = ?
            RETURNING *
        `;
        const values = [hostel_name, hostel_type, address, warden_name, warden_contact, total_rooms, hostel_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteHostel(hostel_id) {
        const query = `
            DELETE FROM hostels
            WHERE hostel_id = ?
            RETURNING hostel_id
        `;
        const { rows } = await db.query(query, [hostel_id]);
        return rows[0];
    },

    async getHostelsByType(hostel_type) {
        const query = `
            SELECT * FROM hostels
            WHERE hostel_type = ?
            ORDER BY hostel_name
        `;
        const { rows } = await db.query(query, [hostel_type]);
        return rows;
    },

    async getHostelWithRooms(hostel_id) {
        const hostelQuery = `SELECT * FROM hostels WHERE hostel_id = ?`;
        const roomsQuery = `
            SELECT r.*, 
                   COUNT(b.bed_id) as total_beds,
                   (SELECT COUNT(*) FROM beds WHERE room_id = r.room_id AND status = 'occupied') as occupied_beds
            FROM rooms r
            LEFT JOIN beds b ON r.room_id = b.room_id
            WHERE r.hostel_id = ?
            GROUP BY r.room_id
            ORDER BY r.room_number
        `;

        const [hostelResult, roomsResult] = await Promise.all([
            db.query(hostelQuery, [hostel_id]),
            db.query(roomsQuery, [hostel_id])
        ]);

        return {
            hostel: hostelResult.rows[0],
            rooms: roomsResult.rows
        };
    }
};

module.exports = hostelModel;
