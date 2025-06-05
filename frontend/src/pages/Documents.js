import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Cancel as RejectIcon,
    CloudUpload as UploadIcon,
    CheckCircle as VerifyIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { documentService, employeeService } from '../services/api';

// No mock data - fetch from database

// Document Preview Component
const DocumentPreview = ({ document }) => {
  if (!document || !document.fileUrl) {
    return (
      <Box
        sx={{
          height: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'grey.300'
        }}
      >
        <Typography color="text.secondary">No document available</Typography>
      </Box>
    );
  }

  const fileExtension = document.fileUrl.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);

  // Only show preview for images
  if (isImage) {
    return (
      <Box
        sx={{
          height: 400,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <img
          src={document.fileUrl}
          alt={document.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
      </Box>
    );
  }

  // For all non-image files, show professional download interface
  const getFileIcon = (ext) => {
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'txt':
        return '📃';
      case 'zip':
      case 'rar':
        return '🗜️';
      default:
        return '📎';
    }
  };

  const getFileTypeLabel = (ext) => {
    switch (ext) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint Presentation';
      case 'txt':
        return 'Text Document';
      case 'zip':
      case 'rar':
        return 'Archive File';
      default:
        return `${ext.toUpperCase()} File`;
    }
  };

  return (
    <Box
      sx={{
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
        gap: 3,
        p: 4
      }}
    >
      {/* File Icon */}
      <Box
        sx={{
          fontSize: '4rem',
          mb: 1
        }}
      >
        {getFileIcon(fileExtension)}
      </Box>

      {/* File Info */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {document.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getFileTypeLabel(fileExtension)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Click below to download and view this document
        </Typography>
      </Box>

      {/* Download Button */}
      <Button
        variant="contained"
        size="large"
        href={document.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<DownloadIcon />}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        Download Document
      </Button>

      {/* File Size Info (if available) */}
      <Typography variant="caption" color="text.secondary">
        Secure download from cloud storage
      </Typography>
    </Box>
  );
};

const Documents = () => {
  const { isAdmin } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'ID',
    file: null
  });

  // Filtering and Sorting State (Admin only)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    employee: 'all'
  });
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [employees, setEmployees] = useState([]);

  // Fetch documents and employees from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch documents
        const documentsResponse = await documentService.getAllDocuments();
        if (documentsResponse.data.success) {
          const formattedDocuments = documentsResponse.data.data.map(doc => ({
            id: doc._id,
            name: doc.name,
            type: doc.type,
            uploadDate: new Date(doc.createdAt).toISOString().split('T')[0],
            verificationStatus: doc.verificationStatus,
            fileUrl: doc.fileUrl,
            employeeName: doc.employee?.user?.name || 'Unknown',
            employeeId: doc.employee?.employeeId || 'N/A'
          }));
          setDocuments(formattedDocuments);
        }

        // Fetch employees for admin dropdown (only if admin)
        if (isAdmin) {
          try {
            const employeesResponse = await employeeService.getAllEmployees();
            if (employeesResponse.data.success) {
              const formattedEmployees = employeesResponse.data.data.map(emp => ({
                id: emp._id,
                name: emp.user?.name || 'Unknown',
                employeeId: emp.employeeId || 'N/A'
              }));
              setEmployees(formattedEmployees);
            }
          } catch (empError) {
            console.error('Error fetching employees:', empError);
            // Don't show error toast for employees as it's not critical
          }
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to fetch documents');
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setUploadForm({
      name: '',
      type: 'ID',
      file: null
    });
  };

  const handleOpenViewDialog = (document) => {
    setSelectedDocument(document);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedDocument(null);
  };

  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm({
      ...uploadForm,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setUploadForm({
      ...uploadForm,
      file: e.target.files[0]
    });
  };

  const handleUploadDocument = async () => {
    if (!uploadForm.file || !uploadForm.type) {
      toast.error('Please select a file and document type');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('type', uploadForm.type);
      if (uploadForm.name) {
        formData.append('name', uploadForm.name);
      }

      console.log('Uploading document:', {
        fileName: uploadForm.file.name,
        fileSize: uploadForm.file.size,
        type: uploadForm.type,
        name: uploadForm.name
      });

      // Call the actual API
      const response = await documentService.uploadDocument(formData);
      console.log('Upload response:', response);

      if (response.data.success) {
        const newDocument = {
          id: response.data.data._id,
          name: response.data.data.name,
          type: response.data.data.type,
          uploadDate: new Date(response.data.data.createdAt).toISOString().split('T')[0],
          verificationStatus: response.data.data.verificationStatus,
          fileUrl: response.data.data.fileUrl
        };

        setDocuments([...documents, newDocument]);
        setLoading(false);
        handleCloseUploadDialog();
        toast.success('Document uploaded successfully to Cloudinary!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      setLoading(false);
      console.error('Upload error:', error);

      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response.data);
        toast.error(`Upload failed: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check if backend is running.');
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        toast.error('Failed to upload document. Please try again.');
      }
    }
  };

  const handleVerifyDocument = async (id, status) => {
    try {
      const response = await documentService.updateDocumentStatus(id, status);

      if (response.data.success) {
        setDocuments(documents.map(doc =>
          doc.id === id ? { ...doc, verificationStatus: status } : doc
        ));
        toast.success(`Document ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast.error('Failed to update document status');
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await documentService.deleteDocument(id);

      if (response.data.success) {
        setDocuments(documents.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return <Chip label="Verified" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  // Filter and Sort Documents (Admin only)
  const getFilteredAndSortedDocuments = () => {
    if (!isAdmin) return documents;

    let filtered = documents.filter(doc => {
      const statusMatch = filters.status === 'all' || doc.verificationStatus === filters.status;
      const typeMatch = filters.type === 'all' || doc.type === filters.type;
      const employeeMatch = filters.employee === 'all' || doc.employeeName.toLowerCase().includes(filters.employee.toLowerCase());

      return statusMatch && typeMatch && employeeMatch;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'uploadDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredDocuments = getFilteredAndSortedDocuments();

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
            {isAdmin ? 'Document Management' : 'My Documents'}
          </Typography>
          {!isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenUploadDialog}
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
            >
              Upload Document
            </Button>
          )}
        </Box>

        {/* Admin Filters and Sorting */}
        {isAdmin && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Filter & Sort Documents
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Document Type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="ID">ID Document</MenuItem>
                  <MenuItem value="Resume">Resume</MenuItem>
                  <MenuItem value="Certificate">Certificate</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Employee"
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      '&:hover fieldset': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1e40af',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      '&.Mui-focused': {
                        color: '#1e40af',
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.name}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {employee.employeeId}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="small"
                >
                  <MenuItem value="uploadDate">Upload Date</MenuItem>
                  <MenuItem value="name">Document Name</MenuItem>
                  <MenuItem value="type">Document Type</MenuItem>
                  <MenuItem value="employeeName">Employee Name</MenuItem>
                  <MenuItem value="verificationStatus">Status</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setFilters({ status: 'all', type: 'all', employee: 'all' });
                  setSortBy('uploadDate');
                  setSortOrder('desc');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>
        )}

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
                <TableCell>Type</TableCell>
                {isAdmin && <TableCell>Employee</TableCell>}
                <TableCell>Upload Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center">
                    {isAdmin && (filters.status !== 'all' || filters.type !== 'all' || filters.employee !== 'all')
                      ? 'No documents match the current filters'
                      : (isAdmin ? 'No documents uploaded by employees yet.' : 'No documents found. Upload your first document!')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {doc.employeeName || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {doc.employeeId || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell>{doc.uploadDate}</TableCell>
                    <TableCell>{getStatusChip(doc.verificationStatus)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenViewDialog(doc)}
                        size="small"
                      >
                        <ViewIcon />
                      </IconButton>

                      {isAdmin && doc.verificationStatus === 'pending' && (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleVerifyDocument(doc.id, 'verified')}
                            size="small"
                          >
                            <VerifyIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                            size="small"
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}

                      <IconButton
                        color="error"
                        onClick={() => handleDeleteDocument(doc.id)}
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

      {/* Upload Document Dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(30, 41, 59, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: 3,
            px: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderBottom: '2px solid #1e293b'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <UploadIcon sx={{ color: '#1e293b', fontSize: '1.2rem' }} />
            Upload Document
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            {/* Document Name Field */}
            <TextField
              name="name"
              label="Document Name"
              fullWidth
              size="small"
              value={uploadForm.name}
              onChange={handleUploadFormChange}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  backgroundColor: '#f9fafb',
                  fontSize: '0.875rem',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e293b',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  '&.Mui-focused': {
                    color: '#1e293b',
                    fontWeight: 600,
                  },
                },
              }}
            />

            {/* Document Type Field */}
            <TextField
              name="type"
              label="Document Type"
              select
              fullWidth
              size="small"
              value={uploadForm.type}
              onChange={handleUploadFormChange}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  backgroundColor: '#f9fafb',
                  fontSize: '0.875rem',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e293b',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  '&.Mui-focused': {
                    color: '#1e293b',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <MenuItem value="ID">Identity Document</MenuItem>
              <MenuItem value="Certificate">Certificate</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Resume">Resume/CV</MenuItem>
              <MenuItem value="Other">Other Document</MenuItem>
            </TextField>

            {/* File Upload Section */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Select File
              </Typography>

              <Box
                sx={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#1e293b',
                    backgroundColor: '#f1f5f9',
                  },
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />

                {!uploadForm.file ? (
                  <Box>
                    <UploadIcon
                      sx={{
                        fontSize: 36,
                        color: '#64748b',
                        mb: 1.5
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#374151',
                        fontWeight: 600,
                        mb: 0.5
                      }}
                    >
                      Choose a file
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748b',
                        mb: 1.5,
                        display: 'block'
                      }}
                    >
                      PDF, DOC, DOCX, JPG, PNG, TXT
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        px: 2,
                        py: 0.5,
                        borderColor: '#1e293b',
                        color: '#1e293b',
                        '&:hover': {
                          borderColor: '#0f172a',
                          backgroundColor: 'rgba(30, 41, 59, 0.05)',
                        },
                      }}
                    >
                      Browse
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        border: '1px solid #e5e7eb',
                        mb: 2
                      }}
                    >
                      <UploadIcon sx={{ color: '#10b981', fontSize: 24 }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: '#374151',
                            fontWeight: 600
                          }}
                        >
                          {uploadForm.file.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#64748b' }}
                        >
                          {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="text"
                      onClick={() => setUploadForm({ ...uploadForm, file: null })}
                      sx={{
                        color: '#ef4444',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        },
                      }}
                    >
                      Remove File
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            pt: 0,
            gap: 1.5,
            justifyContent: 'flex-end'
          }}
        >
          <Button
            onClick={handleCloseUploadDialog}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              px: 2.5,
              py: 0.75,
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            size="small"
            disabled={!uploadForm.name || !uploadForm.file || loading}
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              px: 3,
              py: 0.75,
              backgroundColor: '#1e293b',
              '&:hover': {
                backgroundColor: '#0f172a',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                <span>Uploading...</span>
              </Box>
            ) : (
              'Upload Document'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(30, 41, 59, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: 3,
            px: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderBottom: '2px solid #1e293b'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ViewIcon sx={{ color: '#1e293b', fontSize: '1.2rem' }} />
            Document Details
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedDocument && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedDocument.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {selectedDocument.type}
                </Typography>
                {isAdmin && (
                  <Typography variant="body2" color="text.secondary">
                    Employee: {selectedDocument.employeeName} (ID: {selectedDocument.employeeId})
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Uploaded on: {selectedDocument.uploadDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {selectedDocument.verificationStatus}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <DocumentPreview document={selectedDocument} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 0,
            gap: 1.5,
            justifyContent: 'flex-end'
          }}
        >
          {selectedDocument && selectedDocument.fileUrl && (
            <Button
              variant="contained"
              href={selectedDocument.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Download
            </Button>
          )}
          <Button
            onClick={handleCloseViewDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderColor: '#e5e7eb',
              color: '#64748b',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Documents;
