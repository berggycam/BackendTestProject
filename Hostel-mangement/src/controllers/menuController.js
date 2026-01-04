const menuModel = require('../models/menuModel.js');

const menuController = {
    async createMenu(req, res) {
        try {
            const {
                mess_id,
                day,
                breakfast,
                lunch,
                dinner,
                is_active = true
            } = req.body;

            // Validate required fields
            if (!mess_id || !day) {
                return res.status(400).json({ 
                    error: 'Missing required fields: mess_id, day' 
                });
            }

            // Validate day
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            if (!validDays.includes(day)) {
                return res.status(400).json({ 
                    error: 'Invalid day. Must be one of: ' + validDays.join(', ') 
                });
            }

            const menu = await menuModel.createMenu({
                mess_id,
                day,
                breakfast,
                lunch,
                dinner,
                is_active
            });

            res.status(201).json({
                message: 'Menu created successfully',
                menu
            });
        } catch (error) {
            console.error('Error creating menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllMenus(req, res) {
        try {
            const menus = await menuModel.getAllMenus();
            res.json(menus);
        } catch (error) {
            console.error('Error fetching menus:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMenuById(req, res) {
        try {
            const { id } = req.params;
            const menu = await menuModel.getMenuById(id);

            if (!menu) {
                return res.status(404).json({ error: 'Menu not found' });
            }

            res.json(menu);
        } catch (error) {
            console.error('Error fetching menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMenusByMess(req, res) {
        try {
            const { mess_id } = req.params;
            const menus = await menuModel.getMenusByMess(mess_id);
            res.json(menus);
        } catch (error) {
            console.error('Error fetching mess menus:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getWeeklyMenu(req, res) {
        try {
            const { mess_id } = req.params;
            const menus = await menuModel.getWeeklyMenu(mess_id);
            res.json(menus);
        } catch (error) {
            console.error('Error fetching weekly menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getMenuByDay(req, res) {
        try {
            const { mess_id, day } = req.params;
            
            // Validate day
            const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            if (!validDays.includes(day)) {
                return res.status(400).json({ 
                    error: 'Invalid day. Must be one of: ' + validDays.join(', ') 
                });
            }

            const menu = await menuModel.getMenuByDay(mess_id, day);
            
            if (!menu) {
                return res.status(404).json({ error: 'Menu not found for this day' });
            }

            res.json(menu);
        } catch (error) {
            console.error('Error fetching menu by day:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getTodayMenu(req, res) {
        try {
            const { mess_id } = req.params;
            const menu = await menuModel.getTodayMenu(mess_id);
            
            if (!menu) {
                return res.status(404).json({ error: 'No menu found for today' });
            }

            res.json(menu);
        } catch (error) {
            console.error('Error fetching today menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateMenu(req, res) {
        try {
            const { id } = req.params;
            const menuData = req.body;

            // Check if menu exists
            const existingMenu = await menuModel.getMenuById(id);
            if (!existingMenu) {
                return res.status(404).json({ error: 'Menu not found' });
            }

            const updatedMenu = await menuModel.updateMenu(id, menuData);
            res.json({
                message: 'Menu updated successfully',
                menu: updatedMenu
            });
        } catch (error) {
            console.error('Error updating menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteMenu(req, res) {
        try {
            const { id } = req.params;

            // Check if menu exists
            const existingMenu = await menuModel.getMenuById(id);
            if (!existingMenu) {
                return res.status(404).json({ error: 'Menu not found' });
            }

            await menuModel.deleteMenu(id);
            res.json({ message: 'Menu deleted successfully' });
        } catch (error) {
            console.error('Error deleting menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async activateMenu(req, res) {
        try {
            const { id } = req.params;

            // Check if menu exists
            const existingMenu = await menuModel.getMenuById(id);
            if (!existingMenu) {
                return res.status(404).json({ error: 'Menu not found' });
            }

            const menu = await menuModel.activateMenu(id);
            res.json({
                message: 'Menu activated successfully',
                menu
            });
        } catch (error) {
            console.error('Error activating menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deactivateMenu(req, res) {
        try {
            const { id } = req.params;

            // Check if menu exists
            const existingMenu = await menuModel.getMenuById(id);
            if (!existingMenu) {
                return res.status(404).json({ error: 'Menu not found' });
            }

            const menu = await menuModel.deactivateMenu(id);
            res.json({
                message: 'Menu deactivated successfully',
                menu
            });
        } catch (error) {
            console.error('Error deactivating menu:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = menuController;
