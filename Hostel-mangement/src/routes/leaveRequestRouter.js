const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController.js');

// Admin routes
router.post('/', leaveRequestController.createLeaveRequest);
router.get('/', leaveRequestController.getAllLeaveRequests);
router.get('/stats', leaveRequestController.getLeaveStats);
router.get('/stats/month/:year/:month', leaveRequestController.getLeaveStatsByMonth);
router.get('/pending', leaveRequestController.getPendingLeaveRequests);
router.get('/active', leaveRequestController.getActiveLeaveRequests);
router.get('/status/:status', leaveRequestController.getLeaveRequestsByStatus);
router.get('/student/:student_id', leaveRequestController.getLeaveRequestsByStudent);
router.get('/student/:student_id/stats', leaveRequestController.getStudentLeaveStats);
router.get('/date-range', leaveRequestController.getLeaveRequestsByDateRange);
router.get('/:id', leaveRequestController.getLeaveRequestById);
router.put('/:id', leaveRequestController.updateLeaveRequest);
router.put('/:id/approve', leaveRequestController.approveLeaveRequest);
router.put('/:id/reject', leaveRequestController.rejectLeaveRequest);
router.delete('/:id', leaveRequestController.deleteLeaveRequest);

// Student routes (authenticated)
router.post('/my/leave', leaveRequestController.createStudentLeaveRequest);
router.get('/my/leaves', leaveRequestController.getStudentLeaveRequests);

module.exports = router;
