// TodayTasksMui.jsx
import {
    Paper,
    Box,
    Typography,
    Tabs,
    Tab,
    Badge,
    TextField,
    Select,
    MenuItem,
    Button,
    IconButton,
    Checkbox,
    Chip,
    Stack,
    CircularProgress,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import axios from '../services/api';               // ← your axios instance (baseURL + JWT)

const API_BASE =
    import.meta.env.VITE_API_URL || 'https://backend.sirswasolutions.com/api';

/* map priority → chip colour */
const priorityColor = {
    high: 'error',
    medium: 'warning',
    low: 'success',
};

const formatTime = (t) =>
    t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

export default function TodayTasksMui() {
    /* ───────── state ───────── */
    const [tab, setTab] = useState('pending');                // 'pending' | 'completed' | 'all'
    const [tasks, setTasks] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        title: '',
        time: '',
        priority: 'medium',
    });

    const theme = useTheme();
    const downSm = useMediaQuery(theme.breakpoints.down('sm'));

    /* ───────── API helpers (axios) ───────── */
    const listTasks = (status) =>
        axios.get(
            `/api/tasks/today${status && status !== 'all' ? `?status=${status}` : ''}`
        );
    const addTask = (body) => axios.post('/api/tasks', body);
    const toggleTask = (id) => axios.patch(`/api/tasks/${id}/toggle`);
    const deleteTask = (id) => axios.delete(`/api/tasks/${id}`);
    const clearCompleted = () => axios.delete('/api/tasks/today/clear-completed');

    /* ───────── load tasks ───────── */
    const load = async (status = tab) => {
        setLoading(true);
        try {
            const { data } = await listTasks(status);
            // Backend returns { tasks, counts }
            if (data && data.tasks) {
                setTasks(Array.isArray(data.tasks) ? data.tasks : []);
                if (data.counts) {
                    setCounts(data.counts);
                }
            } else {
                setTasks([]);
                setCounts({ pending: 0, completed: 0 });
            }
        } catch (e) {
            console.error('Load tasks error', e);
            setTasks([]);
            setCounts({ pending: 0, completed: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [tab]);

    /* ───────── add task ───────── */
    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        try {
            await addTask(form);
            setForm({ title: '', time: '', priority: 'medium' });
            setTab('pending');
            load('pending');
        } catch (error) {
            console.error('Add task error', error);
        }
    };

    /* Use counts from backend instead of filtering locally */
    const pending = counts.pending || 0;
    const completed = counts.completed || 0;

    /* ───────── UI ───────── */
    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: 3,
                backdropFilter: 'blur(6px)',
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 2 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                >
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        <CheckCircleIcon color="primary" fontSize="small" />
                        Today's Tasks
                    </Typography>

                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                            '.MuiTab-root': { minHeight: 32, px: 1.5 },
                            minHeight: 32,
                        }}
                    >
                        <Tab
                            label={
                                <Badge color="error" badgeContent={pending} invisible={!pending}>
                                    Pending
                                </Badge>
                            }
                            value="pending"
                        />
                        <Tab
                            label={
                                <Badge
                                    color="success"
                                    badgeContent={completed}
                                    invisible={!completed}
                                >
                                    Completed
                                </Badge>
                            }
                            value="completed"
                        />
                        <Tab label="All" value="all" />
                    </Tabs>
                </Stack>
            </Box>

            {/* ADD FORM */}
            <Box component="form" onSubmit={handleAdd} mb={2}>
                <Stack
                    direction={downSm ? 'column' : 'row'}
                    spacing={1}
                    useFlexGap
                    alignItems="stretch"
                >
                    <TextField
                        placeholder="Task title…"
                        size="small"
                        fullWidth
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <TextField
                        type="time"
                        size="small"
                        sx={{ minWidth: 120 }}
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                    <Select
                        size="small"
                        sx={{ minWidth: 120 }}
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                    </Select>
                    <Button
                        variant="contained"
                        type="submit"
                        startIcon={<AddIcon />}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Add
                    </Button>
                </Stack>
            </Box>

            {/* LIST */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                    >
                        <CircularProgress size={24} />
                    </Box>
                ) : tasks.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        mt={3}
                    >
                        No tasks.
                    </Typography>
                ) : (
                    tasks.map((t) => (
                        <Stack
                            direction="row"
                            key={t._id}
                            alignItems="center"
                            spacing={1}
                            sx={{
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2,
                                px: 1.5,
                                py: 1,
                                mb: 1,
                            }}
                        >
                            <Checkbox
                                checked={t.status === 'completed'}
                                onChange={async () => {
                                    try {
                                        await toggleTask(t._id);
                                        load(tab);
                                    } catch (error) {
                                        console.error('Toggle task error', error);
                                    }
                                }}
                            />
                            <Box flexGrow={1}>
                                <Typography
                                    sx={{
                                        fontSize: '.95rem',
                                        textDecoration:
                                            t.status === 'completed' ? 'line-through' : 'none',
                                        color:
                                            t.status === 'completed'
                                                ? 'text.secondary'
                                                : 'text.primary',
                                    }}
                                >
                                    {t.title}
                                </Typography>
                                {t.dueAt && (
                                    <Typography variant="caption" color="text.secondary">
                                        {formatTime(t.dueAt)}
                                    </Typography>
                                )}
                            </Box>
                            <Chip
                                label={t.priority}
                                size="small"
                                color={priorityColor[t.priority]}
                                variant="outlined"
                            />
                            <IconButton onClick={async () => {
                                try {
                                    await deleteTask(t._id);
                                    load(tab);
                                } catch (error) {
                                    console.error('Delete task error', error);
                                }
                            }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    ))
                )}
            </Box>

            {/* FOOTER */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
            >
                <Typography variant="caption" color="text.secondary">
                    Auto-clears at midnight
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={async () => {
                        try {
                            await clearCompleted();
                            load(tab);
                        } catch (error) {
                            console.error('Clear completed error', error);
                        }
                    }}
                >
                    Clear Completed
                </Button>
            </Stack>
        </Paper>
    );
}