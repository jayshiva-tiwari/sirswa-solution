import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Grid,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Card,
    CardContent,
    LinearProgress,
    ToggleButton,
    ToggleButtonGroup,
    InputAdornment,
    MenuItem,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Phone,
    Email,
    AttachMoney,
    CalendarToday,
    Search,
    Refresh,
    CheckCircle,
    Schedule,
    Payment,
    Description,
    Assignment,
    TrendingUp,
    Warning,
    Done,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const Clients = () => {
    // States
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalClients: 0,
        pendingProjects: 0,
        inProgressProjects: 0,
        deliveredProjects: 0,
        totalRevenue: 0,
        totalReceived: 0,
        totalPending: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form data
    const [formData, setFormData] = useState({
        clientName: '',
        email: '',
        phoneNumber: '',
        projectDetails: '',
        totalAmount: 0,
        advanceReceived: 0,
        bondSigned: false,
        projectStartDate: null,
        projectEndDate: null,
        deliveryStatus: 'Pending',
    });

    // Payment form
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        description: ''
    });

    // Delivery status options
    const deliveryStatusOptions = [
        { value: 'Pending', color: 'warning', icon: <Schedule /> },
        { value: 'In Progress', color: 'info', icon: <TrendingUp /> },
        { value: 'Delivered', color: 'success', icon: <CheckCircle /> }
    ];

    // Fetch clients
    const fetchClients = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Clients fetched:', response.data);
            setClients(response.data);
            setFilteredClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showSnackbar('Error fetching clients', 'error');
        }
        setLoading(false);
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchStats();
    }, []);

    // Filter clients
    useEffect(() => {
        let filtered = [...clients];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Add email search
                client.phoneNumber.includes(searchTerm) ||
                client.projectDetails.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(client => client.deliveryStatus === filterStatus);
        }

        // Tab filter
        if (tabValue === 1) { // Pending payments
            filtered = filtered.filter(client => client.remainingAmount > 0);
        } else if (tabValue === 2) { // Ongoing projects
            filtered = filtered.filter(client =>
                client.deliveryStatus === 'In Progress' &&
                new Date(client.projectEndDate) > new Date()
            );
        } else if (tabValue === 3) { // Overdue
            filtered = filtered.filter(client =>
                client.deliveryStatus !== 'Delivered' &&
                new Date(client.projectEndDate) < new Date()
            );
        }

        setFilteredClients(filtered);
    }, [searchTerm, filterStatus, tabValue, clients]);

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (editingClient) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/clients/${editingClient._id}`, formData, config);
                showSnackbar('Client updated successfully', 'success');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/clients`, formData, config);
                showSnackbar('Client created successfully', 'success');
            }

            fetchClients();
            fetchStats();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving client:', error);
            showSnackbar(error.response?.data?.message || 'Error saving client', 'error');
        }
    };

    // Handle payment
    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/clients/${selectedClient._id}/payment`,
                paymentData,
                config
            );

            showSnackbar('Payment added successfully', 'success');
            fetchClients();
            fetchStats();
            setOpenPaymentDialog(false);
            setPaymentData({ amount: 0, description: '' });
        } catch (error) {
            showSnackbar(error.message || 'Error adding payment', 'error');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/clients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Client deleted successfully', 'success');
                fetchClients();
                fetchStats();
            } catch (error) {
                showSnackbar(error.message || 'Error deleting client', 'error');
            }
        }
    };

    // Handle dialog
    const handleOpenDialog = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                clientName: client.clientName,
                email: client.email || '', // Add email
                phoneNumber: client.phoneNumber,
                projectDetails: client.projectDetails,
                totalAmount: client.totalAmount,
                advanceReceived: client.advanceReceived,
                bondSigned: client.bondSigned,
                projectStartDate: client.projectStartDate ? new Date(client.projectStartDate) : null,
                projectEndDate: client.projectEndDate ? new Date(client.projectEndDate) : null,
                deliveryStatus: client.deliveryStatus,
            });
        } else {
            setEditingClient(null);
            setFormData({
                clientName: '',
                email: '', // Add email
                phoneNumber: '',
                projectDetails: '',
                totalAmount: 0,
                advanceReceived: 0,
                bondSigned: false,
                projectStartDate: null,
                projectEndDate: null,
                deliveryStatus: 'Pending',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingClient(null);
    };

    const handleOpenPaymentDialog = (client) => {
        setSelectedClient(client);
        setOpenPaymentDialog(true);
    };

    // Show snackbar
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get status color
    const getStatusColor = (status) => {
        const option = deliveryStatusOptions.find(opt => opt.value === status);
        return option ? option.color : 'default';
    };

    // Calculate progress
    const calculateProgress = (received, total) => {
        if (total === 0) return 0;
        return Math.round((received / total) * 100);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl">
                <Box sx={{ py: 3 }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" gutterBottom fontWeight="bold" style={{ display: 'flex', alignItems: 'center' }}>
                            <img src="/s-logo.png" style={{ width: '50px', height: '50px', marginRight: '10px' }} alt="" />
                            <p>Client & Project Management</p>
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b3aa0 100%)',
                                }
                            }}
                        >
                            Add New Client
                        </Button>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom variant="body2" style={{ width: '8vw', padding: '0.3vw' }}>
                                                Total Clients
                                            </Typography>
                                            <Typography variant="h4" style={{ padding: '0.5vw' }} >{stats.totalClients}</Typography>
                                        </Box>
                                        <Assignment color="primary" sx={{ fontSize: 70, opacity: 1 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid> 
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom variant="body2">
                                                Total Revenue
                                            </Typography>
                                            <Typography variant="h5">{formatCurrency(stats.totalRevenue)}</Typography>
                                        </Box>
                                        <AttachMoney color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom variant="body2">
                                                Amount Received
                                            </Typography>
                                            <Typography variant="h5">{formatCurrency(stats.totalReceived)}</Typography>
                                        </Box>
                                        <Done color="success" sx={{ fontSize: 40, opacity: 0.3 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom variant="body2">
                                                Pending Amount
                                            </Typography>
                                            <Typography variant="h5" color="warning.main">
                                                {formatCurrency(stats.totalPending)}
                                            </Typography>
                                        </Box>
                                        <Warning color="warning" sx={{ fontSize: 40, opacity: 0.3 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Project Status Cards */}
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h6">{stats.pendingProjects}</Typography>
                                        <Typography variant="body2" color="textSecondary">Pending Projects</Typography>
                                    </Box>
                                    <Schedule color="warning" />
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h6">{stats.inProgressProjects}</Typography>
                                        <Typography variant="body2" color="textSecondary">In Progress</Typography>
                                    </Box>
                                    <TrendingUp color="info" />
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h6">{stats.deliveredProjects}</Typography>
                                        <Typography variant="body2" color="textSecondary">Delivered</Typography>
                                    </Box>
                                    <CheckCircle color="success" />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Tabs */}
                    <Paper sx={{ mb: 3 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                            <Tab label={`All Clients (${clients.length})`} style={{ width: '17vw' }} />
                            <Tab label="Pending Payments" style={{ width: '17vw' }} />
                            <Tab label="Ongoing Projects" style={{ width: '17vw' }} />
                            {/* <Tab label="Overdue Projects" /> */}
                        </Tabs>
                    </Paper>

                    {/* Filters */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by name, email, phone or project..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '25vw' }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Filter by Status"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ width: '13vw' }}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    {deliveryStatusOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.value}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => {
                                        fetchClients();
                                        fetchStats();
                                    }}
                                    style={{ width: '10vw', height: '7.5vh' }}
                                >
                                    Refresh
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Client Info</TableCell>
                                    <TableCell>Project Details</TableCell>
                                    <TableCell>Timeline</TableCell>
                                    <TableCell>Financial</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow key={client._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {client.clientName}
                                                </Typography>
                                                <Box display="flex" alignItems="center" mt={0.5}>
                                                    <Email fontSize="small" sx={{ mr: 0.5 }} />
                                                    <Typography variant="body2">{client.email}</Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" mt={0.5}>
                                                    <Phone fontSize="small" sx={{ mr: 0.5 }} />
                                                    <Typography variant="body2">{client.phoneNumber}</Typography>
                                                </Box>
                                                <Chip
                                                    label={client.bondSigned ? 'Bond Signed' : 'Bond Pending'}
                                                    size="small"
                                                    color={client.bondSigned ? 'success' : 'default'}
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {client.projectDetails}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    Start: {new Date(client.projectStartDate).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body2">
                                                    End: {new Date(client.projectEndDate).toLocaleDateString()}
                                                </Typography>
                                                {new Date(client.projectEndDate) < new Date() &&
                                                    client.deliveryStatus !== 'Delivered' && (
                                                        <Chip label="Overdue" size="small" color="error" sx={{ mt: 0.5 }} />
                                                    )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    Total: {formatCurrency(client.totalAmount)}
                                                </Typography>
                                                <Typography variant="body2" color="success.main">
                                                    Received: {formatCurrency(client.advanceReceived)}
                                                </Typography>
                                                <Typography variant="body2" color="warning.main">
                                                    Pending: {formatCurrency(client.remainingAmount)}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={calculateProgress(client.advanceReceived, client.totalAmount)}
                                                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={client.deliveryStatus}
                                                color={getStatusColor(client.deliveryStatus)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{display:'flex', justifyContent:'center', alignItems: 'center', height:'9vw', gap:'0.5vw', flexDirection: 'column'}}>
                                            <button className='cursor-pointer flex justify-center items-center  gap-[0.3vw] h-[2vw] w-[6vw] rounded-[0.5vw] bg-emerald-400/60 ' onClick={() => handleOpenPaymentDialog(client)} >
                                                <Payment className=' text-emerald-50 ' />
                                                <p className='text-[0.8vw]' >Payment</p>
                                            </button>
                                            <button className='cursor-pointer flex justify-center items-center  gap-[0.3vw] h-[2vw] w-[4vw] rounded-[0.5vw] bg-fuchsia-300/60 ' onClick={() => handleOpenDialog(client)} >
                                                <Edit className=' text-fuchsia-50 text-[0.9vw]' />
                                                <p className='text-[0.8vw]' >Edit</p>
                                            </button>
                                            <button className='cursor-pointer flex justify-center items-center  gap-[0.3vw] h-[2vw] w-[5vw] rounded-[0.5vw] bg-pink-600/60 ' onClick={() => handleDelete(client._id)} >
                                                <Delete className=' text-red-50 ' />
                                                <p className='text-[0.8vw]' >Delete</p>
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredClients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            {loading ? 'Loading...' : 'No clients found'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Add/Edit Dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                        <DialogTitle>
                            {editingClient ? 'Edit Client' : 'Add New Client'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Client Full Name"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}> {/* email */}
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        style={{ width: '55vw' }}
                                        label="Project Details:"
                                        multiline
                                        rows={4}
                                        value={formData.projectDetails}
                                        onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Total Amount"
                                        type="number"
                                        value={formData.totalAmount}
                                        onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Advance Received"
                                        type="number"
                                        value={formData.advanceReceived}
                                        onChange={(e) => setFormData({ ...formData, advanceReceived: Number(e.target.value) })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                {formData.totalAmount > 0 && (
                                    <Grid item xs={12}>
                                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                Remaining Amount: {formatCurrency(formData.totalAmount - formData.advanceReceived)}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={calculateProgress(formData.advanceReceived, formData.totalAmount)}
                                                sx={{ mt: 1 }}
                                            />
                                        </Box>
                                    </Grid>
                                )}
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="Project Start Date"
                                        value={formData.projectStartDate}
                                        onChange={(date) => setFormData({ ...formData, projectStartDate: date })}
                                        renderInput={(params) => <TextField {...params} fullWidth required />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="Project End Date"
                                        value={formData.projectEndDate}
                                        onChange={(date) => setFormData({ ...formData, projectEndDate: date })}
                                        renderInput={(params) => <TextField {...params} fullWidth required />}
                                        minDate={formData.projectStartDate}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        {/* Bond Status */}
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={formData.bondSigned}
                                        exclusive
                                        onChange={(e, value) => setFormData({ ...formData, bondSigned: value })}
                                    >
                                        <ToggleButton value={true} color="success">
                                            Bond Signed
                                        </ToggleButton>
                                        <ToggleButton value={false} color="error">
                                            Bond Not Signed
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Delivery Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {deliveryStatusOptions.map(option => (
                                            <Chip
                                                key={option.value}
                                                label={option.value}
                                                icon={option.icon}
                                                color={formData.deliveryStatus === option.value ? option.color : 'default'}
                                                onClick={() => setFormData({ ...formData, deliveryStatus: option.value })}
                                                variant={formData.deliveryStatus === option.value ? 'filled' : 'outlined'}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={!formData.clientName || !formData.phoneNumber || !formData.projectDetails || !formData.totalAmount}
                            >
                                {editingClient ? 'Update' : 'Add'} Client
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Payment Dialog */}
                    <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Add Payment</DialogTitle>
                        <DialogContent>
                            {selectedClient && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                    <Typography variant="subtitle2">Client: {selectedClient.clientName}</Typography>
                                    <Typography variant="body2">Email: {selectedClient.email}</Typography>
                                    <Typography variant="body2">Phone: {selectedClient.phoneNumber}</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2">Total: {formatCurrency(selectedClient.totalAmount)}</Typography>
                                    <Typography variant="body2">Received: {formatCurrency(selectedClient.advanceReceived)}</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        Pending: {formatCurrency(selectedClient.remainingAmount)}
                                    </Typography>
                                </Box>
                            )}
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Payment Amount"
                                        type="number"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                        helperText={selectedClient && paymentData.amount > selectedClient.remainingAmount ?
                                            'Amount exceeds pending amount' : ''}
                                        error={selectedClient && paymentData.amount > selectedClient.remainingAmount}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description/Notes"
                                        multiline
                                        rows={2}
                                        value={paymentData.description}
                                        onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
                            <Button
                                onClick={handlePayment}
                                variant="contained"
                                color="success"
                                disabled={!paymentData.amount || paymentData.amount <= 0}
                            >
                                Add Payment
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Snackbar */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                    >
                        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default Clients;