const messAttendanceModel = require('../models/messAttendanceModel.js');

const messAttendanceController = {
    async markAttendance(req, res) {
        try {
            const {
                student_id,
                date,
                meal_type,
                status
            } = req.body;

            // Validate required fields
            if (!student_id || !date || !meal_type || !status) {
                return res.status(400).json({ 
                    error: 'Missing required fields: student_id, date, meal_type, status' 
                });
            }

            // Validate meal_type
            const validMealTypes = ['breakfast', 'lunch', 'dinner'];
            if (!validMealTypes.includes(meal_type)) {
                return res.status(400).json({ 
                    error: 'Invalid meal_type. Must be one of: ' + validMealTypes.join(', ') 
                });
            }

            // Validate status
            const validStatuses = ['present', 'absent'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                });
            }

            const attendance = await messAttendanceModel.markAttendance({
                student_id,
                date,
                meal_type,
                status
            });

            res.status(201).json({
                message: 'Mess attendance marked successfully',
                attendance
            });
        } catch (error) {
            console.error('Error marking mess attendance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllAttendance(req, res) {
        try {
            const attendance = await messAttendanceModel.getAllAttendance();
            res.json(attendance);
        } catch (error) {
            console.error('Error fetching mess attendance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAttendanceById(req, res) {
        try {
            const { id } = req.params;
            const attendance = await messAttendanceModel.getAttendanceById(id);

            if (!attendance) {
                return res.status(404).json({ error: 'Attendance record not found' });
            }

            res.json(attendance);
        } catch (error) {
            console.error('Error fetching attendance record:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAttendanceByStudent(req, res) {
        try {
            const { student_id } = req.params;
            const attendance = await messAttendanceModel.getAttendanceByStudent(student_id);
            res.json(attendance);
        } catch (error) {
            console.error('Error fetching student attendance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAttendanceByDate(req, res) {
        try {
            const { date } = req.params;
            const attendance = await messAttendanceModel.getAttendanceByDate(date);
            res.json(attendance);
        } catch (error) {
            console.error('Error fetching attendance by date:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAttendanceByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const attendance = await messAttendanceModel.getAttendanceByDateRange(start_date, end_date);
            res.json(attendance);
        } catch (error) {
            console.error('Error fetching attendance by date range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAttendanceByMeal(req, res) {
        try {
            const { date, meal_type } = req.params;
            
            // Validate meal_type
            const validMealTypes = ['breakfast', 'lunch', 'dinner'];
            if (!validMealTypes.includes(meal_type)) {
                return res.status(400).json({ 
                    error: 'Invalid meal_type. Must be one of: ' + validMealTypes.join(', ') 
                });
            }

            const attendance = await messAttendanceModel.getAttendanceByMeal(date, meal_type);
            res.json(attendance);
        } catch (error) {
            console.error('Error fetching attendance by meal:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateAttendance(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }

            // Validate status
            const validStatuses = ['present', 'absent'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ 
                    error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
                });
            }

            // Check if attendance exists
            const existingAttendance = await messAttendanceModel.getAttendanceById(id);
            if (!existingAttendance) {
                return res.status(404).json({ error: 'Attendance record not found' });
            }

            const updatedAttendance = await messAttendanceModel.updateAttendance(id, { status });
            res.json({
                message: 'Attendance updated successfully',
                attendance: updatedAttendance
            });
        } catch (error) {
            console.error('Error updating attendance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteAttendance(req, res) {
        try {
            const { id } = req.params;

            // Check if attendance exists
            const existingAttendance = await messAttendanceModel.getAttendanceById(id);
            if (!existingAttendance) {
                return res.status(404).json({ error: 'Attendance record not found' });
            }

            await messAttendanceModel.deleteAttendance(id);
            res.json({ message: 'Attendance record deleted successfully' });
        } catch (error) {
            console.error('Error deleting attendance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAttendanceStats(req, res) {
        try {
            const { date } = req.query;
            
            if (!date) {
                return res.status(400).json({ error: 'Date query parameter is required' });
            }

            const stats = await messAttendanceModel.getAttendanceStats(date);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentAttendanceStats(req, res) {
        try {
            const { student_id } = req.params;
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const stats = await messAttendanceModel.getStudentAttendanceStats(student_id, start_date, end_date);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching student attendance stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMonthlyStats(req, res) {
        try {
            const { year, month } = req.params;
            
            if (!year || !month) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: year, month' 
                });
            }

            const stats = await messAttendanceModel.getMonthlyStats(parseInt(year), parseInt(month));
            res.json(stats);
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async bulkMarkAttendance(req, res) {
        try {
            const { attendance_records } = req.body;

            if (!attendance_records || !Array.isArray(attendance_records)) {
                return res.status(400).json({ 
                    error: 'attendance_records array is required' 
                });
            }

            // Validate each record
            for (const record of attendance_records) {
                if (!record.student_id || !record.date || !record.meal_type || !record.status) {
                    return res.status(400).json({ 
                        error: 'Each record must have: student_id, date, meal_type, status' 
                    });
                }

                const validMealTypes = ['breakfast', 'lunch', 'dinner'];
                if (!validMealTypes.includes(record.meal_type)) {
                    return res.status(400).json({ 
                        error: 'Invalid meal_type in record. Must be one of: ' + validMealTypes.join(', ') 
                    });
                }

                const validStatuses = ['present', 'absent'];
                if (!validStatuses.includes(record.status)) {
                    return res.status(400).json({ 
                        error: 'Invalid status in record. Must be one of: ' + validStatuses.join(', ') 
                    });
                }
            }

            const result = await messAttendanceModel.bulkMarkAttendance(attendance_records);
            res.status(201).json({
                message: 'Bulk attendance marked successfully',
                records_marked: attendance_records.length
            });
        } catch (error) {
            console.error('Error bulk marking attendance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = messAttendanceController;
