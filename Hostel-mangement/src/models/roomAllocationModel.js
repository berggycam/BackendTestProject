const db = require('../config/db.js');

const roomAllocationModel = {
    async allocateRoom(allocationData) {
        const {
            student_id,
            room_id,
            bed_id,
            allocation_date
        } = allocationData;

        const query = `
            INSERT INTO room_allocation (student_id, room_id, bed_id, allocation_date)
            VALUES (?, ?, ?, ?)
            RETURNING *
        `;
        const values = [student_id, room_id, bed_id, allocation_date];

        const { rows } = await db.query(query, values);
        
        // Update bed status to occupied
        await db.query('UPDATE beds SET status = ? WHERE bed_id = ?', ['occupied', bed_id]);
        
        return rows[0];
    },

    async getAllAllocations() {
        const query = `
            SELECT ra.*, s.first_name, s.last_name, r.room_number, b.bed_number,
                   h.hostel_name, h.hostel_type
            FROM room_allocation ra
            JOIN students s ON ra.student_id = s.student_id
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN beds b ON ra.bed_id = b.bed_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE ra.status = 'active'
            ORDER BY h.hostel_name, r.room_number, b.bed_number
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getAllocationById(allocation_id) {
        const query = `
            SELECT ra.*, s.first_name, s.last_name, r.room_number, b.bed_number,
                   h.hostel_name, h.hostel_type
            FROM room_allocation ra
            JOIN students s ON ra.student_id = s.student_id
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN beds b ON ra.bed_id = b.bed_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE ra.allocation_id = ?
        `;
        const { rows } = await db.query(query, [allocation_id]);
        return rows[0];
    },

    async getAllocationByStudent(student_id) {
        const query = `
            SELECT ra.*, s.first_name, s.last_name, r.room_number, b.bed_number,
                   h.hostel_name, h.hostel_type
            FROM room_allocation ra
            JOIN students s ON ra.student_id = s.student_id
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN beds b ON ra.bed_id = b.bed_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE ra.student_id = ? AND ra.status = 'active'
        `;
        const { rows } = await db.query(query, [student_id]);
        return rows[0];
    },

    async getAllocationsByRoom(room_id) {
        const query = `
            SELECT ra.*, s.first_name, s.last_name, r.room_number, b.bed_number,
                   h.hostel_name, h.hostel_type
            FROM room_allocation ra
            JOIN students s ON ra.student_id = s.student_id
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN beds b ON ra.bed_id = b.bed_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE ra.room_id = ? AND ra.status = 'active'
            ORDER BY b.bed_number
        `;
        const { rows } = await db.query(query, [room_id]);
        return rows;
    },

    async getAllocationsByHostel(hostel_id) {
        const query = `
            SELECT ra.*, s.first_name, s.last_name, r.room_number, b.bed_number,
                   h.hostel_name, h.hostel_type
            FROM room_allocation ra
            JOIN students s ON ra.student_id = s.student_id
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN beds b ON ra.bed_id = b.bed_number
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE r.hostel_id = ? AND ra.status = 'active'
            ORDER BY r.room_number, b.bed_number
        `;
        const { rows } = await db.query(query, [hostel_id]);
        return rows;
    },

    async vacateRoom(allocation_id, vacate_date) {
        const query = `
            UPDATE room_allocation
            SET vacate_date = ?, status = 'vacated', updated_at = CURRENT_TIMESTAMP
            WHERE allocation_id = ?
            RETURNING *
        `;
        const values = [vacate_date, allocation_id];

        const { rows } = await db.query(query, values);
        
        if (rows[0]) {
            // Update bed status to available
            await db.query('UPDATE beds SET status = ? WHERE bed_id = ?', ['available', rows[0].bed_id]);
        }
        
        return rows[0];
    },

    async updateAllocation(allocation_id, allocationData) {
        const { room_id, bed_id } = allocationData;

        // Get current allocation to free up old bed
        const currentQuery = `SELECT * FROM room_allocation WHERE allocation_id = ?`;
        const currentResult = await db.query(currentQuery, [allocation_id]);
        
        if (currentResult.rows[0]) {
            // Free up old bed
            await db.query('UPDATE beds SET status = ? WHERE bed_id = ?', ['available', currentResult.rows[0].bed_id]);
        }

        const query = `
            UPDATE room_allocation
            SET room_id = ?, bed_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE allocation_id = ?
            RETURNING *
        `;
        const values = [room_id, bed_id, allocation_id];

        const { rows } = await db.query(query, values);
        
        if (rows[0]) {
            // Update new bed status to occupied
            await db.query('UPDATE beds SET status = ? WHERE bed_id = ?', ['occupied', bed_id]);
        }
        
        return rows[0];
    },

    async getAllocationHistory(student_id = null) {
        let query = `
            SELECT ra.*, s.first_name, s.last_name, r.room_number, b.bed_number,
                   h.hostel_name, h.hostel_type
            FROM room_allocation ra
            JOIN students s ON ra.student_id = s.student_id
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN beds b ON ra.bed_id = b.bed_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
        `;
        let params = [];

        if (student_id) {
            query += ` WHERE ra.student_id = ?`;
            params.push(student_id);
        }

        query += ` ORDER BY ra.allocation_date DESC`;

        const { rows } = await db.query(query, params);
        return rows;
    },

    async getRoomOccupancyStats() {
        const query = `
            SELECT 
                h.hostel_id,
                h.hostel_name,
                COUNT(r.room_id) as total_rooms,
                COUNT(CASE WHEN r.status = 'full' THEN 1 END) as full_rooms,
                COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms,
                COUNT(CASE WHEN r.status = 'maintenance' THEN 1 END) as maintenance_rooms,
                COUNT(b.bed_id) as total_beds,
                COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied_beds,
                COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available_beds
            FROM hostels h
            LEFT JOIN rooms r ON h.hostel_id = r.hostel_id
            LEFT JOIN beds b ON r.room_id = b.room_id
            GROUP BY h.hostel_id, h.hostel_name
            ORDER BY h.hostel_name
        `;
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = roomAllocationModel;
