const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController.js');

// Admin routes
router.post('/', visitorController.createVisitor);
router.get('/', visitorController.getAllVisitors);
router.get('/stats', visitorController.getVisitorStats);
router.get('/stats/month/:year/:month', visitorController.getVisitorStatsByMonth);
router.get('/frequent', visitorController.getFrequentVisitors);
router.get('/active', visitorController.getActiveVisitors);
router.get('/date/:date', visitorController.getVisitorsByDate);
router.get('/date-range', visitorController.getVisitorsByDateRange);
router.get('/student/:student_id', visitorController.getVisitorsByStudent);
router.get('/:id', visitorController.getVisitorById);
router.put('/:id', visitorController.updateVisitor);
router.put('/:id/checkout', visitorController.checkOutVisitor);
router.delete('/:id', visitorController.deleteVisitor);

// Student routes (authenticated)
router.post('/my/visitor', visitorController.createStudentVisitor);
router.get('/my/visitors', visitorController.getStudentVisitors);

module.exports = router;
