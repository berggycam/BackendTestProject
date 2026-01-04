const authModel = require('../models/AuthModel.js');

const AuthController = {
    async userSignUp(req, res) {
        try {
            const userData = req.body;
            
            // Validate required fields
            const requiredFields = ['username', 'password', 'email'];
            for (const field of requiredFields) {
                if (!userData[field]) {
                    return res.status(400).json({ error: `${field} is required` });
                }
            }

            const user = await authModel.signUp(userData);
            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            console.error('Error in userSignUp:', error);
            res.status(400).json({ error: error.message });
        }
    },

    async userSignIn(req, res) {
        try {
            const { username, password } = req.body;
            
            // Validate required fields
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const result = await authModel.signIn({ username, password });
            res.json({
                message: 'Login successful',
                ...result
            });
        } catch (error) {
            console.error('Error in userSignIn:', error);
            res.status(401).json({ error: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            const user_id = req.user.user_id;
            const user = await authModel.getUserById(user_id);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async changePassword(req, res) {
        try {
            const user_id = req.user.user_id;
            const { oldPassword, newPassword } = req.body;
            
            // Validate required fields
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ error: 'Old password and new password are required' });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters long' });
            }

            const result = await authModel.changePassword(user_id, oldPassword, newPassword);
            res.json(result);
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = AuthController;