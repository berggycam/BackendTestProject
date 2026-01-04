const feeModel = require('../models/feeModel.js');

const feeController = {
    async createFee(req, res) {
        try {
            const {
                fee_type,
                amount,
                frequency,
                description,
                is_active = true
            } = req.body;

            // Validate required fields
            if (!fee_type || !amount || !frequency) {
                return res.status(400).json({ 
                    error: 'Missing required fields: fee_type, amount, frequency' 
                });
            }

            // Validate fee_type
            const validTypes = ['hostel_rent', 'mess', 'security', 'other'];
            if (!validTypes.includes(fee_type)) {
                return res.status(400).json({ 
                    error: 'Invalid fee_type. Must be one of: ' + validTypes.join(', ') 
                });
            }

            // Validate frequency
            const validFrequencies = ['monthly', 'semester', 'annual', 'one-time'];
            if (!validFrequencies.includes(frequency)) {
                return res.status(400).json({ 
                    error: 'Invalid frequency. Must be one of: ' + validFrequencies.join(', ') 
                });
            }

            const fee = await feeModel.createFee({
                fee_type,
                amount,
                frequency,
                description,
                is_active
            });

            res.status(201).json({
                message: 'Fee created successfully',
                fee
            });
        } catch (error) {
            console.error('Error creating fee:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllFees(req, res) {
        try {
            const fees = await feeModel.getAllFees();
            res.json(fees);
        } catch (error) {
            console.error('Error fetching fees:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getActiveFees(req, res) {
        try {
            const fees = await feeModel.getActiveFees();
            res.json(fees);
        } catch (error) {
            console.error('Error fetching active fees:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFeeById(req, res) {
        try {
            const { id } = req.params;
            const fee = await feeModel.getFeeById(id);

            if (!fee) {
                return res.status(404).json({ error: 'Fee not found' });
            }

            res.json(fee);
        } catch (error) {
            console.error('Error fetching fee:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFeesByType(req, res) {
        try {
            const { type } = req.params;
            const fees = await feeModel.getFeesByType(type);
            res.json(fees);
        } catch (error) {
            console.error('Error fetching fees by type:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFeesByFrequency(req, res) {
        try {
            const { frequency } = req.params;
            const fees = await feeModel.getFeesByFrequency(frequency);
            res.json(fees);
        } catch (error) {
            console.error('Error fetching fees by frequency:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateFee(req, res) {
        try {
            const { id } = req.params;
            const feeData = req.body;

            // Check if fee exists
            const existingFee = await feeModel.getFeeById(id);
            if (!existingFee) {
                return res.status(404).json({ error: 'Fee not found' });
            }

            // Validate fee_type if provided
            if (feeData.fee_type) {
                const validTypes = ['hostel_rent', 'mess', 'security', 'other'];
                if (!validTypes.includes(feeData.fee_type)) {
                    return res.status(400).json({ 
                        error: 'Invalid fee_type. Must be one of: ' + validTypes.join(', ') 
                    });
                }
            }

            // Validate frequency if provided
            if (feeData.frequency) {
                const validFrequencies = ['monthly', 'semester', 'annual', 'one-time'];
                if (!validFrequencies.includes(feeData.frequency)) {
                    return res.status(400).json({ 
                        error: 'Invalid frequency. Must be one of: ' + validFrequencies.join(', ') 
                    });
                }
            }

            const updatedFee = await feeModel.updateFee(id, feeData);
            res.json({
                message: 'Fee updated successfully',
                fee: updatedFee
            });
        } catch (error) {
            console.error('Error updating fee:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteFee(req, res) {
        try {
            const { id } = req.params;

            // Check if fee exists
            const existingFee = await feeModel.getFeeById(id);
            if (!existingFee) {
                return res.status(404).json({ error: 'Fee not found' });
            }

            await feeModel.deleteFee(id);
            res.json({ message: 'Fee deleted successfully' });
        } catch (error) {
            console.error('Error deleting fee:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async activateFee(req, res) {
        try {
            const { id } = req.params;

            // Check if fee exists
            const existingFee = await feeModel.getFeeById(id);
            if (!existingFee) {
                return res.status(404).json({ error: 'Fee not found' });
            }

            const fee = await feeModel.activateFee(id);
            res.json({
                message: 'Fee activated successfully',
                fee
            });
        } catch (error) {
            console.error('Error activating fee:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deactivateFee(req, res) {
        try {
            const { id } = req.params;

            // Check if fee exists
            const existingFee = await feeModel.getFeeById(id);
            if (!existingFee) {
                return res.status(404).json({ error: 'Fee not found' });
            }

            const fee = await feeModel.deactivateFee(id);
            res.json({
                message: 'Fee deactivated successfully',
                fee
            });
        } catch (error) {
            console.error('Error deactivating fee:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getFeeStats(req, res) {
        try {
            const stats = await feeModel.getFeeStats();
            res.json(stats);
        } catch (error) {
            console.error('Error fetching fee stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = feeController;
