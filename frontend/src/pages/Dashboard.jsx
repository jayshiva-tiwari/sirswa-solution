import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader'; // Import the Loader component
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
} from '@mui/material';
import {
  Logout,
  Person,
  Dashboard as DashboardIcon,
  People,
  Groups,
  Receipt,
  Assessment,
  Settings,
  TrendingUp,
  TrendingDown,
  Schedule,
  CheckCircle,
  Warning,
  ArrowForward,
  AttachMoney,
  Task,
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}> 
          <Loader
            // message="Custom loading text..."
            // Optional props:
            // emojis={['🚀', '👨‍💻', '🎨', '🦄']} // Custom emoji set
            // speed={500} // Animation speed in ms
            // themeColor="#4dabf7" // Change progress bar color
          /> 
        </Typography>
      </Container>
    );
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Generate avatar color based on role
  const getAvatarColor = (role) => {
    return role === 'admin' ? '#667eea' : '#764ba2';
  };

  const features = user.role === 'admin'
    ? [
      // { icon: <DashboardIcon />, title: 'Dashboard', description: 'Overview and analytics', path: '/dashboard', color: '#667eea' },
      { icon: <People />, title: 'Leads & Prospects', description: 'Manage leads and prospects', path: '/leads', color: '#3b82f6' },
      { icon: <Groups />, title: 'Clients Management', description: 'Client management', path: '/clients', color: '#10b981' },
      { icon: <Receipt />, title: 'Expenses Management', description: 'Track expenses', path: '/expenses', color: '#f59e0b' },
      // { icon: <Assessment />, title: 'Reports', description: 'View reports', path: '/reports', color: '#ef4444' },
    ]
    : [
      { icon: <People />, title: 'Leads', description: 'Manage leads and prospects', path: '/leads', color: '#3b82f6' },
      { icon: <Groups />, title: 'Clients', description: 'Client management', path: '/clients', color: '#10b981' },
    ];

  // Mock data for recent activities
  const recentActivities = [
    { icon: <CheckCircle color="success" />, title: 'New lead added', time: '2 hours ago', desc: 'John Doe from Mumbai' },
    { icon: <Groups color="primary" />, title: 'Client converted', time: '5 hours ago', desc: 'ABC Company project confirmed' },
    { icon: <AttachMoney color="warning" />, title: 'Payment received', time: '1 day ago', desc: '₹50,000 from XYZ Corp' },
    { icon: <Task color="info" />, title: 'Follow-up scheduled', time: '2 days ago', desc: 'Meeting with potential client' },
  ];

  // Mock data for upcoming tasks
  const upcomingTasks = [
    { title: 'Call Mr. Sharma', time: '10:00 AM', priority: 'high' },
    { title: 'Send proposal to ABC Corp', time: '2:00 PM', priority: 'medium' },
    { title: 'Team meeting', time: '4:00 PM', priority: 'low' },
    { title: 'Review monthly report', time: '5:30 PM', priority: 'medium' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="xl" align="center">
        <Box sx={{ pt: 4 }}>
          {/* Header with Profile Icon */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'white' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" gutterBottom fontWeight="bold" style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="https://i.pinimg.com/736x/76/bf/92/76bf929f50301acec6eaa8a7eeb5a21a.jpg" style={{ width: '50px', height: '50px', marginRight: '10px' }} alt="" />
                  <p>Welcome to Dashboard</p>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Hello {user.name}, here's what's happening with your business today.
                </Typography>
              </Box>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s',
                          width: '14vw',

                          borderRadius: 11,
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)',
                            borderColor: feature.color,
                            bgcolor: `${feature.color}10`,
                          }
                        }}
                        onClick={() => handleFeatureClick(feature.path)}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ height: '2vw' }}>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ bgcolor: feature.color, mr: 1 }}>
                              {feature.icon}
                            </Avatar>
                            <Box sx={{ height: '3.5vw', }}>
                              <Typography variant="subtitle1" fontWeight="bold" style={{ fontSize: '0.9vw', width: '4vw', textAlign: 'left' }}>
                                {feature.title}
                              </Typography>
                              {/* <Typography variant="body3" color="text.secondary" style={{ fontSize: '0.6vw', marginTop: '0vw' }}>
                                {feature.description}
                              </Typography> */}
                            </Box>
                          </Box>
                          <ArrowForward sx={{ color: 'text.secondary', marginLeft: 1 }} />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Profile Circle Icon */}
                <IconButton
                  onClick={handleProfileClick}
                  size="small"
                >
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: getAvatarColor(user.role),
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: 3,
                      }
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                </IconButton>
              </div>
            </Box>
          </Paper>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 250,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ bgcolor: getAvatarColor(user.role), mr: 1.5 }}>
                  {getInitials(user.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={user.role === 'admin' ? 'Administrator' : 'Calling Staff'}
                color={user.role === 'admin' ? 'primary' : 'default'}
                size="small"
                sx={{ mt: 1, width: '100%' }}
              />
            </Box>

            <Divider />

            {/* <MenuItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>
            
            <MenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem> */}

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>
                <Typography color="error">Logout</Typography>
              </ListItemText>
            </MenuItem>
          </Menu>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}  >
              <Card sx={{ bgcolor: 'primary.main', color: 'white', width: "23vw" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">156</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Leads</Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">12% increase</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.main', color: 'white', width: "23vw" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">48</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Clients</Typography>
                    </Box>
                    <Groups sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">8% increase</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white', width: "23vw" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">₹2.4L</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Revenue</Typography>
                    </Box>
                    <AttachMoney sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">23% increase</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.main', color: 'white', width: "23.7vw" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">31%</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>Conversion</Typography>
                    </Box>
                    <Assessment sx={{ fontSize: 40, opacity: 0.3 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">3% decrease</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ alignContent: 'center' }}>
            {/* Quick Actions / Features */}


            {/* Upcoming Tasks */}
            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Today's Tasks
                  </Typography>
                </Box>
                <List dense>
                  {upcomingTasks.map((task, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{task.title}</Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {task.time}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Recent Activities
                </Typography>
                <List>
                  {recentActivities.map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'grey.100' }}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">{activity.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.desc}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Progress Overview */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Paper elevation={1} sx={{ p: 6 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Monthly Progress
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Lead Conversion</Typography>
                      <Typography variant="body2" fontWeight="bold">68%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={68} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Revenue Target</Typography>
                      <Typography variant="body2" fontWeight="bold">82%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={82} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Client Satisfaction</Typography>
                      <Typography variant="body2" fontWeight="bold">91%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={91} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={6}   >
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Performance Metrics
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={9} bgcolor="grey.50" borderRadius={2}>
                      <Typography variant="h5" color="primary" fontWeight="bold">24</Typography>
                      <Typography variant="body2" color="text.secondary">New Leads This Week</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={9} bgcolor="grey.50" borderRadius={2}>
                      <Typography variant="h5" color="success.main" fontWeight="bold">8</Typography>
                      <Typography variant="body2" color="text.secondary">Deals Closed</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={9} bgcolor="grey.50" borderRadius={2}>
                      <Typography variant="h5" color="warning.main" fontWeight="bold">16</Typography>
                      <Typography variant="body2" color="text.secondary">Pending Follow-ups</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={9} bgcolor="grey.50" borderRadius={2}>
                      <Typography variant="h5" color="info.main" fontWeight="bold">92%</Typography>
                      <Typography variant="body2" color="text.secondary">Response Rate</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;