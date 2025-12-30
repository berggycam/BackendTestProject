const guestModel = require('../models/guestModel');

const guestController = {

    async getGuests(req, res) {
        try {
            const guests = await guestModel.getGuests();
            res.json(guests);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getGuestById(req, res) {
        try {
            const guest = await guestModel.getGuestById(req.params.id);

            if (!guest) {
                return res.status(404).json({ message: "Guest not found" });
            }

            res.json(guest);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async createGuest(req, res) {
        try {
            const guest = await guestModel.createGuest(req.body);
            res.status(201).json(guest);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async updateGuest(req, res) {
        try {
            const updated = await guestModel.updateGuest(
                req.params.id,
                req.body
            );

            if (!updated) {
                return res.status(404).json({ message: "Guest not found" });
            }

            res.json({ message: "Guest updated successfully" });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    async deleteGuest(req, res) {
        try {
            const deleted = await guestModel.deleteGuest(req.params.id);

            if (!deleted) {
                return res.status(404).json({ message: "Guest not found" });
            }

            res.json({ message: "Guest deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = guestController;
