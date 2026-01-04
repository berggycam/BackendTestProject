const complaintModel = require('../models/complaintModel.js');

const complaintController = {
    async createComplaint(req, res) {
        try {
            const {
                student_id,
                complaint_type,
                description,
                priority = 'medium'
            } = req.body;

            // Validate required fields
            if (!student_id || !complaint_type || !description) {
                return res.status(400).json({ 
                    error: 'Missing required fields: student_id, complaint_type, description' 
                });
            }

            // Validate complaint_type
            const validTypes = ['electricity', 'water', 'cleaning', 'furniture', 'internet', 'other'];
            if (!validTypes.includes(complaint_type)) {
                return res.status(400).json({ 
                    error: 'Invalid complaint_type. Must be one of: ' + validTypes.join(', ') 
                });
            }

            // Validate priority
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({ 
                    error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') 
                });
            }

            const complaint = await complaintModel.createComplaint({
                student_id,
                complaint_type,
                description,
                priority
            });

            res.status(201).json({
                message: 'Complaint created successfully',
                complaint
            });
        } catch (error) {
            console.error('Error creating complaint:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllComplaints(req, res) {
        try {
            const complaints = await complaintModel.getAllComplaints();
            res.json(complaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintById(req, res) {
        try {
            const { id } = req.params;
            const complaint = await complaintModel.getComplaintById(id);

            if (!complaint) {
                return res.status(404).json({ error: 'Complaint not found' });
            }

            res.json(complaint);
        } catch (error) {
            console.error('Error fetching complaint:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintsByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const complaints = await complaintModel.getComplaintsByStudent(student_id);
            res.json(complaints);
        } catch (error) {
            console.error('Error fetching student complaints:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintsByStatus(req, res) {
        try {
            const { status } = req.params;
            const complaints = await complaintModel.getComplaintsByStatus(status);
            res.json(complaints);
        } catch (error) {
            console.error('Error fetching complaints by status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintsByType(req, res) {
        try {
            const { type } = req.params;
            const complaints = await complaintModel.getComplaintsByType(type);
            res.json(complaints);
        } catch (error) {
            console.error('Error fetching complaints by type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintsByPriority(req, res) {
        try {
            const { priority } = req.params;
            const complaints = await complaintModel.getComplaintsByPriority(priority);
            res.json(complaints);
        } catch (error) {
            console.error('Error fetching complaints by priority:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateComplaint(req, res) {
        try {
            const { id } = req.params;
            const complaintData = req.body;

            // Check if complaint exists
            const existingComplaint = await complaintModel.getComplaintById(id);
            if (!existingComplaint) {
                return res.status(404).json({ error: 'Complaint not found' });
            }

            // Validate complaint_type if provided
            if (complaintData.complaint_type) {
                const validTypes = ['electricity', 'water', 'cleaning', 'furniture', 'internet', 'other'];
                if (!validTypes.includes(complaintData.complaint_type)) {
                    return res.status(400).json({ 
                        error: 'Invalid complaint_type. Must be one of: ' + validTypes.join(', ') 
                    });
                }
            }

            // Validate priority if provided
            if (complaintData.priority) {
                const validPriorities = ['low', 'medium', 'high'];
                if (!validPriorities.includes(complaintData.priority)) {
                    return res.status(400).json({ 
                        error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') 
                    });
                }
            }

            // Validate status if provided
            if (complaintData.status) {
                const validStatuses = ['open', 'in-progress', 'resolved'];
                if (!validStatuses.includes(complaintData.status)) {
                    return res.status(400).json({ 
                        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                    });
                }
            }

            const updatedComplaint = await complaintModel.updateComplaint(id, complaintData);
            res.json({
                message: 'Complaint updated successfully',
                complaint: updatedComplaint
            });
        } catch (error) {
            console.error('Error updating complaint:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async resolveComplaint(req, res) {
        try {
            const { id } = req.params;
            const { resolution_remarks } = req.body;

            // Check if complaint exists
            const existingComplaint = await complaintModel.getComplaintById(id);
            if (!existingComplaint) {
                return res.status(404).json({ error: 'Complaint not found' });
            }

            if (existingComplaint.status === 'resolved') {
                return res.status(400).json({ error: 'Complaint is already resolved' });
            }

            // Assuming user_id is available from authentication middleware
            const resolved_by = req.user?.user_id;
            
            if (!resolved_by) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const complaint = await complaintModel.resolveComplaint(id, resolved_by, resolution_remarks);
            res.json({
                message: 'Complaint resolved successfully',
                complaint
            });
        } catch (error) {
            console.error('Error resolving complaint:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteComplaint(req, res) {
        try {
            const { id } = req.params;

            // Check if complaint exists
            const existingComplaint = await complaintModel.getComplaintById(id);
            if (!existingComplaint) {
                return res.status(404).json({ error: 'Complaint not found' });
            }

            await complaintModel.deleteComplaint(id);
            res.json({ message: 'Complaint deleted successfully' });
        } catch (error) {
            console.error('Error deleting complaint:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintStats(req, res) {
        try {
            const stats = await complaintModel.getComplaintStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching complaint stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getComplaintStatsByType(req, res) {
        try {
            const stats = await complaintModel.getComplaintStatsByType();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching complaint stats by type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createStudentComplaint(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const {
                complaint_type,
                description,
                priority = 'medium'
            } = req.body;

            // Validate required fields
            if (!complaint_type || !description) {
                return res.status(400).json({ 
                    error: 'Missing required fields: complaint_type, description' 
                });
            }

            // Validate complaint_type
            const validTypes = ['electricity', 'water', 'cleaning', 'furniture', 'internet', 'other'];
            if (!validTypes.includes(complaint_type)) {
                return res.status(400).json({ 
                    error: 'Invalid complaint_type. Must be one of: ' + validTypes.join(', ') 
                });
            }

            const complaint = await complaintModel.createComplaint({
                student_id,
                complaint_type,
                description,
                priority
            });

            res.status(201).json({
                message: 'Complaint created successfully',
                complaint
            });
        } catch (error) {
            console.error('Error creating student complaint:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentComplaints(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const complaints = await complaintModel.getComplaintsByStudent(student_id);
            res.json(complaints);
        } catch (error) {
            console.error('Error fetching student complaints:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = complaintController;
