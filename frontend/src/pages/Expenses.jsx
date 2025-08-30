import React, { useState, useEffect } from 'react';
import FileButton from '../components/FileButton'
import FileButtonExcel from '../components/FileButtonExcel'
import styled from 'styled-components';
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
    MenuItem,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    AttachMoney,
    CalendarToday,
    Search,
    Refresh,
    TrendingUp,
    TrendingDown,
    PictureAsPdf,
    TableChart,
    Description,
    Campaign,
    Person,
    Build,
    MoreHoriz,
    AccountBalance,
    Assessment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Corrected import

const Expenses = () => {
    // States (same as before)
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalReceived: 0,
        totalExpenses: 0,
        profit: 0,
        actualProfit: 0,
        expensesByCategory: [],
        monthlyData: [],
        profitMargin: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Form data
    const [formData, setFormData] = useState({
        date: new Date(),
        category: '',
        amount: 0,
        description: '',
        paymentMethod: 'Cash',
        receiptNumber: ''
    });

    // Category options with icons and colors
    const categoryOptions = [
        { value: 'Marketing', icon: <Campaign />, color: '#8b5cf6' },
        { value: 'Staff Salary', icon: <Person />, color: '#3b82f6' },
        { value: 'Tools', icon: <Build />, color: '#10b981' },
        { value: 'Other', icon: <MoreHoriz />, color: '#f59e0b' }
    ];

    // Payment methods
    const paymentMethods = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];

    // Colors for pie chart
    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

    // Fetch expenses
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/expenses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Expenses fetched:', response.data);
            setExpenses(response.data);
            setFilteredExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            if (error.response?.status === 403) {
                showSnackbar('Access denied. Admin only.', 'error');
            } else {
                showSnackbar('Error fetching expenses', 'error');
            }
        }
        setLoading(false);
    };

    // Fetch summary
    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/expenses/summary?year=${year}&month=${month}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSummary(response.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchSummary();
    }, [selectedDate]);

    // Filter expenses
    useEffect(() => {
        let filtered = [...expenses];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(expense =>
                expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(expense => expense.category === filterCategory);
        }

        // Date filter - current month
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();
        filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });

        setFilteredExpenses(filtered);
    }, [searchTerm, filterCategory, expenses, selectedDate]);

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

            if (editingExpense) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/expenses/${editingExpense._id}`,
                    formData,
                    config
                );
                showSnackbar('Expense updated successfully', 'success');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/expenses`, formData, config);
                showSnackbar('Expense added successfully', 'success');
            }

            fetchExpenses();
            fetchSummary();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving expense:', error);
            showSnackbar(error.response?.data?.message || 'Error saving expense', 'error');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/expenses/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Expense deleted successfully', 'success');
                fetchExpenses();
                fetchSummary();
            } catch (error) {
                showSnackbar(error.message || 'Error deleting expense', 'error');
            }
        }
    };

    // Handle dialog
    const handleOpenDialog = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                date: new Date(expense.date),
                category: expense.category,
                amount: expense.amount,
                description: expense.description,
                paymentMethod: expense.paymentMethod || 'Cash',
                receiptNumber: expense.receiptNumber || ''
            });
        } else {
            setEditingExpense(null);
            setFormData({
                date: new Date(),
                category: '',
                amount: 0,
                description: '',
                paymentMethod: 'Cash',
                receiptNumber: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingExpense(null);
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

    // Export to PDF - Fixed version
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const monthYear = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            // Title
            doc.setFontSize(20);
            doc.text(`Expense Report - ${monthYear}`, 14, 22);

            // Summary
            doc.setFontSize(12);
            doc.text(`Total Income: ${formatCurrency(summary.totalIncome)}`, 14, 35);
            doc.text(`Total Expenses: ${formatCurrency(summary.totalExpenses)}`, 14, 42);
            doc.text(`Net Profit: ${formatCurrency(summary.profit)}`, 14, 49);
            doc.text(`Profit Margin: ${summary.profitMargin}%`, 14, 56);

            // Check if expenses exist
            if (filteredExpenses && filteredExpenses.length > 0) {
                // Prepare table data
                const tableData = filteredExpenses.map(expense => [
                    new Date(expense.date).toLocaleDateString(),
                    expense.category,
                    expense.description,
                    formatCurrency(expense.amount),
                    expense.paymentMethod,
                    expense.receiptNumber || '-'
                ]);

                // Add table using autoTable
                autoTable(doc, {
                    head: [['Date', 'Category', 'Description', 'Amount', 'Payment', 'Receipt']],
                    body: tableData,
                    startY: 65,
                    theme: 'grid',
                    styles: {
                        fontSize: 10,
                        cellPadding: 2,
                    },
                    headStyles: {
                        fillColor: [102, 126, 234],
                        textColor: 255,
                        fontStyle: 'bold',
                    },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        1: { cellWidth: 30 },
                        2: { cellWidth: 50 },
                        3: { cellWidth: 30 },
                        4: { cellWidth: 30 },
                        5: { cellWidth: 25 }
                    }
                });

                // Category breakdown
                if (summary.expensesByCategory && summary.expensesByCategory.length > 0) {
                    const finalY = doc.lastAutoTable.finalY || 100;
                    doc.setFontSize(14);
                    doc.text('Category Breakdown:', 14, finalY + 10);

                    doc.setFontSize(11);
                    summary.expensesByCategory.forEach((cat, index) => {
                        doc.text(
                            `• ${cat._id}: ${formatCurrency(cat.total)} (${cat.count} transactions)`,
                            20,
                            finalY + 20 + (index * 7)
                        );
                    });
                }
            } else {
                doc.text('No expenses found for this period.', 14, 70);
            }

            // Save the PDF
            doc.save(`expense-report-${monthYear.replace(' ', '-')}.pdf`);
            showSnackbar('PDF exported successfully', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            showSnackbar('Error exporting PDF', 'error');
        }
    };

    // Safe CSV Export - No external libraries needed
    const exportToCSV = () => {
        try {
            // Prepare CSV headers
            const headers = [
                'Date',
                'Category',
                'Description',
                'Amount',
                'Payment Method',
                'Receipt Number'
            ];

            // Prepare CSV rows
            const rows = filteredExpenses.map(expense => [
                new Date(expense.date).toLocaleDateString(),
                expense.category,
                expense.description.replace(/,/g, ';'), // Replace commas to avoid CSV issues
                expense.amount,
                expense.paymentMethod,
                expense.receiptNumber || 'N/A'
            ]);

            // Add summary at the end
            rows.push([]);
            rows.push(['SUMMARY']);
            rows.push(['Total Income', '', '', summary.totalIncome]);
            rows.push(['Total Expenses', '', '', summary.totalExpenses]);
            rows.push(['Net Profit', '', '', summary.profit]);
            rows.push(['Profit Margin', '', '', `${summary.profitMargin}%`]);

            // Convert to CSV string
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => {
                    // Wrap in quotes if contains comma or special characters
                    const cellStr = String(cell);
                    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(','))
            ].join('\n');

            // Create blob with BOM for Excel compatibility
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], {
                type: 'text/csv;charset=utf-8;'
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);

            // Set filename
            const monthYear = selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            }).replace(' ', '-');
            link.setAttribute('download', `expense-report-${monthYear}.csv`);

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(url);

            showSnackbar('CSV exported successfully! Open with Excel.', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showSnackbar('Error exporting CSV', 'error');
        }
    };

    // Prepare chart data
    const pieChartData = summary.expensesByCategory.map(cat => ({
        name: cat._id,
        value: cat.total
    }));

    const barChartData = summary.monthlyData.map(data => ({
        month: `${data._id.month}/${data._id.year}`,
        expense: data.totalExpense
    }));

    // button style
    // button style
    const StyledWrapper = styled.div`
      .button {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1vw 1.1vw;
        gap: 2px;
        height: 2.2vw;
        width: 85px;
        border: none;
        background: #a549da3d;
        border-radius: 0.5vw;
        cursor: pointer;
      }
    
      .lable {
        line-height: 22px;
        font-size: 1vw;
        color: #A649DA;
        font-family: sans-serif;
        letter-spacing: 1px;
      }
    
      .button:hover {
        background: #a549da62;
      }
    
      .button:hover .svg-icon {
        animation: lr 1s linear infinite;
      }
    
      @keyframes lr {
        0% {
          transform: translateX(0);
        }
    
        25% {
          transform: translateX(-1px);
        }
    
        75% {
          transform: translateX(1px);
        }
    
        100% {
          transform: translateX(0);
        }
      }`;
    // Rest of your component remains exactly the same...
    // (All the JSX for rendering UI)

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="xl" sx={{ bgcolor: '#d9d5ffa2' }}>
                <Box sx={{ py: 3 }}>
                    {/* Header */}
                    <Box display="flex" sx={{ p: 2, mb: 3, bgcolor: '#ffffffa7', borderRadius: '10px', paddingRight: '2vw', paddingLeft: '1vw' }} justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" gutterBottom fontWeight="bold" style={{ display: 'flex', alignItems: 'center' }}>
                            <img src="/s-logo.png" style={{ width: '50px', height: '50px', marginRight: '10px' }} alt="" />
                            <span class="relative text-4xl font-bold text-gray-800 group">
                                <span class="relative z-10 group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-500">
                                    <span class="group-hover:drop-shadow-gray-800">
                                        <a href="/dashboard" className='' style={{ textDecoration: 'none', color: 'inherit' }}  ><p>Expense & Profit Tracking</p></a>
                                    </span>
                                </span>
                                <span class="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-emerald-400 to-cyan-500 transition-all duration-500 group-hover:w-full"></span>
                            </span>
                        </Typography>
                        <Box display="flex" gap={2}>

                            <Button className='before:hidden hover:before:flex before:justify-center before:items-center before:h-6 before:w-[7vw] before:text-[0.8vw] before:px-2 before:content-["Export-PDF"] before:bg-white dark:before:bg-gray-600 dark:before:text-white before:text-gray-600 before:bg-opacity-50 before:absolute before:-bottom-7 before:rounded-lg before:rounded-r-lg before:transition-all before:duration-300'
                                // variant="outlined"
                                style={{ width: '7vw', height: '3vw', borderRadius: '0.5vw' }}
                                onClick={exportToPDF}
                            >
                                <FileButton
                                    onClick={exportToPDF}
                                ></FileButton>
                            </Button>
                            <Button className='before:hidden hover:before:flex before:justify-center before:items-center before:h-6 before:w-[7vw] before:text-[0.7vw] before:px-2 before:content-["Export-Excel"] before:bg-white dark:before:bg-gray-600 dark:before:text-white before:text-gray-600 before:bg-opacity-50 before:absolute before:-bottom-7 before:rounded-lg before:rounded-r-lg before:transition-all before:duration-300'
                                // variant="outlined"
                                style={{ width: '7vw', height: '3vw', borderRadius: '0.5vw' }}
                                onClick={exportToCSV}
                            >
                                <FileButtonExcel
                                    onClick={exportToCSV}
                                ></FileButtonExcel>
                            </Button>
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
                                Add Expense
                            </Button>
                        </Box>
                    </Box>

                    <Grid sx={{ display: 'flex', bgcolor: '#ffffffa7', borderRadius: '10px', padding:'3vw', }} container spacing={3} mb={3}>
                        {/* Financial Overview Cards */}
                        <Grid container spacing={3} mb={3}>

                            <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '2vw', }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ bgcolor: 'success.50',  width: '16vw', height: '10vw' }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '1vw', fontWeight: '600', paddingTop: '1vw' }}>
                                                        Total Income
                                                    </Typography>
                                                    <Typography variant="h5" color="success.main" sx={{ fontSize: '2.5vw', fontWeight: 'bolder', }}>
                                                        {formatCurrency(summary.totalIncome)}
                                                    </Typography>
                                                </Box>
                                                <TrendingUp color="success" sx={{ fontSize: 90, opacity: 0.3, marginTop: '1vw'}} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ bgcolor: 'error.50', width: '16vw', height: '10vw'}}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box sx={{marginTop: '1vw'}}>
                                                    <Typography color="textSecondary" gutterBottom variant="body2"sx={{ fontSize: '1vw', fontWeight: '600', paddingTop: '1vw'  }}>
                                                        Total Expenses
                                                    </Typography>
                                                    <Typography variant="h5" color="error.main" sx={{ fontSize: '2.5vw', fontWeight: 'bolder', }}>
                                                        {formatCurrency(summary.totalExpenses)}
                                                    </Typography>
                                                </Box>
                                                <TrendingDown color="error" sx={{ fontSize: 90, opacity: 0.3, marginTop: '1vw'  }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Grid sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '2vw' }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ bgcolor: summary.profit >= 0 ? 'primary.50' : 'warning.50',width: '16vw', height: '10vw' }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box>
                                                    <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '1vw', fontWeight: '600',paddingTop: '1vw' }}>
                                                        Net Profit
                                                    </Typography>
                                                    <Typography
                                                        variant="h5"
                                                        color={summary.profit >= 0 ? 'primary.main' : 'warning.main'}
                                                        sx={{ fontSize: '2.5vw', fontWeight: 'bolder', }}
                                                    >
                                                        {formatCurrency(summary.profit)}
                                                    </Typography>
                                                </Box>
                                                <Assessment
                                                    color={summary.profit >= 0 ? 'primary' : 'warning'}
                                                    sx={{ fontSize: 90, opacity: 0.3, marginTop: '1vw' }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ bgcolor: 'info.50', width: '16vw', height: '10vw' }}>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Box sx={{ marginTop: '1vw'}}>
                                                    <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontSize: '1vw', fontWeight: '600', paddingTop: '1vw' }}>
                                                        Profit Margin
                                                    </Typography>
                                                    <Typography variant="h5" color="info.main" sx={{ fontSize: '2.5vw', fontWeight: 'bolder', }}>
                                                        {summary.profitMargin}%
                                                    </Typography>
                                                </Box>
                                                <AccountBalance color="info" sx={{ fontSize: 90, opacity: 0.3, marginTop: '1vw' }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                        {/* Charts */}
                        <Grid container spacing={3} mb={3} sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '13vw' }}>
                            <Grid item xs={12} md={6} sx={{  }}>
                                <Paper sx={{ p: 3 , width:'150%' }}>
                                    <Typography variant="h6" gutterBottom>
                                        Expense Breakdown by Category
                                    </Typography>
                                    {pieChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={pieChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pieChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip formatter={(value) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography color="textSecondary" align="center">No data available</Typography>
                                    )}
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6} sx={{}}>
                                <Paper sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Monthly Expense Trend
                                    </Typography>
                                    {barChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={barChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <ChartTooltip formatter={(value) => formatCurrency(value)} />
                                                <Bar dataKey="expense" fill="#8b5cf6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography color="textSecondary" align="center">No data available</Typography>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Rest of your component (filters, table, dialogs) remains the same... */}
                    {/* Copy the rest from the previous code */}

                    {/* Filters */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search expenses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
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
                                    label="Filter by Category"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    {categoryOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.value}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <DatePicker
                                    label="Select Month"
                                    value={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    views={['year', 'month']}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={() => {
                                        fetchExpenses();
                                        fetchSummary();
                                    }}
                                >
                                    Refresh
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Expenses Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Payment Method</TableCell>
                                    <TableCell>Receipt No.</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredExpenses.map((expense) => {
                                    const categoryOption = categoryOptions.find(opt => opt.value === expense.category);
                                    return (
                                        <TableRow key={expense._id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={expense.category}
                                                    size="small"
                                                    icon={categoryOption?.icon}
                                                    sx={{
                                                        bgcolor: `${categoryOption?.color}20`,
                                                        color: categoryOption?.color
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>
                                                <Typography color="error.main" fontWeight="bold">
                                                    {formatCurrency(expense.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={expense.paymentMethod} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{expense.receiptNumber || '-'}</TableCell>
                                            <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <StyledWrapper>
                                                    <button className="button"
                                                        onClick={() => handleOpenDialog(expense)}
                                                    >
                                                        <svg className="svg-icon" fill="none" height={24} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg"><g stroke="#a649da" strokeLinecap="round" strokeWidth={2}><path d="m20 20h-16" /><path clipRule="evenodd" d="m14.5858 4.41422c.781-.78105 2.0474-.78105 2.8284 0 .7811.78105.7811 2.04738 0 2.82843l-8.28322 8.28325-3.03046.202.20203-3.0304z" fillRule="evenodd" /></g></svg>
                                                        <span className="lable">Edit</span>
                                                    </button>
                                                </StyledWrapper>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(expense._id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredExpenses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            {loading ? 'Loading...' : 'No expenses found'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Add/Edit Dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                        <DialogTitle>
                            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <DatePicker
                                        label="Date"
                                        value={formData.date}
                                        onChange={(date) => setFormData({ ...formData, date })}
                                        renderInput={(params) => <TextField {...params} fullWidth required />}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Category
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={formData.category}
                                        exclusive
                                        onChange={(e, value) => setFormData({ ...formData, category: value })}
                                        sx={{ flexWrap: 'wrap' }}
                                    >
                                        {categoryOptions.map(option => (
                                            <ToggleButton key={option.value} value={option.value}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {option.icon}
                                                    {option.value}
                                                </Box>
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Payment Method"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    >
                                        {paymentMethods.map(method => (
                                            <MenuItem key={method} value={method}>{method}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        style={{ width: '35vw' }}
                                        label="Description"
                                        multiline
                                        rows={1}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Receipt Number (Optional)"
                                        value={formData.receiptNumber}
                                        onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={!formData.category || !formData.amount || !formData.description}
                            >
                                {editingExpense ? 'Update' : 'Add'} Expense
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

export default Expenses;