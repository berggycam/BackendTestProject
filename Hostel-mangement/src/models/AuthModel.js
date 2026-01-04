const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');

const authModel = {
    async signUp(userData) {
        try {
            const {
                username,
                password,
                role = 'student',
                first_name,
                last_name,
                email,
                phone,
                gender,
                date_of_birth,
                address,
                course,
                year,
                guardian_name,
                guardian_phone
            } = userData;

            // Check if user exists
            const existingUser = await db.query(
                'SELECT user_id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );

            if (existingUser.rows.length > 0) {
                throw new Error('Username or email already exists');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const userResult = await db.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING user_id, username, email, role, created_at',
                [username, email, passwordHash, role]
            );

            const user = userResult.rows[0];

            // If student, create student record
            if (role === 'student') {
                const requiredStudentFields = [
                    first_name,
                    last_name,
                    gender,
                    date_of_birth,
                    phone,
                    address,
                    course,
                    year,
                    guardian_name,
                    guardian_phone
                ];

                const hasAllStudentDetails = requiredStudentFields.every((field) => field !== undefined && field !== null);

                if (hasAllStudentDetails) {
                    await db.query(
                        `INSERT INTO students (user_id, first_name, last_name, gender, date_of_birth, phone, email, address, course, year, guardian_name, guardian_phone)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            user.user_id,
                            first_name,
                            last_name,
                            gender,
                            date_of_birth,
                            phone,
                            email,
                            address,
                            course,
                            year,
                            guardian_name,
                            guardian_phone
                        ]
                    );
                    user.studentProfileCreated = true;
                } else {
                    user.studentProfileCreated = false;
                }
            }

            return user;
        } catch (error) {
            throw error;
        }
    },

    async signIn(credentials) {
        try {
            const { username, password } = credentials;

            // Find user
            const userResult = await db.query(
                'SELECT user_id, username, password_hash, role, status FROM users WHERE username = ?',
                [username]
            );

            if (userResult.rows.length === 0) {
                throw new Error('Invalid credentials');
            }

            const user = userResult.rows[0];

            // Check if user is active
            if (user.status !== 'active') {
                throw new Error('Account is inactive');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    user_id: user.user_id, 
                    username: user.username, 
                    role: user.role 
                },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            // Update last login
            await db.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
                [user.user_id]
            );

            return {
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                }
            };
        } catch (error) {
            throw error;
        }
    },

    async getUserById(user_id) {
        try {
            const result = await db.query(
                'SELECT user_id, username, role, status, last_login FROM users WHERE user_id = ?',
                [user_id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    async changePassword(user_id, oldPassword, newPassword) {
        try {
            // Get current password hash
            const result = await db.query(
                'SELECT password_hash FROM users WHERE user_id = ?',
                [user_id]
            );

            if (result.rows.length === 0) {
                throw new Error('User not found');
            }

            // Verify old password
            const isValidPassword = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Update password
            await db.query(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [newPasswordHash, user_id]
            );

            return { message: 'Password changed successfully' };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = authModel;