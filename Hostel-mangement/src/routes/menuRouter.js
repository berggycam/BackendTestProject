const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController.js');

// Admin routes
router.post('/', menuController.createMenu);
router.get('/', menuController.getAllMenus);
router.get('/mess/:mess_id', menuController.getMenusByMess);
router.get('/mess/:mess_id/weekly', menuController.getWeeklyMenu);
router.get('/mess/:mess_id/day/:day', menuController.getMenuByDay);
router.get('/mess/:mess_id/today', menuController.getTodayMenu);
router.get('/:id', menuController.getMenuById);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);
router.put('/:id/activate', menuController.activateMenu);
router.put('/:id/deactivate', menuController.deactivateMenu);

module.exports = router;
