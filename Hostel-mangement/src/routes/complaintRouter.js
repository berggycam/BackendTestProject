const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController.js');

// Admin routes
router.post('/', complaintController.createComplaint);
router.get('/', complaintController.getAllComplaints);
router.get('/stats', complaintController.getComplaintStats);
router.get('/stats/by-type', complaintController.getComplaintStatsByType);
router.get('/status/:status', complaintController.getComplaintsByStatus);
router.get('/type/:type', complaintController.getComplaintsByType);
router.get('/priority/:priority', complaintController.getComplaintsByPriority);
router.get('/student/:student_id', complaintController.getComplaintsByStudent);
router.get('/:id', complaintController.getComplaintById);
router.put('/:id', complaintController.updateComplaint);
router.put('/:id/resolve', complaintController.resolveComplaint);
router.delete('/:id', complaintController.deleteComplaint);

// Student routes (authenticated)
router.post('/my/complaint', complaintController.createStudentComplaint);
router.get('/my/complaints', complaintController.getStudentComplaints);

module.exports = router;
