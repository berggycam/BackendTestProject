const studentModel = require('../models/studentModel.js');
const userModel = require('../models/userModel.js');
const bcrypt = require('bcrypt');

const studentController = {
    async createStudent(req, res) {
        try {
            const {
                username,
                password,
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
            } = req.body;

            // Validate required fields
            if (!username || !password || !first_name || !last_name || !email) {
                return res.status(400).json({ 
                    error: 'Missing required fields: username, password, first_name, last_name, email' 
                });
            }

            // Check if username already exists
            const existingUser = await userModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Check if email already exists in students table
            const existingStudent = await studentModel.getAllStudents();
            if (existingStudent.find(s => s.email === email)) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);

            // Create user first
            const user = await userModel.createUser({
                username,
                password_hash,
                role: 'student',
                status: 'active'
            });

            // Create student with user_id
            const student = await studentModel.createStudent({
                user_id: user.user_id,
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
            });

            res.status(201).json({
                message: 'Student created successfully',
                student: {
                    ...student,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error creating student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getAllStudents(req, res) {
        try {
            const students = await studentModel.getAllStudents();
            res.json(students);
        } catch (error) {
            console.error('Error fetching students:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentById(req, res) {
        try {
            const { id } = req.params;
            const student = await studentModel.getStudentById(id);

            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }

            res.json(student);
        } catch (error) {
            console.error('Error fetching student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updateStudent(req, res) {
        try {
            const { id } = req.params;
            const studentData = req.body;

            // Check if student exists
            const existingStudent = await studentModel.getStudentById(id);
            if (!existingStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }

            // Check if email is being updated and if it already exists
            if (studentData.email && studentData.email !== existingStudent.email) {
                const allStudents = await studentModel.getAllStudents();
                const emailExists = allStudents.find(s => s.email === studentData.email && s.student_id != id);
                if (emailExists) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
            }

            const updatedStudent = await studentModel.updateStudent(id, studentData);
            res.json({
                message: 'Student updated successfully',
                student: updatedStudent
            });
        } catch (error) {
            console.error('Error updating student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteStudent(req, res) {
        try {
            const { id } = req.params;

            // Check if student exists
            const existingStudent = await studentModel.getStudentById(id);
            if (!existingStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }

            // Delete student (this will cascade to user if needed)
            await studentModel.deleteStudent(id);
            
            // Also delete the associated user
            if (existingStudent.user_id) {
                await userModel.deleteUser(existingStudent.user_id);
            }

            res.json({ message: 'Student deleted successfully' });
        } catch (error) {
            console.error('Error deleting student:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentsByCourse(req, res) {
        try {
            const { course } = req.params;
            const students = await studentModel.getStudentsByCourse(course);
            res.json(students);
        } catch (error) {
            console.error('Error fetching students by course:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentsByYear(req, res) {
        try {
            const { year } = req.params;
            const students = await studentModel.getStudentsByYear(parseInt(year));
            res.json(students);
        } catch (error) {
            console.error('Error fetching students by year:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getStudentProfile(req, res) {
        try {
            // Assuming user_id is available from authentication middleware
            const user_id = req.user?.user_id;
            
            if (!user_id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const student = await studentModel.getStudentByUserId(user_id);
            
            if (!student) {
                return res.status(404).json({ error: 'Student profile not found' });
            }

            res.json(student);
        } catch (error) {
            console.error('Error fetching student profile:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = studentController;
