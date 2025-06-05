import {
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Typography
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { paymentRecordsService } from '../services/api';

const EmployeePayments = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPaymentData();
  }, [statusFilter]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);

      // Fetch payment records and summary
      const [recordsResponse, summaryResponse] = await Promise.all([
        paymentRecordsService.getAllRecords({ status: statusFilter }),
        paymentRecordsService.getMyPaymentSummary()
      ]);

      setPaymentRecords(recordsResponse.data.data || []);
      setPaymentSummary(summaryResponse.data.data || null);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          My Payment Records
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your salary payments and payment history
        </Typography>
      </Box>

      {/* Payment Summary Cards */}
      {paymentSummary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(paymentSummary.summary.totalPaidAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Paid
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatCurrency(paymentSummary.summary.totalPendingAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pending
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {paymentSummary.summary.paidPayments}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Paid Records
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {paymentSummary.summary.totalPayments}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Records
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Payment Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Records Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Payment History
          </Typography>

          {paymentRecords.length === 0 ? (
            <Alert severity="info">
              No payment records found. Payment records will appear here once your admin uploads them.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Pay Period</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Basic Salary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Gross Pay</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Net Pay</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentRecords.map((record) => (
                    <TableRow key={record._id} hover>
                      <TableCell>{record.payPeriod}</TableCell>
                      <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                      <TableCell>{formatCurrency(record.grossPay)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>
                        {formatCurrency(record.netPay)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.paymentStatus)}
                          label={record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)}
                          color={getStatusColor(record.paymentStatus)}
                          size="small"
                        />
                      </TableCell>
                     
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewRecord(record)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* View Payment Record Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Payment Record Details
            </Typography>
            <IconButton onClick={() => setViewDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                {/* Pay Period */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Pay Period
                  </Typography>
                  <Typography variant="body2">
                    {selectedRecord.payPeriod}
                  </Typography>
                </Grid>

                {/* Payment Status */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Payment Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedRecord.paymentStatus)}
                    label={selectedRecord.paymentStatus.charAt(0).toUpperCase() + selectedRecord.paymentStatus.slice(1)}
                    color={getStatusColor(selectedRecord.paymentStatus)}
                    size="small"
                  />
                </Grid>

                {/* Salary Breakdown */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Salary Breakdown
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Basic Salary
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#059669' }}>
                    {formatCurrency(selectedRecord.basicSalary)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Overtime
                  </Typography>
                  <Typography variant="body2">
                    {selectedRecord.overtime.hours} hrs × {formatCurrency(selectedRecord.overtime.rate)}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#3b82f6' }}>
                    {formatCurrency(selectedRecord.overtime.amount)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Gross Pay
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1e293b' }}>
                    {formatCurrency(selectedRecord.grossPay)}
                  </Typography>
                </Grid>

                {/* Bonuses */}
                {selectedRecord.bonuses && selectedRecord.bonuses.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Bonuses
                    </Typography>
                    {selectedRecord.bonuses.map((bonus, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{bonus.description}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                          {formatCurrency(bonus.amount)}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* Deductions */}
                {selectedRecord.deductions && selectedRecord.deductions.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Deductions
                    </Typography>
                    {selectedRecord.deductions.map((deduction, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{deduction.description}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#ef4444' }}>
                          -{formatCurrency(deduction.amount)}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* Net Pay */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Net Pay
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                      {formatCurrency(selectedRecord.netPay)}
                    </Typography>
                  </Box>
                </Grid>

                {/* Payment Information */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Payment Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Payment Method
                  </Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {selectedRecord.paymentMethod?.replace('_', ' ')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Payment Date
                  </Typography>
                  <Typography variant="body2">
                    {selectedRecord.paymentDate ? formatDate(selectedRecord.paymentDate) : 'Not yet paid'}
                  </Typography>
                </Grid>

                {/* Notes */}
                {selectedRecord.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Notes
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                      <Typography variant="body2">
                        {selectedRecord.notes}
                      </Typography>
                    </Paper>
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
    </Box>
  );
};

export default EmployeePayments;
