const hostelModel = require('../models/hostelModel.js');

const hostelController = {
    async createHostel(req, res) {
        try {
            const {
                hostel_name,
                hostel_type,
                address,
                warden_name,
                warden_contact,
                total_rooms = 0
            } = req.body;

            // Validate required fields
            if (!hostel_name || !hostel_type || !address || !warden_name || !warden_contact) {
                return res.status(400).json({ 
                    error: 'Missing required fields: hostel_name, hostel_type, address, warden_name, warden_contact' 
                });
            }

            // Check if hostel name already exists
            const existingHostels = await hostelModel.getAllHostels();
            if (existingHostels.find(h => h.hostel_name === hostel_name)) {
                return res.status(400).json({ error: 'Hostel name already exists' });
            }

            const hostel = await hostelModel.createHostel({
                hostel_name,
                hostel_type,
                address,
                warden_name,
                warden_contact,
                total_rooms
            });

            res.status(201).json({
                message: 'Hostel created successfully',
                hostel
            });
        } catch (error) {
            console.error('Error creating hostel:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllHostels(req, res) {
        try {
            const hostels = await hostelModel.getAllHostels();
            res.json(hostels);
        } catch (error) {
            console.error('Error fetching hostels:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getHostelById(req, res) {
        try {
            const { id } = req.params;
            const hostel = await hostelModel.getHostelById(id);

            if (!hostel) {
                return res.status(404).json({ error: 'Hostel not found' });
            }

            res.json(hostel);
        } catch (error) {
            console.error('Error fetching hostel:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getHostelWithRooms(req, res) {
        try {
            const { id } = req.params;
            const result = await hostelModel.getHostelWithRooms(id);

            if (!result.hostel) {
                return res.status(404).json({ error: 'Hostel not found' });
            }

            res.json(result);
        } catch (error) {
            console.error('Error fetching hostel with rooms:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateHostel(req, res) {
        try {
            const { id } = req.params;
            const hostelData = req.body;

            // Check if hostel exists
            const existingHostel = await hostelModel.getHostelById(id);
            if (!existingHostel) {
                return res.status(404).json({ error: 'Hostel not found' });
            }

            // Check if hostel name is being updated and if it already exists
            if (hostelData.hostel_name && hostelData.hostel_name !== existingHostel.hostel_name) {
                const allHostels = await hostelModel.getAllHostels();
                const nameExists = allHostels.find(h => h.hostel_name === hostelData.hostel_name && h.hostel_id != id);
                if (nameExists) {
                    return res.status(400).json({ error: 'Hostel name already exists' });
                }
            }

            const updatedHostel = await hostelModel.updateHostel(id, hostelData);
            res.json({
                message: 'Hostel updated successfully',
                hostel: updatedHostel
            });
        } catch (error) {
            console.error('Error updating hostel:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteHostel(req, res) {
        try {
            const { id } = req.params;

            // Check if hostel exists
            const existingHostel = await hostelModel.getHostelById(id);
            if (!existingHostel) {
                return res.status(404).json({ error: 'Hostel not found' });
            }

            await hostelModel.deleteHostel(id);
            res.json({ message: 'Hostel deleted successfully' });
        } catch (error) {
            console.error('Error deleting hostel:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getHostelsByType(req, res) {
        try {
            const { type } = req.params;
            const hostels = await hostelModel.getHostelsByType(type);
            res.json(hostels);
        } catch (error) {
            console.error('Error fetching hostels by type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = hostelController;
