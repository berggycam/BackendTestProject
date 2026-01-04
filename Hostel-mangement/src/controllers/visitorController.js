const visitorModel = require('../models/visitorModel.js');

const visitorController = {
    async createVisitor(req, res) {
        try {
            const {
                student_id,
                visitor_name,
                relation,
                visit_date,
                in_time,
                purpose
            } = req.body;

            // Validate required fields
            if (!student_id || !visitor_name || !relation || !visit_date || !in_time) {
                return res.status(400).json({ 
                    error: 'Missing required fields: student_id, visitor_name, relation, visit_date, in_time' 
                });
            }

            const visitor = await visitorModel.createVisitor({
                student_id,
                visitor_name,
                relation,
                visit_date,
                in_time,
                purpose
            });

            res.status(201).json({
                message: 'Visitor registered successfully',
                visitor
            });
        } catch (error) {
            console.error('Error creating visitor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllVisitors(req, res) {
        try {
            const visitors = await visitorModel.getAllVisitors();
            res.json(visitors);
        } catch (error) {
            console.error('Error fetching visitors:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getVisitorById(req, res) {
        try {
            const { id } = req.params;
            const visitor = await visitorModel.getVisitorById(id);

            if (!visitor) {
                return res.status(404).json({ error: 'Visitor not found' });
            }

            res.json(visitor);
        } catch (error) {
            console.error('Error fetching visitor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getVisitorsByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const visitors = await visitorModel.getVisitorsByStudent(student_id);
            res.json(visitors);
        } catch (error) {
            console.error('Error fetching student visitors:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getVisitorsByDate(req, res) {
        try {
            const { date } = req.params;
            const visitors = await visitorModel.getVisitorsByDate(date);
            res.json(visitors);
        } catch (error) {
            console.error('Error fetching visitors by date:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getVisitorsByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const visitors = await visitorModel.getVisitorsByDateRange(start_date, end_date);
            res.json(visitors);
        } catch (error) {
            console.error('Error fetching visitors by date range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getActiveVisitors(req, res) {
        try {
            const visitors = await visitorModel.getActiveVisitors();
            res.json(visitors);
        } catch (error) {
            console.error('Error fetching active visitors:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateVisitor(req, res) {
        try {
            const { id } = req.params;
            const visitorData = req.body;

            // Check if visitor exists
            const existingVisitor = await visitorModel.getVisitorById(id);
            if (!existingVisitor) {
                return res.status(404).json({ error: 'Visitor not found' });
            }

            const updatedVisitor = await visitorModel.updateVisitor(id, visitorData);
            res.json({
                message: 'Visitor updated successfully',
                visitor: updatedVisitor
            });
        } catch (error) {
            console.error('Error updating visitor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async checkOutVisitor(req, res) {
        try {
            const { id } = req.params;
            const { out_time } = req.body;

            if (!out_time) {
                return res.status(400).json({ error: 'Out time is required' });
            }

            // Check if visitor exists
            const existingVisitor = await visitorModel.getVisitorById(id);
            if (!existingVisitor) {
                return res.status(404).json({ error: 'Visitor not found' });
            }

            if (existingVisitor.out_time) {
                return res.status(400).json({ error: 'Visitor already checked out' });
            }

            const visitor = await visitorModel.checkOutVisitor(id, out_time);
            res.json({
                message: 'Visitor checked out successfully',
                visitor
            });
        } catch (error) {
            console.error('Error checking out visitor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteVisitor(req, res) {
        try {
            const { id } = req.params;

            // Check if visitor exists
            const existingVisitor = await visitorModel.getVisitorById(id);
            if (!existingVisitor) {
                return res.status(404).json({ error: 'Visitor not found' });
            }

            await visitorModel.deleteVisitor(id);
            res.json({ message: 'Visitor deleted successfully' });
        } catch (error) {
            console.error('Error deleting visitor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getVisitorStats(req, res) {
        try {
            const stats = await visitorModel.getVisitorStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching visitor stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getVisitorStatsByMonth(req, res) {
        try {
            const { year, month } = req.params;
            
            if (!year || !month) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: year, month' 
                });
            }

            const stats = await visitorModel.getVisitorStatsByMonth(parseInt(year), parseInt(month));
            res.json(stats);
        } catch (error) {
            console.error('Error fetching visitor stats by month:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFrequentVisitors(req, res) {
        try {
            const { limit = 10 } = req.query;
            const frequentVisitors = await visitorModel.getFrequentVisitors(parseInt(limit));
            res.json(frequentVisitors);
        } catch (error) {
            console.error('Error fetching frequent visitors:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createStudentVisitor(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const {
                visitor_name,
                relation,
                visit_date,
                in_time,
                purpose
            } = req.body;

            // Validate required fields
            if (!visitor_name || !relation || !visit_date || !in_time) {
                return res.status(400).json({ 
                    error: 'Missing required fields: visitor_name, relation, visit_date, in_time' 
                });
            }

            const visitor = await visitorModel.createVisitor({
                student_id,
                visitor_name,
                relation,
                visit_date,
                in_time,
                purpose
            });

            res.status(201).json({
                message: 'Visitor registered successfully',
                visitor
            });
        } catch (error) {
            console.error('Error creating student visitor:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentVisitors(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const visitors = await visitorModel.getVisitorsByStudent(student_id);
            res.json(visitors);
        } catch (error) {
            console.error('Error fetching student visitors:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = visitorController;
