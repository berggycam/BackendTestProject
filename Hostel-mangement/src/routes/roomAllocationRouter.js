const express = require('express');
const router = express.Router();
const roomAllocationController = require('../controllers/roomAllocationController.js');

// Admin routes
router.post('/allocate', roomAllocationController.allocateRoom);
router.get('/', roomAllocationController.getAllAllocations);
router.get('/stats', roomAllocationController.getRoomOccupancyStats);
router.get('/history', roomAllocationController.getAllocationHistory);
router.get('/student/:student_id', roomAllocationController.getAllocationByStudent);
router.get('/room/:room_id', roomAllocationController.getAllocationsByRoom);
router.get('/hostel/:hostel_id', roomAllocationController.getAllocationsByHostel);
router.get('/:id', roomAllocationController.getAllocationById);
router.put('/:id', roomAllocationController.updateAllocation);
router.put('/:id/vacate', roomAllocationController.vacateRoom);
// router.delete('/:id', roomAllocationController.deleteAllocation); // Uncomment if needed

// Student routes (authenticated)
router.get('/my/allocation', roomAllocationController.getStudentCurrentAllocation);

module.exports = router;
