const auditLogModel = require('../models/auditLogModel.js');

const auditLogController = {
    async createLog(req, res) {
        try {
            const {
                user_id,
                action,
                table_name = null,
                record_id = null,
                old_values = null,
                new_values = null,
                ip_address = null,
                user_agent = null
            } = req.body;

            // Validate required fields
            if (!user_id || !action) {
                return res.status(400).json({ 
                    error: 'Missing required fields: user_id, action' 
                });
            }

            const log = await auditLogModel.createLog({
                user_id,
                action,
                table_name,
                record_id,
                old_values,
                new_values,
                ip_address,
                user_agent
            });

            res.status(201).json({
                message: 'Audit log created successfully',
                log
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllLogs(req, res) {
        try {
            const logs = await auditLogModel.getAllLogs();
            res.json(logs);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogById(req, res) {
        try {
            const { id } = req.params;
            const log = await auditLogModel.getLogById(id);

            if (!log) {
                return res.status(404).json({ error: 'Audit log not found' });
            }

            res.json(log);
        } catch (error) {
            console.error('Error fetching audit log:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogsByUser(req, res) {
        try {
            const { user_id } = req.params;
            const logs = await auditLogModel.getLogsByUser(user_id);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching user logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogsByAction(req, res) {
        try {
            const { action } = req.params;
            const logs = await auditLogModel.getLogsByAction(action);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching logs by action:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogsByTable(req, res) {
        try {
            const { table_name } = req.params;
            const logs = await auditLogModel.getLogsByTable(table_name);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching logs by table:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogsByRecord(req, res) {
        try {
            const { table_name, record_id } = req.params;
            const logs = await auditLogModel.getLogsByRecord(table_name, record_id);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching logs by record:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogsByDateRange(req, res) {
        try {
            const { start_date, end_date } = req.query;
            
            if (!start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'Missing required query parameters: start_date, end_date' 
                });
            }

            const logs = await auditLogModel.getLogsByDateRange(start_date, end_date);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching logs by date range:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogsByRole(req, res) {
        try {
            const { role } = req.params;
            const logs = await auditLogModel.getLogsByRole(role);
            res.json(logs);
        } catch (error) {
            console.error('Error fetching logs by role:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getRecentLogs(req, res) {
        try {
            const { limit = 50 } = req.query;
            const logs = await auditLogModel.getRecentLogs(parseInt(limit));
            res.json(logs);
        } catch (error) {
            console.error('Error fetching recent logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getTodayLogs(req, res) {
        try {
            const logs = await auditLogModel.getTodayLogs();
            res.json(logs);
        } catch (error) {
            console.error('Error fetching today logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogStats(req, res) {
        try {
            const stats = await auditLogModel.getLogStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching log stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogStatsByAction(req, res) {
        try {
            const stats = await auditLogModel.getLogStatsByAction();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching log stats by action:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogStatsByUser(req, res) {
        try {
            const stats = await auditLogModel.getLogStatsByUser();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching log stats by user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogStatsByTable(req, res) {
        try {
            const stats = await auditLogModel.getLogStatsByTable();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching log stats by table:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getLogStatsByMonth(req, res) {
        try {
            const { year, month } = req.params;
            
            if (!year || !month) {
                return res.status(400).json({ 
                    error: 'Missing required parameters: year, month' 
                });
            }

            const stats = await auditLogModel.getLogStatsByMonth(parseInt(year), parseInt(month));
            res.json(stats);
        } catch (error) {
            console.error('Error fetching monthly log stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFailedLoginAttempts(req, res) {
        try {
            const logs = await auditLogModel.getFailedLoginAttempts();
            res.json(logs);
        } catch (error) {
            console.error('Error fetching failed login attempts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getSecurityLogs(req, res) {
        try {
            const logs = await auditLogModel.getSecurityLogs();
            res.json(logs);
        } catch (error) {
            console.error('Error fetching security logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getDataModificationLogs(req, res) {
        try {
            const logs = await auditLogModel.getDataModificationLogs();
            res.json(logs);
        } catch (error) {
            console.error('Error fetching data modification logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteOldLogs(req, res) {
        try {
            const { days_to_keep = 90 } = req.body;
            
            if (typeof days_to_keep !== 'number' || days_to_keep < 1) {
                return res.status(400).json({ 
                    error: 'days_to_keep must be a positive number' 
                });
            }

            const deletedCount = await auditLogModel.deleteOldLogs(parseInt(days_to_keep));
            res.json({
                message: 'Old audit logs deleted successfully',
                deleted_count: deletedCount
            });
        } catch (error) {
            console.error('Error deleting old logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async searchLogs(req, res) {
        try {
            const { search_term } = req.query;
            
            if (!search_term) {
                return res.status(400).json({ error: 'search_term query parameter is required' });
            }

            const logs = await auditLogModel.searchLogs(search_term);
            res.json(logs);
        } catch (error) {
            console.error('Error searching logs:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = auditLogController;
