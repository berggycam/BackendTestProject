const express = require('express');
const router = express.Router();
const studentAttendanceController = require('../controllers/studentAttendanceController.js');

// Admin routes
router.post('/', studentAttendanceController.markAttendance);
router.get('/', studentAttendanceController.getAllAttendance);
router.get('/stats', studentAttendanceController.getAttendanceStats);
router.get('/stats/month/:year/:month', studentAttendanceController.getMonthlyStats);
router.get('/today', studentAttendanceController.getTodayAttendance);
router.get('/absent', studentAttendanceController.getAbsentStudents);
router.get('/date/:date', studentAttendanceController.getAttendanceByDate);
router.get('/date-range', studentAttendanceController.getAttendanceByDateRange);
router.get('/status/:status', studentAttendanceController.getAttendanceByStatus);
router.get('/student/:student_id', studentAttendanceController.getAttendanceByStudent);
router.get('/student/:student_id/stats', studentAttendanceController.getStudentAttendanceStats);
router.get('/marked-by/:marked_by', studentAttendanceController.getAttendanceByMarkedBy);
router.get('/:id', studentAttendanceController.getAttendanceById);
router.put('/:id', studentAttendanceController.updateAttendance);
router.delete('/:id', studentAttendanceController.deleteAttendance);
router.post('/bulk', studentAttendanceController.bulkMarkAttendance);

module.exports = router;
