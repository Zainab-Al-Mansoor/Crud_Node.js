const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully.'))
    .catch((error) => {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    });

// Mongoose Student Schema & Model
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [0, 'Age cannot be negative']
    },
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

// --- API ROUTES ---

// Root endpoint
app.get('/', (req, res) => {
    res.send('Student Management System API is running...');
});

// CREATE - POST: Add a new student
app.post('/api/students', async (req, res) => {
    try {
        const { name, email, age, course } = req.body;
        const newStudent = new Student({ name, email, age, course });
        const savedStudent = await newStudent.save();
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: savedStudent
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// READ - GET: Retrieve all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// READ - GET: Retrieve a single student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// UPDATE - PUT: Update a student by ID
app.put('/api/students/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE - DELETE: Remove a student by ID
app.delete('/api/students/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            data: deletedStudent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});