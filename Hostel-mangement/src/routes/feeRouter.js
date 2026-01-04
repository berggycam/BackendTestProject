const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController.js');

// Admin routes
router.post('/', feeController.createFee);
router.get('/', feeController.getAllFees);
router.get('/active', feeController.getActiveFees);
router.get('/stats', feeController.getFeeStats);
router.get('/type/:type', feeController.getFeesByType);
router.get('/frequency/:frequency', feeController.getFeesByFrequency);
router.get('/:id', feeController.getFeeById);
router.put('/:id', feeController.updateFee);
router.delete('/:id', feeController.deleteFee);
router.put('/:id/activate', feeController.activateFee);
router.put('/:id/deactivate', feeController.deactivateFee);

module.exports = router;
