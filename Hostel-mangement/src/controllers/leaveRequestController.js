const leaveRequestModel = require('../models/leaveRequestModel.js');

const leaveRequestController = {
    async createLeaveRequest(req, res) {
        try {
            const {
                student_id,
                from_date,
                to_date,
                reason
            } = req.body;

            // Validate required fields
            if (!student_id || !from_date || !to_date || !reason) {
                return res.status(400).json({ 
                    error: 'Missing required fields: student_id, from_date, to_date, reason' 
                });
            }

            // Validate date range
            if (new Date(from_date) > new Date(to_date)) {
                return res.status(400).json({ error: 'from_date must be before or equal to to_date' });
            }

            // Check for overlapping leave requests
            const overlapping = await leaveRequestModel.getOverlappingLeaveRequests(student_id, from_date, to_date);
            if (overlapping.length > 0) {
                return res.status(400).json({ 
                    error: 'Student already has an approved leave request for this period' 
                });
            }

            const leaveRequest = await leaveRequestModel.createLeaveRequest({
                student_id,
                from_date,
                to_date,
                reason
            });

            res.status(201).json({
                message: 'Leave request created successfully',
                leaveRequest
            });
        } catch (error) {
            console.error('Error creating leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllLeaveRequests(req, res) {
        try {
            const leaveRequests = await leaveRequestModel.getAllLeaveRequests();
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLeaveRequestById(req, res) {
        try {
            const { id } = req.params;
            const leaveRequest = await leaveRequestModel.getLeaveRequestById(id);

            if (!leaveRequest) {
                return res.status(404).json({ error: 'Leave request not found' });
            }

            res.json(leaveRequest);
        } catch (error) {
            console.error('Error fetching leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLeaveRequestsByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const leaveRequests = await leaveRequestModel.getLeaveRequestsByStudent(student_id);
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching student leave requests:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLeaveRequestsByStatus(req, res) {
        try {
            const { status } = req.params;
            
            // Validate status
            const validStatuses = ['pending', 'approved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                });
            }

            const leaveRequests = await leaveRequestModel.getLeaveRequestsByStatus(status);
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching leave requests by status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLeaveRequestsByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const leaveRequests = await leaveRequestModel.getLeaveRequestsByDateRange(start_date, end_date);
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching leave requests by date range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getPendingLeaveRequests(req, res) {
        try {
            const leaveRequests = await leaveRequestModel.getPendingLeaveRequests();
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching pending leave requests:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getActiveLeaveRequests(req, res) {
        try {
            const leaveRequests = await leaveRequestModel.getActiveLeaveRequests();
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching active leave requests:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async approveLeaveRequest(req, res) {
        try {
            const { id } = req.params;

            // Check if leave request exists
            const existingLeaveRequest = await leaveRequestModel.getLeaveRequestById(id);
            if (!existingLeaveRequest) {
                return res.status(404).json({ error: 'Leave request not found' });
            }

            if (existingLeaveRequest.status !== 'pending') {
                return res.status(400).json({ error: 'Leave request is not pending' });
            }

            // Assuming user_id is available from authentication middleware
            const approved_by = req.user?.user_id;
            
            if (!approved_by) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const leaveRequest = await leaveRequestModel.approveLeaveRequest(id, approved_by);
            res.json({
                message: 'Leave request approved successfully',
                leaveRequest
            });
        } catch (error) {
            console.error('Error approving leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async rejectLeaveRequest(req, res) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;

            if (!rejection_reason) {
                return res.status(400).json({ error: 'Rejection reason is required' });
            }

            // Check if leave request exists
            const existingLeaveRequest = await leaveRequestModel.getLeaveRequestById(id);
            if (!existingLeaveRequest) {
                return res.status(404).json({ error: 'Leave request not found' });
            }

            if (existingLeaveRequest.status !== 'pending') {
                return res.status(400).json({ error: 'Leave request is not pending' });
            }

            // Assuming user_id is available from authentication middleware
            const approved_by = req.user?.user_id;
            
            if (!approved_by) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const leaveRequest = await leaveRequestModel.rejectLeaveRequest(id, approved_by, rejection_reason);
            res.json({
                message: 'Leave request rejected successfully',
                leaveRequest
            });
        } catch (error) {
            console.error('Error rejecting leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateLeaveRequest(req, res) {
        try {
            const { id } = req.params;
            const leaveData = req.body;

            // Check if leave request exists
            const existingLeaveRequest = await leaveRequestModel.getLeaveRequestById(id);
            if (!existingLeaveRequest) {
                return res.status(404).json({ error: 'Leave request not found' });
            }

            // Validate status if provided
            if (leaveData.status) {
                const validStatuses = ['pending', 'approved', 'rejected'];
                if (!validStatuses.includes(leaveData.status)) {
                    return res.status(400).json({ 
                        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                    });
                }
            }

            // Validate date range if provided
            if (leaveData.from_date && leaveData.to_date) {
                if (new Date(leaveData.from_date) > new Date(leaveData.to_date)) {
                    return res.status(400).json({ error: 'from_date must be before or equal to to_date' });
                }
            }

            const updatedLeaveRequest = await leaveRequestModel.updateLeaveRequest(id, leaveData);
            res.json({
                message: 'Leave request updated successfully',
                leaveRequest: updatedLeaveRequest
            });
        } catch (error) {
            console.error('Error updating leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteLeaveRequest(req, res) {
        try {
            const { id } = req.params;

            // Check if leave request exists
            const existingLeaveRequest = await leaveRequestModel.getLeaveRequestById(id);
            if (!existingLeaveRequest) {
                return res.status(404).json({ error: 'Leave request not found' });
            }

            await leaveRequestModel.deleteLeaveRequest(id);
            res.json({ message: 'Leave request deleted successfully' });
        } catch (error) {
            console.error('Error deleting leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLeaveStats(req, res) {
        try {
            const stats = await leaveRequestModel.getLeaveStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching leave stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLeaveStatsByMonth(req, res) {
        try {
            const { year, month } = req.params;
            
            if (!year || !month) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: year, month' 
                });
            }

            const stats = await leaveRequestModel.getLeaveStatsByMonth(parseInt(year), parseInt(month));
            res.json(stats);
        } catch (error) {
            console.error('Error fetching monthly leave stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentLeaveStats(req, res) {
        try {
            const { student_id } = req.params;
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const stats = await leaveRequestModel.getStudentLeaveStats(student_id, start_date, end_date);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching student leave stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createStudentLeaveRequest(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const {
                from_date,
                to_date,
                reason
            } = req.body;

            // Validate required fields
            if (!from_date || !to_date || !reason) {
                return res.status(400).json({ 
                    error: 'Missing required fields: from_date, to_date, reason' 
                });
            }

            // Validate date range
            if (new Date(from_date) > new Date(to_date)) {
                return res.status(400).json({ error: 'from_date must be before or equal to to_date' });
            }

            // Check for overlapping leave requests
            const overlapping = await leaveRequestModel.getOverlappingLeaveRequests(student_id, from_date, to_date);
            if (overlapping.length > 0) {
                return res.status(400).json({ 
                    error: 'You already have an approved leave request for this period' 
                });
            }

            const leaveRequest = await leaveRequestModel.createLeaveRequest({
                student_id,
                from_date,
                to_date,
                reason
            });

            res.status(201).json({
                message: 'Leave request created successfully',
                leaveRequest
            });
        } catch (error) {
            console.error('Error creating student leave request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentLeaveRequests(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const leaveRequests = await leaveRequestModel.getLeaveRequestsByStudent(student_id);
            res.json(leaveRequests);
        } catch (error) {
            console.error('Error fetching student leave requests:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = leaveRequestController;
