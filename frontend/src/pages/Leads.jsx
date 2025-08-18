import React, { useState, useEffect } from 'react';
import axios from 'axios'; // 17-08 update
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
    MenuItem,
    Alert,
    Snackbar,
    Badge,
    Tooltip,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Tab,
    Tabs,
    Card,
    CardContent,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Phone,
    Notes,
    CalendarToday,
    Search,
    FilterList,
    Refresh,
    Close,
    CheckCircle,
    Warning,
    Schedule,
    Person,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';

const Leads = () => {
    // States
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSource, setFilterSource] = useState('all');
    const [tabValue, setTabValue] = useState(0);
    const [loading , setLoading] = useState(false); // just remove loading
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form data
    const [formData, setFormData] = useState({
        clientName: '',
        phoneNumber: '',
        referenceSource: '',
        status: 'New',
        notes: '',
        followUpDate: null,
    });

    // Reference sources
    const referenceSources = ['Justdial', 'Adkriti', 'Meta', 'Google', 'Reference', 'Walk-in', 'Other'];

    // Status options with colors
    const statusOptions = [
        { value: 'New', color: 'primary' },
        { value: 'Interested', color: 'success' },
        { value: 'Not Connected', color: 'warning' },
        { value: 'Not Answered', color: 'default' },
        { value: 'Converted', color: 'success' },
        { value: 'Visited', color: 'info' },
        { value: 'In Progress', color: 'info' },
        { value: 'Closed', color: 'default' },
        { value: 'Not Interested', color: 'error' },
        { value: 'Dead', color: 'error' },
    ];

    // Fetch leads
    const fetchLeads = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(response.data);
            setFilteredLeads(response.data);
        } catch (error) {
            showSnackbar(error.message || 'Error fetching leads', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Filter leads
    useEffect(() => {
        let filtered = [...leads];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(lead =>
                lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phoneNumber.includes(searchTerm)
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(lead => lead.status === filterStatus);
        }

        // Source filter
        if (filterSource !== 'all') {
            filtered = filtered.filter(lead => lead.referenceSource === filterSource);
        }

        // Tab filter
        if (tabValue === 1) { // Today's follow-ups
            const today = new Date().toDateString();
            filtered = filtered.filter(lead =>
                lead.followUpDate && new Date(lead.followUpDate).toDateString() === today
            );
        } else if (tabValue === 2) { // Interested
            filtered = filtered.filter(lead => lead.status === 'Interested');
        }

        setFilteredLeads(filtered);
    }, [searchTerm, filterStatus, filterSource, tabValue, leads]);

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            if (editingLead) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/leads/${editingLead._id}`, formData, config);
                showSnackbar('Lead updated successfully', 'success');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/leads`, formData, config);
                showSnackbar('Lead created successfully', 'success');
            }

            fetchLeads();
            handleCloseDialog();
        } catch (error) {
            showSnackbar(error.message || 'Error saving lead', 'error');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/leads/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Lead deleted successfully', 'success');
                fetchLeads();
            } catch (error) {
                showSnackbar(error.message || 'Error deleting lead', 'error');
            }
        }
    };

    // Handle dialog
    const handleOpenDialog = (lead = null) => {
        if (lead) {
            setEditingLead(lead);
            setFormData({
                clientName: lead.clientName,
                phoneNumber: lead.phoneNumber,
                referenceSource: lead.referenceSource,
                status: lead.status,
                notes: lead.notes,
                followUpDate: lead.followUpDate ? new Date(lead.followUpDate) : null,
            });
        } else {
            setEditingLead(null);
            setFormData({
                clientName: '',
                phoneNumber: '',
                referenceSource: '',
                status: 'New',
                notes: '',
                followUpDate: null,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingLead(null);
    };

    // Show snackbar
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    // Get status color
    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.color : 'default';
    };

    // Stats cards
    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'New').length,
        interested: leads.filter(l => l.status === 'Interested').length,
        converted: leads.filter(l => l.status === 'Converted').length,
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl">
                <Box sx={{ py: 3 }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" gutterBottom fontWeight="bold" style={{ display: 'flex', alignItems: 'center' }}>
                            <img src="https://i.pinimg.com/736x/76/bf/92/76bf929f50301acec6eaa8a7eeb5a21a.jpg" style={{ width: '50px', height: '50px', marginRight: '10px' }} alt="" />
                            <p>Leads Management</p>
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
                            Add New Lead
                        </Button>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" width="15vw">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom>
                                                Total Leads
                                            </Typography>
                                            <Typography variant="h4">{stats.total}</Typography>
                                        </Box>
                                        <Person color="primary" sx={{ fontSize: 70 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" width="15vw">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom>
                                                New Leads
                                            </Typography>
                                            <Typography variant="h4">{stats.new}</Typography>
                                        </Box>
                                        <Schedule color="info" sx={{ fontSize: 70 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" width="15vw">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom>
                                                Interested
                                            </Typography>
                                            <Typography variant="h4">{stats.interested}</Typography>
                                        </Box>
                                        <Warning color="warning" sx={{ fontSize: 70 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" width="15vw">
                                        <Box>
                                            <Typography color="textSecondary" gutterBottom>
                                                Converted
                                            </Typography>
                                            <Typography variant="h4">{stats.converted}</Typography>
                                        </Box>
                                        <CheckCircle color="success" sx={{ fontSize: 70 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Tabs */}
                    <Paper sx={{ mb: 3 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                            <Tab label={`All Leads (${leads.length})`} style={{ width: '17vw' }} />
                            <Tab
                                label={
                                    <Badge badgeContent={leads.filter(l => l.followUpDate && new Date(l.followUpDate).toDateString() === new Date().toDateString()).length} color="error" style={{ width: '17vw' }} >
                                        Today's Follow-ups
                                    </Badge>
                                }
                            />
                            <Tab label={`Interested (${stats.interested})`} style={{ width: '17vw' }} />
                        </Tabs>
                    </Paper>

                    {/* Filters */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '25vw' }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start"  >
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Filter by Status"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ width: '13vw' }}
                                >
                                    <MenuItem value="all" >All Status</MenuItem>
                                    {statusOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}  >
                                            {option.value}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Filter by Source"
                                    value={filterSource}
                                    onChange={(e) => setFilterSource(e.target.value)}
                                    style={{ width: '13vw' }}
                                >
                                    <MenuItem value="all">All Sources</MenuItem>
                                    {referenceSources.map(source => (
                                        <MenuItem key={source} value={source}>{source}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={fetchLeads}
                                    style={{ width: '12vw', height: '7.5vh' }}
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
                                    <TableCell>Client Name</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Source</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Follow-up</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLeads.map((lead) => (
                                    <TableRow key={lead._id} hover>
                                        <TableCell>{lead.clientName}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Phone fontSize="small" sx={{ mr: 1 }} />
                                                {lead.phoneNumber}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={lead.referenceSource} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={lead.status}
                                                size="small"
                                                color={getStatusColor(lead.status)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={lead.notes || 'No notes'}>
                                                <Notes fontSize="small" />
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(lead.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(lead)}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(lead._id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No leads found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Add/Edit Dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                        <DialogTitle>
                            {editingLead ? 'Edit Lead' : 'Add New Lead'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Client Name"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Reference Source
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={formData.referenceSource}
                                        exclusive
                                        onChange={(e, value) => setFormData({ ...formData, referenceSource: value })}
                                        sx={{ flexWrap: 'wrap' }}
                                    >
                                        {referenceSources.map(source => (
                                            <ToggleButton key={source} value={source} size="small">
                                                {source}
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {statusOptions.map(option => (
                                            <Chip
                                                key={option.value}
                                                label={option.value}
                                                color={formData.status === option.value ? option.color : 'default'}
                                                onClick={() => setFormData({ ...formData, status: option.value })}
                                                variant={formData.status === option.value ? 'filled' : 'outlined'}
                                            />
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="Follow-up Date"
                                        value={formData.followUpDate}
                                        onChange={(date) => setFormData({ ...formData, followUpDate: date })}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                        defaultValue={date => new Date(date)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Notes"
                                        multiline
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={!formData.clientName || !formData.phoneNumber || !formData.referenceSource}
                            >
                                {editingLead ? 'Update' : 'Add'} Lead
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

export default Leads;