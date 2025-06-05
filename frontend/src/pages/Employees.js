import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { employeeService } from '../services/api';

// No mock data - fetch from database

// Validation schema for adding employee (with password)
const AddEmployeeSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  department: Yup.string().required('Department is required'),
  position: Yup.string().required('Position is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required')
});

// Validation schema for editing employee (with optional password)
const EditEmployeeSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  department: Yup.string().required('Department is required'),
  position: Yup.string().required('Position is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  status: Yup.string().required('Status is required'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').nullable()
});

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch employees from database
  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAllEmployees();
      if (response.data.success) {
        const formattedEmployees = response.data.data.map(emp => ({
          id: emp._id,
          name: emp.user?.name || 'N/A',
          email: emp.user?.email || 'N/A',
          department: emp.user?.department || 'N/A',
          position: emp.user?.position || 'N/A',
          phoneNumber: emp.user?.phoneNumber || 'N/A',
          address: emp.user?.address || 'N/A',
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : 'N/A',
          status: emp.status || 'active'
        }));
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenViewDialog = (employee) => {
    setSelectedEmployee(employee);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedEmployee(null);
  };

  const handleOpenEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedEmployee(null);
  };

  const handleAddEmployee = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);

    try {
      const response = await employeeService.createEmployee(values);

      if (response.data.success) {
        await fetchEmployees(); // Refresh the employee list
        setLoading(false);
        resetForm();
        handleCloseAddDialog();
        toast.success('Employee added successfully!');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error adding employee:', error);
      toast.error(error.response?.data?.error || 'Failed to add employee');
    }
  };

  const handleEditEmployee = async (values, { setSubmitting }) => {
    setLoading(true);

    try {
      // Separate password reset from employee update
      const { newPassword, ...employeeData } = values;

      // Update employee data
      const response = await employeeService.updateEmployee(selectedEmployee.id, employeeData);

      if (response.data.success) {
        // If password is provided, reset it separately
        if (newPassword && newPassword.trim() !== '') {
          try {
            await employeeService.resetEmployeePassword(selectedEmployee.id, newPassword);
            toast.success('Employee updated and password reset successfully!');
          } catch (passwordError) {
            console.error('Error resetting password:', passwordError);
            toast.warning('Employee updated but password reset failed');
          }
        } else {
          toast.success('Employee updated successfully!');
        }

        await fetchEmployees(); // Refresh the employee list
        setLoading(false);
        handleCloseEditDialog();
      }
    } catch (error) {
      setLoading(false);
      console.error('Error updating employee:', error);
      toast.error(error.response?.data?.error || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await employeeService.deleteEmployee(id);

      if (response.data.success) {
        await fetchEmployees(); // Refresh the employee list
        toast.success('Employee deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.error || 'Failed to delete employee');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'inactive':
        return <Chip label="Inactive" color="default" size="small" />;
      case 'on leave':
        return <Chip label="On Leave" color="warning" size="small" />;
      case 'terminated':
        return <Chip label="Terminated" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          mb: 3
        }}>
          <Typography variant="h5" component="h1">
            Employee Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Add Employee
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 300, sm: 650 }
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No employees found. Add your first employee!
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>{getStatusChip(emp.status)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenViewDialog(emp)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenEditDialog(emp)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteEmployee(emp.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Employee Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            department: '',
            position: '',
            phoneNumber: '',
            address: ''
          }}
          validationSchema={AddEmployeeSchema}
          onSubmit={handleAddEmployee}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="name"
                      label="Full Name"
                      fullWidth
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="email"
                      label="Email Address"
                      fullWidth
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="password"
                      label="Password"
                      type="password"
                      fullWidth
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="department"
                      label="Department"
                      fullWidth
                      error={touched.department && Boolean(errors.department)}
                      helperText={touched.department && errors.department}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="position"
                      label="Position"
                      fullWidth
                      error={touched.position && Boolean(errors.position)}
                      helperText={touched.position && errors.position}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="phoneNumber"
                      label="Phone Number"
                      fullWidth
                      error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                      helperText={touched.phoneNumber && errors.phoneNumber}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      name="address"
                      label="Address"
                      fullWidth
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAddDialog}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Add Employee'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}
                >
                  {selectedEmployee.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedEmployee.name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedEmployee.department} - {selectedEmployee.position}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{selectedEmployee.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>{selectedEmployee.phoneNumber}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography>{selectedEmployee.address}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Joining Date
                  </Typography>
                  <Typography>{selectedEmployee.joiningDate}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  {getStatusChip(selectedEmployee.status)}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              handleCloseViewDialog();
              handleOpenEditDialog(selectedEmployee);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Employee</DialogTitle>
        {selectedEmployee && (
          <Formik
            initialValues={{
              name: selectedEmployee.name || '',
              email: selectedEmployee.email || '',
              department: selectedEmployee.department || '',
              position: selectedEmployee.position || '',
              phoneNumber: selectedEmployee.phoneNumber || '',
              address: selectedEmployee.address || '',
              status: selectedEmployee.status || 'active',
              newPassword: ''
            }}
            validationSchema={EditEmployeeSchema}
            onSubmit={handleEditEmployee}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="name"
                        label="Full Name"
                        fullWidth
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="email"
                        label="Email Address"
                        fullWidth
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="department"
                        label="Department"
                        fullWidth
                        error={touched.department && Boolean(errors.department)}
                        helperText={touched.department && errors.department}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="position"
                        label="Position"
                        fullWidth
                        error={touched.position && Boolean(errors.position)}
                        helperText={touched.position && errors.position}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
                        error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="address"
                        label="Address"
                        fullWidth
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="status"
                        label="Status"
                        select
                        fullWidth
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="on leave">On Leave</MenuItem>
                        <MenuItem value="terminated">Terminated</MenuItem>
                      </Field>
                    </Grid>

                    {/* Password Reset Section */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Password Reset (Optional)
                        </Typography>
                      </Divider>
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="newPassword"
                        label="New Password"
                        type="password"
                        fullWidth
                        error={touched.newPassword && Boolean(errors.newPassword)}
                        helperText={(touched.newPassword && errors.newPassword) || "Leave empty to keep current password"}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            '&:hover fieldset': {
                              borderColor: '#3b82f6',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1e40af',
                              borderWidth: '2px',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            '&.Mui-focused': {
                              color: '#1e40af',
                              fontWeight: 600,
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseEditDialog}>Cancel</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Employee'}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </Dialog>
    </Container>
  );
};

export default Employees;
