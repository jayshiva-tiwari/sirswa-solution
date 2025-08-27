const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { authMiddleware } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Clients route is working!', timestamp: new Date() });
});

// Get all clients
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/clients - userId:', req.userId);
    
    const { deliveryStatus, startDate, endDate } = req.query;
    let filter = {};
    
    if (req.userRole === 'admin') {
      filter = {};
    }
    else{
      filter = { createdBy: req.userId };
    }

    // Add filters
    if (deliveryStatus && deliveryStatus !== 'all') {
      filter.deliveryStatus = deliveryStatus;
    }
    
    if (startDate || endDate) {
      filter.projectStartDate = {};
      if (startDate) filter.projectStartDate.$gte = new Date(startDate);
      if (endDate) filter.projectStartDate.$lte = new Date(endDate);
    }
    
    const clients = await Client.find(filter)
      .populate('createdBy', 'name email')
      .populate('leadId', 'clientName phoneNumber')
      .sort({ createdAt: -1 });
    
    console.log('Found clients:', clients.length);
    res.json(clients);
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new client
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /api/clients - userId:', req.userId);
    console.log('Request body:', req.body);
    
    const clientData = {
      ...req.body,
      createdBy: req.userId,
      remainingAmount: req.body.totalAmount - (req.body.advanceReceived || 0)
    };
    
    // Add initial payment to history if advance received
    if (req.body.advanceReceived > 0) {
      clientData.paymentHistory = [{
        amount: req.body.advanceReceived,
        date: new Date(),
        description: 'Advance Payment',
        addedBy: req.userId
      }];
    }
    
    const client = new Client(clientData);
    await client.save();
    
    const populatedClient = await Client.findById(client._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedClient);
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update client
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('PUT /api/clients/:id - userId:', req.userId);
    
    // Calculate remaining amount if amounts are being updated
    if (req.body.totalAmount !== undefined || req.body.advanceReceived !== undefined) {
      const client = await Client.findById(req.params.id);
      const totalAmount = req.body.totalAmount || client.totalAmount;
      const advanceReceived = req.body.advanceReceived || client.advanceReceived;
      req.body.remainingAmount = totalAmount - advanceReceived;
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Error in PUT /api/clients/:id:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add payment
router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Update advance received and add to payment history
    client.advanceReceived += amount;
    client.remainingAmount = client.totalAmount - client.advanceReceived;
    
    client.paymentHistory.push({
      amount,
      date: new Date(),
      description: description || 'Payment Received',
      addedBy: req.userId
    });
    
    await client.save();
    
    const populatedClient = await Client.findById(client._id)
      .populate('createdBy', 'name email')
      .populate('paymentHistory.addedBy', 'name');
    
    res.json(populatedClient);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete client
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get client statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalClients = await Client.countDocuments();
    const pendingProjects = await Client.countDocuments({ deliveryStatus: 'Pending' });
    const inProgressProjects = await Client.countDocuments({ deliveryStatus: 'In Progress' });
    const deliveredProjects = await Client.countDocuments({ deliveryStatus: 'Delivered' });
    
    const totalRevenue = await Client.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalReceived = await Client.aggregate([
      { $group: { _id: null, total: { $sum: '$advanceReceived' } } }
    ]);
    
    const totalPending = await Client.aggregate([
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } }
    ]);
    
    res.json({
      totalClients,
      pendingProjects,
      inProgressProjects,
      deliveredProjects,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalReceived: totalReceived[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;