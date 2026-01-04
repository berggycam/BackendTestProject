const roomAllocationModel = require('../models/roomAllocationModel.js');
const bedModel = require('../models/bedModel.js');

const roomAllocationController = {
    async allocateRoom(req, res) {
        try {
            const {
                student_id,
                room_id,
                bed_id,
                allocation_date
            } = req.body;

            // Validate required fields
            if (!student_id || !room_id || !bed_id || !allocation_date) {
                return res.status(400).json({ 
                    error: 'Missing required fields: student_id, room_id, bed_id, allocation_date' 
                });
            }

            // Check if bed is available
            const bed = await bedModel.getBedById(bed_id);
            if (!bed || bed.status !== 'available') {
                return res.status(400).json({ error: 'Bed is not available' });
            }

            // Check if student already has an active allocation
            const existingAllocation = await roomAllocationModel.getAllocationByStudent(student_id);
            if (existingAllocation) {
                return res.status(400).json({ error: 'Student already has an active room allocation' });
            }

            const allocation = await roomAllocationModel.allocateRoom({
                student_id,
                room_id,
                bed_id,
                allocation_date
            });

            res.status(201).json({
                message: 'Room allocated successfully',
                allocation
            });
        } catch (error) {
            console.error('Error allocating room:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllAllocations(req, res) {
        try {
            const allocations = await roomAllocationModel.getAllAllocations();
            res.json(allocations);
        } catch (error) {
            console.error('Error fetching allocations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllocationById(req, res) {
        try {
            const { id } = req.params;
            const allocation = await roomAllocationModel.getAllocationById(id);

            if (!allocation) {
                return res.status(404).json({ error: 'Allocation not found' });
            }

            res.json(allocation);
        } catch (error) {
            console.error('Error fetching allocation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllocationByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const allocation = await roomAllocationModel.getAllocationByStudent(student_id);
            
            if (!allocation) {
                return res.status(404).json({ error: 'No active allocation found for this student' });
            }

            res.json(allocation);
        } catch (error) {
            console.error('Error fetching student allocation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllocationsByRoom(req, res) {
        try {
            const { room_id } = req.params;
            const allocations = await roomAllocationModel.getAllocationsByRoom(room_id);
            res.json(allocations);
        } catch (error) {
            console.error('Error fetching room allocations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllocationsByHostel(req, res) {
        try {
            const { hostel_id } = req.params;
            const allocations = await roomAllocationModel.getAllocationsByHostel(hostel_id);
            res.json(allocations);
        } catch (error) {
            console.error('Error fetching hostel allocations:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async vacateRoom(req, res) {
        try {
            const { id } = req.params;
            const { vacate_date } = req.body;

            if (!vacate_date) {
                return res.status(400).json({ error: 'Vacate date is required' });
            }

            // Check if allocation exists
            const existingAllocation = await roomAllocationModel.getAllocationById(id);
            if (!existingAllocation) {
                return res.status(404).json({ error: 'Allocation not found' });
            }

            if (existingAllocation.status === 'vacated') {
                return res.status(400).json({ error: 'Room already vacated' });
            }

            const allocation = await roomAllocationModel.vacateRoom(id, vacate_date);
            res.json({
                message: 'Room vacated successfully',
                allocation
            });
        } catch (error) {
            console.error('Error vacating room:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateAllocation(req, res) {
        try {
            const { id } = req.params;
            const { room_id, bed_id } = req.body;

            if (!room_id || !bed_id) {
                return res.status(400).json({ error: 'Room ID and Bed ID are required' });
            }

            // Check if allocation exists
            const existingAllocation = await roomAllocationModel.getAllocationById(id);
            if (!existingAllocation) {
                return res.status(404).json({ error: 'Allocation not found' });
            }

            // Check if new bed is available
            const bed = await bedModel.getBedById(bed_id);
            if (!bed || bed.status !== 'available') {
                return res.status(400).json({ error: 'New bed is not available' });
            }

            const allocation = await roomAllocationModel.updateAllocation(id, { room_id, bed_id });
            res.json({
                message: 'Allocation updated successfully',
                allocation
            });
        } catch (error) {
            console.error('Error updating allocation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllocationHistory(req, res) {
        try {
            const { student_id } = req.query;
            const history = await roomAllocationModel.getAllocationHistory(student_id);
            res.json(history);
        } catch (error) {
            console.error('Error fetching allocation history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getRoomOccupancyStats(req, res) {
        try {
            const stats = await roomAllocationModel.getRoomOccupancyStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching occupancy stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentCurrentAllocation(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const allocation = await roomAllocationModel.getAllocationByStudent(student_id);
            
            if (!allocation) {
                return res.status(404).json({ error: 'No active room allocation found' });
            }

            res.json(allocation);
        } catch (error) {
            console.error('Error fetching student allocation:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = roomAllocationController;
