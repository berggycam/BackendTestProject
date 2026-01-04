const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController.js');

// Admin routes
router.post('/', maintenanceController.createMaintenance);
router.get('/', maintenanceController.getAllMaintenance);
router.get('/stats', maintenanceController.getMaintenanceStats);
router.get('/stats/month/:year/:month', maintenanceController.getMaintenanceStatsByMonth);
router.get('/pending', maintenanceController.getPendingMaintenance);
router.get('/overdue', maintenanceController.getOverdueMaintenance);
router.get('/status/:status', maintenanceController.getMaintenanceByStatus);
router.get('/priority/:priority', maintenanceController.getMaintenanceByPriority);
router.get('/room/:room_id', maintenanceController.getMaintenanceByRoom);
router.get('/assigned/:assigned_to', maintenanceController.getMaintenanceByAssignedTo);
router.get('/date-range', maintenanceController.getMaintenanceByDateRange);
router.get('/:id', maintenanceController.getMaintenanceById);
router.put('/:id', maintenanceController.updateMaintenance);
router.put('/:id/assign', maintenanceController.assignMaintenance);
router.put('/:id/complete', maintenanceController.completeMaintenance);
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router;
