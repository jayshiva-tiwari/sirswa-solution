import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton, useTheme } from '@mui/material';
import { TrendingUp, CheckCircleOutline, Schedule, Speed } from '@mui/icons-material';
import CountUp from 'react-countup'; // npm install react-countup
import axios from '../services/api'; // Your configured axios instance

// Reusable Metric Card component
const MetricCard = ({ title, value, icon, color, suffix = '' }) => {
    const theme = useTheme();
    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[6],
                }
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${color}.light`,
                            color: `${color}.main`,
                            opacity: 1
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h6" fontWeight="bold" mt={1}>
                    <CountUp end={value} duration={1.5} separator="," />
                    {suffix}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                        {title}
                    </Typography>
            </CardContent>
        </Card>
    );
};

// Main Performance Metrics component
const PerformanceMetrics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const { data } = await axios.get('/metrics/performance');
                setMetrics(data);
            } catch (error) {
                console.error("Failed to fetch metrics:", error);
                // Set default values on error to avoid breaking the UI
                setMetrics({ newLeadsThisWeek: 0, dealsClosedThisMonth: 0, pendingFollowUps: 0, responseRate: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const metricItems = [
        {
            title: "New Leads This Week",
            valueKey: "newLeadsThisWeek",
            icon: <TrendingUp />,
            color: "primary"
        },
        {
            title: "Deals Closed This Month",
            valueKey: "dealsClosedThisMonth",
            icon: <CheckCircleOutline />,
            color: "success"
        },
        {
            title: "Pending Follow-ups",
            valueKey: "pendingFollowUps",
            icon: <Schedule />,
            color: "warning"
        },
        {
            title: "Response Rate",
            valueKey: "responseRate",
            icon: <Speed />,
            color: "info",
            suffix: "%"
        }
    ];

    return (
        <Box sx={{  bgcolor: 'background.paper', p: 4, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Performance Metrics
            </Typography>
            <Grid container spacing={3}>
                {loading
                    ? // Show skeleton loaders while data is being fetched
                    [...Array(4)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))
                    : // Show metric cards once data is loaded
                    metricItems.map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item.title}>
                            <MetricCard
                                title={item.title}
                                value={metrics ? metrics[item.valueKey] : 0}
                                icon={item.icon}
                                color={item.color}
                                suffix={item.suffix}
                            />
                        </Grid>
                    ))}
            </Grid>
        </Box>
    );
};

export default PerformanceMetrics;