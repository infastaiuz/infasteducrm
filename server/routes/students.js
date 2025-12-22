import express from 'express';
import Student from '../models/Student.js';
import Group from '../models/Group.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authenticate, async (req, res) => {
  try {
    const { group_id, status } = req.query;
    const filter = {};
    if (group_id) filter.group_id = group_id;
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate('group_id')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('group_id');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', authenticate, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    await student.populate('group_id');
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('group_id');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

