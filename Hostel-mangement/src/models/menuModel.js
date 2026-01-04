const db = require('../config/db.js');

const menuModel = {
    async createMenu(menuData) {
        const {
            mess_id,
            day,
            breakfast,
            lunch,
            dinner,
            is_active = true
        } = menuData;

        const query = `
            INSERT INTO menu (mess_id, day, breakfast, lunch, dinner, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
        `;
        const values = [mess_id, day, breakfast, lunch, dinner, is_active];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async getAllMenus() {
        const query = `
            SELECT m.*, mess.mess_name, h.hostel_name
            FROM menu m
            JOIN mess ON m.mess_id = mess.mess_id
            JOIN hostels h ON mess.hostel_id = h.hostel_id
            ORDER BY h.hostel_name, mess.mess_name, 
                     FIELD(m.day, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    async getMenuById(menu_id) {
        const query = `
            SELECT m.*, mess.mess_name, h.hostel_name
            FROM menu m
            JOIN mess ON m.mess_id = mess.mess_id
            JOIN hostels h ON mess.hostel_id = h.hostel_id
            WHERE m.menu_id = ?
        `;
        const { rows } = await db.query(query, [menu_id]);
        return rows[0];
    },

    async getMenusByMess(mess_id) {
        const query = `
            SELECT m.*, mess.mess_name, h.hostel_name
            FROM menu m
            JOIN mess ON m.mess_id = mess.mess_id
            JOIN hostels h ON mess.hostel_id = h.hostel_id
            WHERE m.mess_id = ?
            ORDER BY FIELD(m.day, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows;
    },

    async getWeeklyMenu(mess_id) {
        const query = `
            SELECT m.*, mess.mess_name, h.hostel_name
            FROM menu m
            JOIN mess ON m.mess_id = mess.mess_id
            JOIN hostels h ON mess.hostel_id = h.hostel_id
            WHERE m.mess_id = ? AND m.is_active = true
            ORDER BY FIELD(m.day, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows;
    },

    async getMenuByDay(mess_id, day) {
        const query = `
            SELECT m.*, mess.mess_name, h.hostel_name
            FROM menu m
            JOIN mess ON m.mess_id = mess.mess_id
            JOIN hostels h ON mess.hostel_id = h.hostel_id
            WHERE m.mess_id = ? AND m.day = ?
        `;
        const { rows } = await db.query(query, [mess_id, day]);
        return rows[0];
    },

    async updateMenu(menu_id, menuData) {
        const {
            breakfast,
            lunch,
            dinner,
            is_active
        } = menuData;

        const query = `
            UPDATE menu
            SET breakfast = ?, lunch = ?, dinner = ?, is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE menu_id = ?
            RETURNING *
        `;
        const values = [breakfast, lunch, dinner, is_active, menu_id];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async deleteMenu(menu_id) {
        const query = `
            DELETE FROM menu
            WHERE menu_id = ?
            RETURNING menu_id
        `;
        const { rows } = await db.query(query, [menu_id]);
        return rows[0];
    },

    async activateMenu(menu_id) {
        const query = `
            UPDATE menu
            SET is_active = true, updated_at = CURRENT_TIMESTAMP
            WHERE menu_id = ?
            RETURNING *
        `;
        const { rows } = await db.query(query, [menu_id]);
        return rows[0];
    },

    async deactivateMenu(menu_id) {
        const query = `
            UPDATE menu
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE menu_id = ?
            RETURNING *
        `;
        const { rows } = await db.query(query, [menu_id]);
        return rows[0];
    },

    async getTodayMenu(mess_id) {
        const query = `
            SELECT m.*, mess.mess_name, h.hostel_name
            FROM menu m
            JOIN mess ON m.mess_id = mess.mess_id
            JOIN hostels h ON mess.hostel_id = h.hostel_id
            WHERE m.mess_id = ? AND m.day = DAYNAME(CURDATE()) AND m.is_active = true
        `;
        const { rows } = await db.query(query, [mess_id]);
        return rows[0];
    }
};

module.exports = menuModel;
