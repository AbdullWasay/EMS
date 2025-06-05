import {
    Add as AddIcon,
    Close as CloseIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { memo, useCallback } from 'react';

// Create/Edit Dialog Component - moved outside to prevent re-creation
const CreateEditDialog = memo(({
  open,
  onClose,
  isEdit = false,
  formData,
  setFormData,
  employees,
  handleCreateRecord,
  handleUpdateRecord,
  addBonus,
  removeBonus,
  updateBonus,
  addDeduction,
  removeDeduction,
  updateDeduction
}) => {

  // Memoized event handlers to prevent re-creation
  const handleBasicSalaryChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, basicSalary: e.target.value }));
  }, [setFormData]);

  const handlePaymentMethodChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, paymentMethod: e.target.value }));
  }, [setFormData]);

  const handleOvertimeHoursChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      overtime: { ...prev.overtime, hours: e.target.value }
    }));
  }, [setFormData]);

  const handleOvertimeRateChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      overtime: { ...prev.overtime, rate: e.target.value }
    }));
  }, [setFormData]);

  const handleNotesChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }));
  }, [setFormData]);

  const handleEmployeeChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, employeeId: e.target.value }));
  }, [setFormData]);

  const handleWeekStartDateChange = useCallback((date) => {
    setFormData(prev => ({ ...prev, weekStartDate: date }));
  }, [setFormData]);

  const handleWeekEndDateChange = useCallback((date) => {
    setFormData(prev => ({ ...prev, weekEndDate: date }));
  }, [setFormData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Payment Record' : 'Create Payment Record'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            {/* Employee Selection (only for create) */}
            {!isEdit && (
              <Grid item xs={12}>
                <FormControl fullWidth required sx={{ mb: 1 }}>
                  <InputLabel>Select Employee *</InputLabel>
                  <Select
                    value={formData.employeeId}
                    label="Select Employee *"
                    onChange={handleEmployeeChange}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          width: 'auto',
                          minWidth: 400,
                        },
                      },
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        minHeight: '56px',
                        display: 'flex',
                        alignItems: 'center',
                      },
                    }}
                  >
                    {employees.map((employee) => (
                      <MenuItem
                        key={employee._id}
                        value={employee._id}
                        sx={{
                          py: 1.5,
                          px: 2,
                          minHeight: 'auto',
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                        }}
                      >
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {employee.user?.name || 'Unknown Employee'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {employee.employeeId} • {employee.user?.department || 'No Department'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Week Period Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                Pay Period
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Week Start Date *"
                value={formData.weekStartDate}
                onChange={handleWeekStartDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Week End Date *"
                value={formData.weekEndDate}
                onChange={handleWeekEndDateChange}
                renderInput={(params) => <TextField {...params} fullWidth required />}
                disabled={isEdit}
              />
            </Grid>

            {/* Salary Information Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#374151' }}>
                Salary Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Basic Salary *"
                type="number"
                value={formData.basicSalary}
                onChange={handleBasicSalaryChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>

            {/* Payment Method */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  label="Payment Method"
                  onChange={handlePaymentMethodChange}
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Overtime Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#374151' }}>
                Overtime Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Overtime Hours"
                type="number"
                value={formData.overtime.hours}
                onChange={handleOvertimeHoursChange}
                inputProps={{ step: "0.5", min: "0" }}
                placeholder="0.0"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Overtime Rate (per hour)"
                type="number"
                value={formData.overtime.rate}
                onChange={handleOvertimeRateChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total Overtime Amount"
                type="number"
                value={(parseFloat(formData.overtime.hours) || 0) * (parseFloat(formData.overtime.rate) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true
                }}
                sx={{
                  backgroundColor: '#f8fafc',
                  '& .MuiInputBase-input': {
                    fontWeight: 600,
                    color: '#059669'
                  }
                }}
              />
            </Grid>

            {/* Bonuses Section */}
            <Grid item xs={12}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                mt: 3,
                pt: 2,
                borderTop: '1px solid #e5e7eb'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                  Bonuses
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addBonus}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: '#f0fdf4'
                    }
                  }}
                >
                  Add Bonus
                </Button>
              </Box>
              {formData.bonuses.length === 0 && (
                <Box sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  borderRadius: 1,
                  border: '1px dashed #d1d5db'
                }}>
                  <Typography variant="body2" color="textSecondary">
                    No bonuses added. Click "Add Bonus" to include bonus payments.
                  </Typography>
                </Box>
              )}
              {formData.bonuses.map((bonus, index) => (
                <Box key={index} sx={{
                  mb: 2,
                  p: 3,
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Bonus Description"
                        value={bonus.description}
                        onChange={(e) => updateBonus(index, 'description', e.target.value)}
                        placeholder="e.g., Performance bonus, Holiday bonus"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={bonus.amount}
                        onChange={(e) => updateBonus(index, 'amount', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        placeholder="0.00"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          color="error"
                          onClick={() => removeBonus(index)}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: '#fee2e2'
                            }
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            {/* Deductions Section */}
            <Grid item xs={12}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                mt: 3,
                pt: 2,
                borderTop: '1px solid #e5e7eb'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                  Deductions
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addDeduction}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#ef4444',
                    color: '#ef4444',
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: '#fef2f2'
                    }
                  }}
                >
                  Add Deduction
                </Button>
              </Box>
              {formData.deductions.length === 0 && (
                <Box sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  borderRadius: 1,
                  border: '1px dashed #d1d5db'
                }}>
                  <Typography variant="body2" color="textSecondary">
                    No deductions added. Click "Add Deduction" to include deductions from salary.
                  </Typography>
                </Box>
              )}
              {formData.deductions.map((deduction, index) => (
                <Box key={index} sx={{
                  mb: 2,
                  p: 3,
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  backgroundColor: '#fafafa'
                }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Deduction Description"
                        value={deduction.description}
                        onChange={(e) => updateDeduction(index, 'description', e.target.value)}
                        placeholder="e.g., Tax, Insurance, Loan repayment"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={deduction.amount}
                        onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        placeholder="0.00"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          color="error"
                          onClick={() => removeDeduction(index)}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: '#fee2e2'
                            }
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            {/* Notes Section */}
            <Grid item xs={12}>
              <Box sx={{
                mt: 3,
                pt: 2,
                borderTop: '1px solid #e5e7eb'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChange={handleNotesChange}
                  placeholder="Add any additional notes, comments, or special instructions for this payment record..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa'
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        gap: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#d1d5db',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: '#f3f4f6'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={isEdit ? handleUpdateRecord : handleCreateRecord}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 6px 8px -1px rgba(16, 185, 129, 0.4)',
            }
          }}
        >
          {isEdit ? 'Update Payment Record' : 'Create Payment Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

// View Dialog Component - also moved outside to prevent re-creation
const ViewDialog = memo(({
  viewDialog,
  setViewDialog,
  selectedRecord,
  formatCurrency,
  formatDate
}) => (
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
              {/* Employee Info */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Employee Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedRecord.employee?.user?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Employee ID:</strong> {selectedRecord.employee?.employeeId || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {selectedRecord.employee?.user?.department || 'N/A'}
                  </Typography>
                </Paper>
              </Grid>

              {/* Pay Period */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Pay Period
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedRecord.weekStartDate)} - {formatDate(selectedRecord.weekEndDate)}
                </Typography>
              </Grid>

              {/* Payment Status */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Payment Status
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {selectedRecord.paymentStatus}
                </Typography>
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
));

// Main PaymentRecordDialogs Component
const PaymentRecordDialogs = memo(({
  openDialog,
  setOpenDialog,
  editDialog,
  setEditDialog,
  viewDialog,
  setViewDialog,
  formData,
  setFormData,
  selectedRecord,
  employees,
  handleCreateRecord,
  handleUpdateRecord,
  addBonus,
  removeBonus,
  updateBonus,
  addDeduction,
  removeDeduction,
  updateDeduction,
  resetForm,
  formatCurrency,
  formatDate
}) => {

  // Memoized close handlers to prevent re-creation
  const handleCreateDialogClose = useCallback(() => {
    setOpenDialog(false);
    resetForm();
  }, [setOpenDialog, resetForm]);

  const handleEditDialogClose = useCallback(() => {
    setEditDialog(false);
    resetForm();
  }, [setEditDialog, resetForm]);

  return (
    <>
      {/* Create Dialog */}
      <CreateEditDialog
        open={openDialog}
        onClose={handleCreateDialogClose}
        isEdit={false}
        formData={formData}
        setFormData={setFormData}
        employees={employees}
        handleCreateRecord={handleCreateRecord}
        handleUpdateRecord={handleUpdateRecord}
        addBonus={addBonus}
        removeBonus={removeBonus}
        updateBonus={updateBonus}
        addDeduction={addDeduction}
        removeDeduction={removeDeduction}
        updateDeduction={updateDeduction}
      />

      {/* Edit Dialog */}
      <CreateEditDialog
        open={editDialog}
        onClose={handleEditDialogClose}
        isEdit={true}
        formData={formData}
        setFormData={setFormData}
        employees={employees}
        handleCreateRecord={handleCreateRecord}
        handleUpdateRecord={handleUpdateRecord}
        addBonus={addBonus}
        removeBonus={removeBonus}
        updateBonus={updateBonus}
        addDeduction={addDeduction}
        removeDeduction={removeDeduction}
        updateDeduction={updateDeduction}
      />

      {/* View Dialog */}
      <ViewDialog
        viewDialog={viewDialog}
        setViewDialog={setViewDialog}
        selectedRecord={selectedRecord}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </>
  );
});

export default PaymentRecordDialogs;
