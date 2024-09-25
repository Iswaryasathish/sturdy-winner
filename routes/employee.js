const express = require('express'); 
const router = express.Router();
const Employee = require('../models/Employee');
const upload = require('../middleware/upload');
const cloudinary = require('../configuration/cloudinaryConfig');
const fs = require('fs');

// Add a new employee
router.post('/add', upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path);
    
    const newEmployee = new Employee({
      photo: result.secure_url,
      employeeId: req.body.employeeId,
      name: req.body.name,
      age: req.body.age,
      jobRole: req.body.jobRole,
      mobileNo: req.body.mobileNo,
      email: req.body.email,
      address: req.body.address,
      salary: req.body.salary,
      joiningMonth: req.body.joiningMonth,
      totalPF: 0
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ message: 'Error uploading employee', error: err.message });
  }
});

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const pfRate = 0.12;
    const monthsWorked = new Date().getMonth() + 1 - new Date(req.body.joiningMonth).getMonth();
    const totalPFAmount = monthsWorked > 0 ? (req.body.salary * pfRate) * monthsWorked : 0;

    const updatedData = {
      ...req.body,
      totalPF: totalPFAmount
    };

    const employee = await Employee.findOneAndUpdate(
      { employeeId: req.params.id },
      updatedData,
      { new: true }
    );

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ employeeId: req.params.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get employees by job role
router.get('/role/:role', async (req, res) => {
  try {
    const employees = await Employee.find({ jobRole: req.params.role });
    res.status(200).json(employees);
  } catch (err) {
    console.error('Error fetching employees by role:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
