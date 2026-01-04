const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController.js');

// Admin routes
router.post('/', auditLogController.createLog);
router.get('/', auditLogController.getAllLogs);
router.get('/stats', auditLogController.getLogStats);
router.get('/stats/action', auditLogController.getLogStatsByAction);
router.get('/stats/user', auditLogController.getLogStatsByUser);
router.get('/stats/table', auditLogController.getLogStatsByTable);
router.get('/stats/month/:year/:month', auditLogController.getLogStatsByMonth);
router.get('/recent', auditLogController.getRecentLogs);
router.get('/today', auditLogController.getTodayLogs);
router.get('/security', auditLogController.getSecurityLogs);
router.get('/failed-logins', auditLogController.getFailedLoginAttempts);
router.get('/data-modifications', auditLogController.getDataModificationLogs);
router.get('/search', auditLogController.searchLogs);
router.get('/user/:user_id', auditLogController.getLogsByUser);
router.get('/action/:action', auditLogController.getLogsByAction);
router.get('/table/:table_name', auditLogController.getLogsByTable);
router.get('/table/:table_name/record/:record_id', auditLogController.getLogsByRecord);
router.get('/role/:role', auditLogController.getLogsByRole);
router.get('/date-range', auditLogController.getLogsByDateRange);
router.get('/:id', auditLogController.getLogById);
router.delete('/old', auditLogController.deleteOldLogs);

module.exports = router;
