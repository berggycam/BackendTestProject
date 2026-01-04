const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController.js');

// Admin routes
router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/course/:course', studentController.getStudentsByCourse);
router.get('/year/:year', studentController.getStudentsByYear);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Student routes (authenticated)
router.get('/profile/me', studentController.getStudentProfile);

module.exports = router;
