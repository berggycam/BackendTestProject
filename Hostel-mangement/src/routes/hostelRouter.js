const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController.js');

// Admin routes
router.post('/', hostelController.createHostel);
router.get('/', hostelController.getAllHostels);
router.get('/type/:type', hostelController.getHostelsByType);
router.get('/:id', hostelController.getHostelById);
router.get('/:id/rooms', hostelController.getHostelWithRooms);
router.put('/:id', hostelController.updateHostel);
router.delete('/:id', hostelController.deleteHostel);

module.exports = router;
