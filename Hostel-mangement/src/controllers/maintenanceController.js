const maintenanceModel = require('../models/maintenanceModel.js');

const maintenanceController = {
    async createMaintenance(req, res) {
        try {
            const {
                room_id,
                issue,
                description,
                reported_date,
                priority = 'medium'
            } = req.body;

            // Validate required fields
            if (!room_id || !issue || !reported_date) {
                return res.status(400).json({ 
                    error: 'Missing required fields: room_id, issue, reported_date' 
                });
            }

            // Validate priority
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ 
                    error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') 
                });
            }

            const maintenance = await maintenanceModel.createMaintenance({
                room_id,
                issue,
                description,
                reported_date,
                priority
            });

            res.status(201).json({
                message: 'Maintenance request created successfully',
                maintenance
            });
        } catch (error) {
            console.error('Error creating maintenance request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllMaintenance(req, res) {
        try {
            const maintenance = await maintenanceModel.getAllMaintenance();
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceById(req, res) {
        try {
            const { id } = req.params;
            const maintenance = await maintenanceModel.getMaintenanceById(id);

            if (!maintenance) {
                return res.status(404).json({ error: 'Maintenance request not found' });
            }

            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceByRoom(req, res) {
        try {
            const { room_id } = req.params;
            const maintenance = await maintenanceModel.getMaintenanceByRoom(room_id);
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching room maintenance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceByStatus(req, res) {
        try {
            const { status } = req.params;
            
            // Validate status
            const validStatuses = ['pending', 'in-progress', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                });
            }

            const maintenance = await maintenanceModel.getMaintenanceByStatus(status);
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance by status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceByPriority(req, res) {
        try {
            const { priority } = req.params;
            
            // Validate priority
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ 
                    error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') 
                });
            }

            const maintenance = await maintenanceModel.getMaintenanceByPriority(priority);
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance by priority:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceByAssignedTo(req, res) {
        try {
            const { assigned_to } = req.params;
            const maintenance = await maintenanceModel.getMaintenanceByAssignedTo(assigned_to);
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance by assigned staff:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const maintenance = await maintenanceModel.getMaintenanceByDateRange(start_date, end_date);
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance by date range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateMaintenance(req, res) {
        try {
            const { id } = req.params;
            const maintenanceData = req.body;

            // Check if maintenance exists
            const existingMaintenance = await maintenanceModel.getMaintenanceById(id);
            if (!existingMaintenance) {
                return res.status(404).json({ error: 'Maintenance request not found' });
            }

            // Validate status if provided
            if (maintenanceData.status) {
                const validStatuses = ['pending', 'in-progress', 'completed'];
                if (!validStatuses.includes(maintenanceData.status)) {
                    return res.status(400).json({ 
                        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                    });
                }
            }

            const updatedMaintenance = await maintenanceModel.updateMaintenance(id, maintenanceData);
            res.json({
                message: 'Maintenance request updated successfully',
                maintenance: updatedMaintenance
            });
        } catch (error) {
            console.error('Error updating maintenance request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async assignMaintenance(req, res) {
        try {
            const { id } = req.params;
            const { assigned_to } = req.body;

            if (!assigned_to) {
                return res.status(400).json({ error: 'assigned_to is required' });
            }

            // Check if maintenance exists
            const existingMaintenance = await maintenanceModel.getMaintenanceById(id);
            if (!existingMaintenance) {
                return res.status(404).json({ error: 'Maintenance request not found' });
            }

            const maintenance = await maintenanceModel.assignMaintenance(id, assigned_to);
            res.json({
                message: 'Maintenance request assigned successfully',
                maintenance
            });
        } catch (error) {
            console.error('Error assigning maintenance request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async completeMaintenance(req, res) {
        try {
            const { id } = req.params;
            const { resolved_date, cost } = req.body;

            if (!resolved_date) {
                return res.status(400).json({ error: 'resolved_date is required' });
            }

            // Check if maintenance exists
            const existingMaintenance = await maintenanceModel.getMaintenanceById(id);
            if (!existingMaintenance) {
                return res.status(404).json({ error: 'Maintenance request not found' });
            }

            const maintenance = await maintenanceModel.completeMaintenance(id, resolved_date, cost);
            res.json({
                message: 'Maintenance request completed successfully',
                maintenance
            });
        } catch (error) {
            console.error('Error completing maintenance request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteMaintenance(req, res) {
        try {
            const { id } = req.params;

            // Check if maintenance exists
            const existingMaintenance = await maintenanceModel.getMaintenanceById(id);
            if (!existingMaintenance) {
                return res.status(404).json({ error: 'Maintenance request not found' });
            }

            await maintenanceModel.deleteMaintenance(id);
            res.json({ message: 'Maintenance request deleted successfully' });
        } catch (error) {
            console.error('Error deleting maintenance request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceStats(req, res) {
        try {
            const stats = await maintenanceModel.getMaintenanceStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching maintenance stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMaintenanceStatsByMonth(req, res) {
        try {
            const { year, month } = req.params;
            
            if (!year || !month) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: year, month' 
                });
            }

            const stats = await maintenanceModel.getMaintenanceStatsByMonth(parseInt(year), parseInt(month));
            res.json(stats);
        } catch (error) {
            console.error('Error fetching monthly maintenance stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getPendingMaintenance(req, res) {
        try {
            const maintenance = await maintenanceModel.getPendingMaintenance();
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching pending maintenance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getOverdueMaintenance(req, res) {
        try {
            const maintenance = await maintenanceModel.getOverdueMaintenance();
            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching overdue maintenance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = maintenanceController;
