import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader'; // Import the Loader component
// import Landing from '../components/Landing'; // Import the Landing component
import Background from '../components/Background';
import TodayTasks from '../components/TodayTasks';
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
// import { grey } from '@mui/material/colors';

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
          <Loader/>
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
      { icon: <People />, title: 'Leads', description: 'Manage leads and prospects', path: '/leads', color: '#3b82f6' },
      { icon: <Groups />, title: 'Client', description: 'Client management', path: '/clients', color: '#10b981' },
      { icon: <Receipt />, title: 'Expenses', description: 'Track expenses', path: '/expenses', color: '#f59e0b' },
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

  return (
    <Background gradient="from-indigo-50 via-violet-50 to-white" patternColor="#4f46e5">
      <Box sx={{ minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="xl" align="center">
          <Box sx={{ pt: 4 }}>
            {/* Header with Profile Icon */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#ffffffa7', borderRadius: '10px', paddingRight: '2vw', paddingLeft: '1vw' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div className='flex justify-between items-center'>
                  <Typography variant="h4" gutterBottom fontWeight="bold" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/s-logo.png" style={{ width: '5vw', height: '5vw', marginRight: '10px' }} alt="" />
                  </Typography>
                  <div className='flex flex-col items-start'>
                    <h2 className='font-bold text-2xl w-full text-left'>Welcome to Dashboard</h2>
                    <p className='text-gray-800 text-left '>Hello {user.name} !!</p>
                  </div>
                </div>
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
                              bgcolor: `${feature.color}20`,
                            }
                          }}
                          onClick={() => handleFeatureClick(feature.path)}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ height: '2vw', }}>
                            <Box display="flex" alignItems="center" >
                              <Avatar sx={{ bgcolor: feature.color, mr: 2 }}>
                                {feature.icon}
                              </Avatar>
                              <Box sx={{ height: '3vw', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="subtitle1" fontWeight="bold" style={{ fontSize: '1.2vw', width: '3vw', textAlign: 'left' }}>
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
                <Box display="flex" alignItems="center" mb={1}  >
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

            {/* <Landing></Landing> */}

            <div class="w-full text-center flex align-center justify-center flex-col mb-8 h-[35vw] gap-[3vw] ">
                <div className='flex align-center justify-center flex-col gap-[1vw]'>
                  <h1 class="mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
                  We Build Greatness with <span class="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text  text-transparent">Sirswa</span>
                  {/* <span class="text-sky-900">Project</span> */}
                </h1>
                <p class="mx-auto mb-8 w-full text-lg text-slate-700 align-center">
                  All-in-one CRM tailored for your workflow - Leads, Clients, Projects, Expenses & Profit <br /> analytics in a single dashboard.
                </p>
                </div>
                <div class="flex flex-wrap justify-center gap-4">
                  <button class="rounded-lg  font-medium bg-sky-900 text-white hover:bg-sky-800 w-[11vw] h-[5vh]">
                    Get Start your Day
                  </button>
                  <button class="rounded-lg border w-[8vw] h-[5vh] font-medium border-slate-200 bg-white transparent text-slate-900 hover:bg-slate-50">
                    scroll Down
                  </button>
                </div>
              </div>
            
            <Grid container spacing={3} sx={{ alignContent: 'center' }}>
              {/* Quick Actions / Features */}


              {/* Today Tasks */}
              <TodayTasks />

              {/* Recent Activities */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3 }} className='w-[32vw]'>
                  <Typography variant="h6" gutterBottom fontWeight="bold" className='text-left'>
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

              {/* Quick Stats */}
              <Grid item xs={12} md={6}   >
                <Paper elevation={1} sx={{ p: 3 }} className='w-[95.5vw] border-radius-5'>
                  <Typography variant="h6" gutterBottom fontWeight="bold"  >
                    Performance Metrics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1, display: 'flex', justifyContent: 'center', }}  >
                    <Grid item xs={6} >
                      <Box textAlign="center" p={5} borderRadius={2} sx={{ width: '22vw', bgcolor: '#e3d8f3b0' }} >
                        <Typography variant="h5" color="primary" fontWeight="bold">24</Typography>
                        <Typography variant="body2" color="text.secondary">New Leads This Week</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={5} borderRadius={2} sx={{ width: '22vw', bgcolor: '#e3d8f3b0' }}>
                        <Typography variant="h5" color="success.main" fontWeight="bold">08</Typography>
                        <Typography variant="body2" color="text.secondary">Deals Closed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={5} borderRadius={2} sx={{ width: '22vw', bgcolor: '#e3d8f3b0' }}>
                        <Typography variant="h5" color="warning.main" fontWeight="bold">16</Typography>
                        <Typography variant="body2" color="text.secondary">Pending Follow-ups</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={5} borderRadius={2} sx={{ width: '22vw', bgcolor: '#e3d8f3b0' }}>
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
    </Background>
  );
};

export default Dashboard;