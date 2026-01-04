const gateEntryModel = require('../models/gateEntryModel.js');

const gateEntryController = {
    async createGateEntry(req, res) {
        try {
            const {
                student_id,
                date,
                in_time = null,
                out_time = null,
                purpose = null
            } = req.body;

            // Validate required fields
            if (!student_id || !date) {
                return res.status(400).json({ 
                    error: 'Missing required fields: student_id, date' 
                });
            }

            // Validate that at least one time is provided
            if (!in_time && !out_time) {
                return res.status(400).json({ 
                    error: 'At least one of in_time or out_time must be provided' 
                });
            }

            const gateEntry = await gateEntryModel.createGateEntry({
                student_id,
                date,
                in_time,
                out_time,
                purpose
            });

            res.status(201).json({
                message: 'Gate entry recorded successfully',
                gateEntry
            });
        } catch (error) {
            console.error('Error creating gate entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllGateEntries(req, res) {
        try {
            const gateEntries = await gateEntryModel.getAllGateEntries();
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching gate entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getGateEntryById(req, res) {
        try {
            const { id } = req.params;
            const gateEntry = await gateEntryModel.getGateEntryById(id);

            if (!gateEntry) {
                return res.status(404).json({ error: 'Gate entry not found' });
            }

            res.json(gateEntry);
        } catch (error) {
            console.error('Error fetching gate entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getGateEntriesByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const gateEntries = await gateEntryModel.getGateEntriesByStudent(student_id);
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching student gate entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getGateEntriesByDate(req, res) {
        try {
            const { date } = req.params;
            const gateEntries = await gateEntryModel.getGateEntriesByDate(date);
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching gate entries by date:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getGateEntriesByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const gateEntries = await gateEntryModel.getGateEntriesByDateRange(start_date, end_date);
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching gate entries by date range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getTodayGateEntries(req, res) {
        try {
            const gateEntries = await gateEntryModel.getTodayGateEntries();
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching today gate entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getActiveGateEntries(req, res) {
        try {
            const gateEntries = await gateEntryModel.getActiveGateEntries();
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching active gate entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentsOutside(req, res) {
        try {
            const students = await gateEntryModel.getStudentsOutside();
            res.json(students);
        } catch (error) {
            console.error('Error fetching students outside:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async recordEntry(req, res) {
        try {
            const { id } = req.params;
            const { in_time } = req.body;

            if (!in_time) {
                return res.status(400).json({ error: 'in_time is required' });
            }

            // Check if gate entry exists
            const existingGateEntry = await gateEntryModel.getGateEntryById(id);
            if (!existingGateEntry) {
                return res.status(404).json({ error: 'Gate entry not found' });
            }

            const gateEntry = await gateEntryModel.recordEntry(id, in_time);
            res.json({
                message: 'Entry time recorded successfully',
                gateEntry
            });
        } catch (error) {
            console.error('Error recording entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async recordExit(req, res) {
        try {
            const { id } = req.params;
            const { out_time } = req.body;

            if (!out_time) {
                return res.status(400).json({ error: 'out_time is required' });
            }

            // Check if gate entry exists
            const existingGateEntry = await gateEntryModel.getGateEntryById(id);
            if (!existingGateEntry) {
                return res.status(404).json({ error: 'Gate entry not found' });
            }

            const gateEntry = await gateEntryModel.recordExit(id, out_time);
            res.json({
                message: 'Exit time recorded successfully',
                gateEntry
            });
        } catch (error) {
            console.error('Error recording exit:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateGateEntry(req, res) {
        try {
            const { id } = req.params;
            const entryData = req.body;

            // Check if gate entry exists
            const existingGateEntry = await gateEntryModel.getGateEntryById(id);
            if (!existingGateEntry) {
                return res.status(404).json({ error: 'Gate entry not found' });
            }

            const updatedGateEntry = await gateEntryModel.updateGateEntry(id, entryData);
            res.json({
                message: 'Gate entry updated successfully',
                gateEntry: updatedGateEntry
            });
        } catch (error) {
            console.error('Error updating gate entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteGateEntry(req, res) {
        try {
            const { id } = req.params;

            // Check if gate entry exists
            const existingGateEntry = await gateEntryModel.getGateEntryById(id);
            if (!existingGateEntry) {
                return res.status(404).json({ error: 'Gate entry not found' });
            }

            await gateEntryModel.deleteGateEntry(id);
            res.json({ message: 'Gate entry deleted successfully' });
        } catch (error) {
            console.error('Error deleting gate entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getGateEntryStats(req, res) {
        try {
            const { date } = req.query;
            
            if (!date) {
                return res.status(400).json({ error: 'Date query parameter is required' });
            }

            const stats = await gateEntryModel.getGateEntryStats(date);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching gate entry stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getGateEntryStatsByMonth(req, res) {
        try {
            const { year, month } = req.params;
            
            if (!year || !month) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: year, month' 
                });
            }

            const stats = await gateEntryModel.getGateEntryStatsByMonth(parseInt(year), parseInt(month));
            res.json(stats);
        } catch (error) {
            console.error('Error fetching monthly gate entry stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentGateStats(req, res) {
        try {
            const { student_id } = req.params;
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const stats = await gateEntryModel.getStudentGateStats(student_id, start_date, end_date);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching student gate stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFrequentExitStudents(req, res) {
        try {
            const { limit = 10 } = req.query;
            const students = await gateEntryModel.getFrequentExitStudents(parseInt(limit));
            res.json(students);
        } catch (error) {
            console.error('Error fetching frequent exit students:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLateNightEntries(req, res) {
        try {
            const { date } = req.query;
            const { hour = 22 } = req.query;
            
            if (!date) {
                return res.status(400).json({ error: 'Date query parameter is required' });
            }

            const entries = await gateEntryModel.getLateNightEntries(date, parseInt(hour));
            res.json(entries);
        } catch (error) {
            console.error('Error fetching late night entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAbsentStudents(req, res) {
        try {
            const { date } = req.query;
            
            if (!date) {
                return res.status(400).json({ error: 'Date query parameter is required' });
            }

            const students = await gateEntryModel.getAbsentStudents(date);
            res.json(students);
        } catch (error) {
            console.error('Error fetching absent students:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createStudentGateEntry(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const {
                date,
                in_time = null,
                out_time = null,
                purpose = null
            } = req.body;

            // Validate required fields
            if (!date) {
                return res.status(400).json({ 
                    error: 'Missing required field: date' 
                });
            }

            // Validate that at least one time is provided
            if (!in_time && !out_time) {
                return res.status(400).json({ 
                    error: 'At least one of in_time or out_time must be provided' 
                });
            }

            const gateEntry = await gateEntryModel.createGateEntry({
                student_id,
                date,
                in_time,
                out_time,
                purpose
            });

            res.status(201).json({
                message: 'Gate entry recorded successfully',
                gateEntry
            });
        } catch (error) {
            console.error('Error creating student gate entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentGateEntries(req, res) {
        try {
            // Assuming student_id is available from authentication middleware
            const student_id = req.user?.student_id;
            
            if (!student_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const gateEntries = await gateEntryModel.getGateEntriesByStudent(student_id);
            res.json(gateEntries);
        } catch (error) {
            console.error('Error fetching student gate entries:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = gateEntryController;
