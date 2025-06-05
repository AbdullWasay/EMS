import {
    Add as AddIcon,
    Category as CategoryIcon,
    Close as CloseIcon,
    Help as HelpIcon,
    Message as MessageIcon,
    Flag as PriorityIcon,
    Reply as ReplyIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { helpCenterService } from '../services/api';

const HelpCenter = () => {
  const { isAdmin } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  // Form state for new ticket
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general'
  });

  // Reply state for admin
  const [replyMessage, setReplyMessage] = useState('');
  const [replyDialog, setReplyDialog] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await helpCenterService.getAllTickets(filters);
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch help tickets');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    try {
      if (!formData.subject.trim() || !formData.message.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      await helpCenterService.createTicket(formData);
      toast.success('Help ticket created successfully!');
      setOpenDialog(false);
      setFormData({
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
      });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create help ticket');
    }
  };

  const handleReplyToTicket = async () => {
    try {
      if (!replyMessage.trim()) {
        toast.error('Please enter a reply message');
        return;
      }

      await helpCenterService.replyToTicket(selectedTicket._id, { message: replyMessage });
      toast.success('Reply sent successfully!');
      setReplyDialog(false);
      setReplyMessage('');
      fetchTickets();

      // Update the selected ticket with the new reply
      const updatedTicket = await helpCenterService.getTicket(selectedTicket._id);
      setSelectedTicket(updatedTicket.data.data);
    } catch (error) {
      console.error('Error replying to ticket:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await helpCenterService.updateTicketStatus(ticketId, { status: newStatus });
      toast.success('Ticket status updated successfully!');
      fetchTickets();

      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
            <HelpIcon />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Help Center
          </Typography>
        </Box>
        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              }
            }}
          >
            New Ticket
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  sx={{
                    '& .MuiSelect-select': {
                      minWidth: 120,
                      paddingRight: '32px !important'
                    }
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  sx={{
                    '& .MuiSelect-select': {
                      minWidth: 120,
                      paddingRight: '32px !important'
                    }
                  }}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  sx={{
                    '& .MuiSelect-select': {
                      minWidth: 120,
                      paddingRight: '32px !important'
                    }
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                  <MenuItem value="payroll">Payroll</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                      <Typography>Loading tickets...</Typography>
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                      <Typography color="textSecondary">No help tickets found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {ticket.subject}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {ticket.message.length > 50
                            ? `${ticket.message.substring(0, 50)}...`
                            : ticket.message
                          }
                        </Typography>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Typography variant="body2">
                            {ticket.employee?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {ticket.employee?.employeeId || 'N/A'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={ticket.priority.toUpperCase()}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                          icon={<PriorityIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.category.toUpperCase()}
                          variant="outlined"
                          size="small"
                          icon={<CategoryIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status.replace('-', ' ').toUpperCase()}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(ticket.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setViewDialog(true);
                            }}
                          >
                            <MessageIcon />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <Tooltip title="Reply">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setReplyDialog(true);
                              }}
                            >
                              <ReplyIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create New Help Ticket
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <MenuItem value="technical">Technical</MenuItem>
                    <MenuItem value="hr">HR</MenuItem>
                    <MenuItem value="payroll">Payroll</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTicket}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              }
            }}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ticket Details
            </Typography>
            <IconButton onClick={() => setViewDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedTicket.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={selectedTicket.priority.toUpperCase()}
                      color={getPriorityColor(selectedTicket.priority)}
                      size="small"
                    />
                    <Chip
                      label={selectedTicket.category.toUpperCase()}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={selectedTicket.status.replace('-', ' ').toUpperCase()}
                      color={getStatusColor(selectedTicket.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Message:
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                    <Typography variant="body2">
                      {selectedTicket.message}
                    </Typography>
                  </Paper>
                </Grid>
                {selectedTicket.adminReply && selectedTicket.adminReply.message && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Admin Reply:
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {selectedTicket.adminReply.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Replied by: {selectedTicket.adminReply.repliedBy?.name || 'Admin'} on{' '}
                        {formatDate(selectedTicket.adminReply.repliedAt)}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Created: {formatDate(selectedTicket.createdAt)}
                    {isAdmin && selectedTicket.employee && (
                      <> • Employee: {selectedTicket.employee.name} (ID: {selectedTicket.employee.employeeId})</>
                    )}
                  </Typography>
                </Grid>
                {isAdmin && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusChange(selectedTicket._id, 'in-progress')}
                        disabled={selectedTicket.status === 'in-progress'}
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleStatusChange(selectedTicket._id, 'resolved')}
                        disabled={selectedTicket.status === 'resolved'}
                      >
                        Mark Resolved
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleStatusChange(selectedTicket._id, 'closed')}
                        disabled={selectedTicket.status === 'closed'}
                      >
                        Close Ticket
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog (Admin Only) */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Reply to Ticket
            </Typography>
            <IconButton onClick={() => setReplyDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Subject: {selectedTicket.subject}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reply Message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                required
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setReplyDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReplyToTicket}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HelpCenter;
