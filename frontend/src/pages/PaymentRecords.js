import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Payment as PaymentIcon,
    Person as PersonIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PaymentRecordDialogs from '../components/PaymentRecordDialogs';
import { AuthContext } from '../context/AuthContext';
import { employeeService, paymentRecordsService } from '../services/api';

const PaymentRecords = () => {
  const { isAdmin } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    employeeId: '',
    startDate: null,
    endDate: null
  });

  // Form state for new/edit payment record
  const [formData, setFormData] = useState({
    employeeId: '',
    weekStartDate: null,
    weekEndDate: null,
    basicSalary: '',
    overtime: {
      hours: '',
      rate: '',
      amount: ''
    },
    bonuses: [],
    deductions: [],
    paymentMethod: 'bank_transfer',
    notes: ''
  });

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();

      const response = await paymentRecordsService.getAllRecords(params);
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payment records:', error);
      toast.error('Failed to fetch payment records');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await employeeService.getAllEmployees();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin, fetchEmployees]);

  // Define resetForm first since it's used by other functions
  const resetForm = useCallback(() => {
    setFormData({
      employeeId: '',
      weekStartDate: null,
      weekEndDate: null,
      basicSalary: '',
      overtime: {
        hours: '',
        rate: '',
        amount: ''
      },
      bonuses: [],
      deductions: [],
      paymentMethod: 'bank_transfer',
      notes: ''
    });
  }, []);

  const handleCreateRecord = useCallback(async () => {
    try {
      if (!formData.employeeId || !formData.weekStartDate || !formData.weekEndDate || !formData.basicSalary) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Calculate overtime amount
      const overtimeAmount = (parseFloat(formData.overtime.hours) || 0) * (parseFloat(formData.overtime.rate) || 0);

      const recordData = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary),
        overtime: {
          hours: parseFloat(formData.overtime.hours) || 0,
          rate: parseFloat(formData.overtime.rate) || 0,
          amount: overtimeAmount
        },
        bonuses: formData.bonuses.map(bonus => ({
          ...bonus,
          amount: parseFloat(bonus.amount)
        })),
        deductions: formData.deductions.map(deduction => ({
          ...deduction,
          amount: parseFloat(deduction.amount)
        }))
      };

      await paymentRecordsService.createRecord(recordData);
      toast.success('Payment record created successfully!');
      setOpenDialog(false);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Error creating payment record:', error);
      toast.error(error.response?.data?.error || 'Failed to create payment record');
    }
  }, [formData, resetForm, fetchRecords]);

  const handleUpdateRecord = useCallback(async () => {
    try {
      if (!formData.basicSalary) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Calculate overtime amount
      const overtimeAmount = (parseFloat(formData.overtime.hours) || 0) * (parseFloat(formData.overtime.rate) || 0);

      const recordData = {
        basicSalary: parseFloat(formData.basicSalary),
        overtime: {
          hours: parseFloat(formData.overtime.hours) || 0,
          rate: parseFloat(formData.overtime.rate) || 0,
          amount: overtimeAmount
        },
        bonuses: formData.bonuses.map(bonus => ({
          ...bonus,
          amount: parseFloat(bonus.amount)
        })),
        deductions: formData.deductions.map(deduction => ({
          ...deduction,
          amount: parseFloat(deduction.amount)
        })),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      await paymentRecordsService.updateRecord(selectedRecord._id, recordData);
      toast.success('Payment record updated successfully!');
      setEditDialog(false);
      setSelectedRecord(null);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Error updating payment record:', error);
      toast.error('Failed to update payment record');
    }
  }, [formData, selectedRecord, resetForm, fetchRecords]);

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentRecordsService.deleteRecord(recordId);
        toast.success('Payment record deleted successfully!');
        fetchRecords();
      } catch (error) {
        console.error('Error deleting payment record:', error);
        toast.error('Failed to delete payment record');
      }
    }
  };

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      await paymentRecordsService.updateRecord(recordId, { paymentStatus: newStatus });
      toast.success('Payment status updated successfully!');
      fetchRecords();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const openStatusDialog = (record) => {
    setSelectedRecord(record);
    setStatusUpdate(record.paymentStatus);
    setStatusDialog(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedRecord || !statusUpdate) return;

    try {
      await paymentRecordsService.updateRecord(selectedRecord._id, { paymentStatus: statusUpdate });
      toast.success('Payment status updated successfully!');
      setStatusDialog(false);
      setSelectedRecord(null);
      setStatusUpdate('');
      fetchRecords();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const openEditDialog = useCallback((record) => {
    setSelectedRecord(record);
    setFormData({
      employeeId: record.employee._id,
      weekStartDate: new Date(record.weekStartDate),
      weekEndDate: new Date(record.weekEndDate),
      basicSalary: record.basicSalary.toString(),
      overtime: {
        hours: record.overtime.hours.toString(),
        rate: record.overtime.rate.toString(),
        amount: record.overtime.amount.toString()
      },
      bonuses: record.bonuses || [],
      deductions: record.deductions || [],
      paymentMethod: record.paymentMethod,
      notes: record.notes || ''
    });
    setEditDialog(true);
  }, []);

  const addBonus = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      bonuses: [...prev.bonuses, { description: '', amount: '' }]
    }));
  }, []);

  const removeBonus = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter((_, i) => i !== index)
    }));
  }, []);

  const updateBonus = useCallback((index, field, value) => {
    setFormData(prev => {
      const newBonuses = [...prev.bonuses];
      newBonuses[index][field] = value;
      return { ...prev, bonuses: newBonuses };
    });
  }, []);

  const addDeduction = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { description: '', amount: '' }]
    }));
  }, []);

  const removeDeduction = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  }, []);

  const updateDeduction = useCallback((index, field, value) => {
    setFormData(prev => {
      const newDeductions = [...prev.deductions];
      newDeductions[index][field] = value;
      return { ...prev, deductions: newDeductions };
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
              <PaymentIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Payment Records
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                }
              }}
            >
              Add Payment Record
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {isAdmin && (
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={filters.employeeId}
                      label="Employee"
                      onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {employee.user?.name} ({employee.employeeId})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} sm={3}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Records Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Pay Period</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Basic Salary</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Gross Pay</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Net Pay</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                        <Typography>Loading payment records...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                        <Typography color="textSecondary">No payment records found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record._id} hover>
                        {isAdmin && (
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ bgcolor: '#3b82f6', mr: 1, width: 32, height: 32 }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {record.employee?.user?.name || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  ID: {record.employee?.employeeId || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatDate(record.weekStartDate)} - {formatDate(record.weekEndDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                            {formatCurrency(record.basicSalary)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                            {formatCurrency(record.grossPay)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {formatCurrency(record.netPay)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.paymentStatus.toUpperCase()}
                            color={getStatusColor(record.paymentStatus)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setViewDialog(true);
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            {isAdmin && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => openEditDialog(record)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Update Status">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => openStatusDialog(record)}
                                  >
                                    <PaymentIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteRecord(record._id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Payment Record Dialogs */}
        <PaymentRecordDialogs
          openDialog={openDialog}
          setOpenDialog={setOpenDialog}
          editDialog={editDialog}
          setEditDialog={setEditDialog}
          viewDialog={viewDialog}
          setViewDialog={setViewDialog}
          formData={formData}
          setFormData={setFormData}
          selectedRecord={selectedRecord}
          employees={employees}
          handleCreateRecord={handleCreateRecord}
          handleUpdateRecord={handleUpdateRecord}
          addBonus={addBonus}
          removeBonus={removeBonus}
          updateBonus={updateBonus}
          addDeduction={addDeduction}
          removeDeduction={removeDeduction}
          updateDeduction={updateDeduction}
          resetForm={resetForm}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* Status Update Dialog */}
        {statusDialog && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300
            }}
            onClick={() => setStatusDialog(false)}
          >
            <Card
              sx={{
                p: 3,
                minWidth: 400,
                maxWidth: 500,
                mx: 2
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Update Payment Status
              </Typography>

              {selectedRecord && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Employee: {selectedRecord.employee?.user?.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Pay Period: {formatDate(selectedRecord.weekStartDate)} - {formatDate(selectedRecord.weekEndDate)}
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={statusUpdate}
                      label="Payment Status"
                      onChange={(e) => setStatusUpdate(e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setStatusDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStatusUpdate}
                  disabled={!statusUpdate}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    }
                  }}
                >
                  Update Status
                </Button>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default PaymentRecords;
