const express = require('express');
const router = express.Router();
const gateEntryController = require('../controllers/gateEntryController.js');

// Admin routes
router.post('/', gateEntryController.createGateEntry);
router.get('/', gateEntryController.getAllGateEntries);
router.get('/stats', gateEntryController.getGateEntryStats);
router.get('/stats/month/:year/:month', gateEntryController.getGateEntryStatsByMonth);
router.get('/today', gateEntryController.getTodayGateEntries);
router.get('/active', gateEntryController.getActiveGateEntries);
router.get('/students-outside', gateEntryController.getStudentsOutside);
router.get('/frequent-exit', gateEntryController.getFrequentExitStudents);
router.get('/late-night', gateEntryController.getLateNightEntries);
router.get('/absent', gateEntryController.getAbsentStudents);
router.get('/date/:date', gateEntryController.getGateEntriesByDate);
router.get('/date-range', gateEntryController.getGateEntriesByDateRange);
router.get('/student/:student_id', gateEntryController.getGateEntriesByStudent);
router.get('/student/:student_id/stats', gateEntryController.getStudentGateStats);
router.get('/:id', gateEntryController.getGateEntryById);
router.put('/:id', gateEntryController.updateGateEntry);
router.put('/:id/entry', gateEntryController.recordEntry);
router.put('/:id/exit', gateEntryController.recordExit);
router.delete('/:id', gateEntryController.deleteGateEntry);

// Student routes (authenticated)
router.post('/my/gate-entry', gateEntryController.createStudentGateEntry);
router.get('/my/gate-entries', gateEntryController.getStudentGateEntries);

module.exports = router;
