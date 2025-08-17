const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Client = require('../models/Client');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Expenses route is working!', timestamp: new Date() });
});

// Get all expenses (Admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let filter = {};
    
    // Add filters
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const expenses = await Expense.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new expense (Admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.userId
    };
    
    const expense = new Expense(expenseData);
    await expense.save();
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update expense (Admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete expense (Admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get financial summary
router.get('/summary', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { year, month } = req.query;
    let dateFilter = {};
    
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }
    
    // Get total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        } 
      }
    ]);
    
    // Get total income from clients
    let clientFilter = {};
    if (dateFilter.date) {
      clientFilter.createdAt = dateFilter.date;
    }
    
    const totalIncome = await Client.aggregate([
      { $match: clientFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalReceived = await Client.aggregate([
      { $match: clientFilter },
      { $group: { _id: null, total: { $sum: '$advanceReceived' } } }
    ]);
    
    // Monthly breakdown
    const monthlyData = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalExpense: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Calculate profit
    const income = totalIncome[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const received = totalReceived[0]?.total || 0;
    const profit = income - expenses;
    const actualProfit = received - expenses; // Based on actual received amount
    
    res.json({
      totalIncome: income,
      totalReceived: received,
      totalExpenses: expenses,
      profit: profit,
      actualProfit: actualProfit,
      expensesByCategory,
      monthlyData,
      profitMargin: income > 0 ? ((profit / income) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get monthly report
router.get('/monthly-report/:year/:month', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });
    
    const clients = await Client.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    res.json({
      month: month,
      year: year,
      expenses,
      clients,
      totalExpense: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      totalIncome: clients.reduce((sum, client) => sum + client.totalAmount, 0),
      totalReceived: clients.reduce((sum, client) => sum + client.advanceReceived, 0)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;