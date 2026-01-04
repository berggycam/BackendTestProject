const express = require('express');
const router = express.Router();
const messAttendanceController = require('../controllers/messAttendanceController.js');

// Admin routes
router.post('/', messAttendanceController.markAttendance);
router.get('/', messAttendanceController.getAllAttendance);
router.get('/stats', messAttendanceController.getAttendanceStats);
router.get('/stats/month/:year/:month', messAttendanceController.getMonthlyStats);
router.get('/date/:date', messAttendanceController.getAttendanceByDate);
router.get('/date-range', messAttendanceController.getAttendanceByDateRange);
router.get('/meal/:date/:meal_type', messAttendanceController.getAttendanceByMeal);
router.get('/student/:student_id', messAttendanceController.getAttendanceByStudent);
router.get('/student/:student_id/stats', messAttendanceController.getStudentAttendanceStats);
router.get('/marked-by/:marked_by', messAttendanceController.getAttendanceByMarkedBy);
router.get('/:id', messAttendanceController.getAttendanceById);
router.put('/:id', messAttendanceController.updateAttendance);
router.delete('/:id', messAttendanceController.deleteAttendance);
router.post('/bulk', messAttendanceController.bulkMarkAttendance);

module.exports = router;
