import {
    Logout as CheckOutIcon,
    Delete as DeleteIcon,
    MyLocation as LocationIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
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
import { employeeService, locationService } from '../services/api';

// No mock data - fetch from database

const Locations = () => {
  const { isAdmin } = useContext(AuthContext);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentLocationId, setCurrentLocationId] = useState(null);

  // Filtering and Sorting State (Admin only)
  const [filters, setFilters] = useState({
    status: 'all',
    employee: 'all'
  });
  const [sortBy, setSortBy] = useState('checkInTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [employees, setEmployees] = useState([]);

  // Fetch locations and employees function
  const fetchLocations = async () => {
    try {
      const response = await locationService.getAllLocations();
      if (response.data.success) {
        const formattedLocations = response.data.data.map(loc => ({
          id: loc._id,
          latitude: loc.latitude, // Keep for Google Maps but don't display
          longitude: loc.longitude, // Keep for Google Maps but don't display
          address: loc.address,
          checkInTime: new Date(loc.checkInTime).toLocaleString(),
          checkOutTime: loc.checkOutTime ? new Date(loc.checkOutTime).toLocaleString() : null,
          status: loc.status,
          employeeName: loc.employee?.user?.name || 'Unknown',
          employeeId: loc.employee?.employeeId || 'N/A'
        }));
        setLocations(formattedLocations);

        // Check if current user (employee) is checked in
        if (!isAdmin) {
          const currentUserCheckedIn = formattedLocations.find(loc => loc.status === 'checked-in');
          if (currentUserCheckedIn) {
            setIsCheckedIn(true);
            setCurrentLocationId(currentUserCheckedIn.id);
          } else {
            setIsCheckedIn(false);
            setCurrentLocationId(null);
          }
        }
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
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [isAdmin]);

  const handleInstantCheckIn = () => {
    setLocationError(null);
    setLoading(true);

    // Get current location with high accuracy and check in immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          // Get address from coordinates using reverse geocoding
          let address;
          try {
            // Using a simple reverse geocoding service
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
            );
            const data = await response.json();

            if (data && data.display_name) {
              address = data.display_name;
            } else {
              address = `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
            }
          } catch (error) {
            // Fallback to coordinates if geocoding fails
            address = `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
          }

          // Immediately check in without confirmation
          await handleCheckIn(location, address);
        },
        (error) => {
          let errorMessage = 'Unable to get your location. ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          setLocationError(errorMessage);
          setLoading(false);
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      const errorMessage = 'Geolocation is not supported by this browser. Please use a modern browser.';
      setLocationError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    }
  };



  const handleCheckIn = async (location, addressText) => {
    if (!location) {
      toast.error('Location not available. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Get device and IP information
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      };

      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: addressText,
        device: `${deviceInfo.platform} - ${deviceInfo.userAgent.split(' ')[0]}`,
        accuracy: location.accuracy
      };

      console.log('Checking in with location data:', locationData);

      const response = await locationService.checkIn(locationData);

      if (response.data.success) {
        // Update state immediately
        setIsCheckedIn(true);
        setCurrentLocationId(response.data.data._id);

        // Refresh locations list
        await fetchLocations();

        // Show single success notification
        toast.success(' Checked in successfully!');

        // Start continuous location tracking
        startLiveLocationTracking(response.data.data._id);

        // Notify other components (like Dashboard) about location status change
        window.dispatchEvent(new CustomEvent('locationStatusChanged'));
        localStorage.setItem('locationStatusChanged', Date.now().toString());
      } else {
        throw new Error('Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);

      if (error.response) {
        toast.error(`Check-in failed: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        toast.error('No response from server. Please check if backend is running.');
      } else {
        toast.error('Failed to check in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      setLoading(true);

      const response = await locationService.checkOut(id);

      if (response.data.success) {
        // Update state immediately
        setIsCheckedIn(false);
        setCurrentLocationId(null);

        // Refresh locations list
        await fetchLocations();

        // Show single success notification
        toast.success('Successfully checked out! ');

        // Stop live location tracking
        stopLiveLocationTracking();

        // Notify other components (like Dashboard) about location status change
        window.dispatchEvent(new CustomEvent('locationStatusChanged'));
        localStorage.setItem('locationStatusChanged', Date.now().toString());
      } else {
        throw new Error('Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);

      if (error.response) {
        toast.error(`Check-out failed: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        toast.error('No response from server. Please check if backend is running.');
      } else {
        toast.error('Failed to check out. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Live location tracking functions
  const [watchId, setWatchId] = useState(null);
  const [activeLocationId, setActiveLocationId] = useState(null);

  const startLiveLocationTracking = (locationId) => {
    if (navigator.geolocation && !watchId) {
      setActiveLocationId(locationId);

      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          console.log('Live location update:', newLocation);

          // Send real-time location update to server
          try {
            await locationService.updateLiveLocation(locationId, newLocation);
            console.log('Location updated on server');
          } catch (error) {
            console.error('Failed to update location on server:', error);
          }
        },
        (error) => {
          console.error('Live location tracking error:', error);
          toast.error('Location tracking error. Please check your GPS settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000 // 30 seconds
        }
      );

      setWatchId(id);
      console.log('🔴 Live location tracking started for location:', locationId);
    }
  };

  const stopLiveLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setActiveLocationId(null);
      console.log('🔴 Live location tracking stopped');
    }
  };

  // Clean up location tracking on component unmount
  useEffect(() => {
    return () => {
      stopLiveLocationTracking();
    };
  }, [watchId]);

  const handleDeleteLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
    toast.success('Location record deleted successfully!');
  };

  // Handle viewing live location on Google Maps
  const handleViewLiveLocation = (location) => {
    const { latitude, longitude, employeeName, employeeId } = location;

    // Create Google Maps URL with the employee's location (high zoom for precise location)
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=19&t=h`;

    // Open Google Maps in a new tab
    window.open(googleMapsUrl, '_blank');

    // Show success message with employee info
    toast.success(`📍 Viewing ${employeeName}'s live location on Google Maps`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    console.log('📍 Google Maps opened for employee:', {
      name: employeeName,
      id: employeeId,
      coordinates: `${latitude}, ${longitude}`,
      mapsUrl: googleMapsUrl,
      timestamp: new Date().toISOString()
    });
  };

  const getStatusChip = (status) => {
    return status === 'checked-in'
      ? <Chip
          label="Checked In"
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: '#dcfce7', // Light green background
            color: '#166534', // Dark green text
            border: '1px solid #bbf7d0', // Light green border
            '&:hover': {
              backgroundColor: '#bbf7d0', // Slightly darker on hover
            }
          }}
        />
      : <Chip
          label="Checked Out"
          size="small"
          sx={{
            fontWeight: 500,
            backgroundColor: '#f1f5f9', // Light gray background
            color: '#64748b', // Gray text
            border: '1px solid #e2e8f0' // Light gray border
          }}
        />;
  };

  // Filter and Sort Locations (Admin only)
  const getFilteredAndSortedLocations = () => {
    if (!isAdmin) return locations;

    let filtered = locations.filter(loc => {
      const statusMatch = filters.status === 'all' || loc.status === filters.status;
      const employeeMatch = filters.employee === 'all' || loc.employeeName.toLowerCase().includes(filters.employee.toLowerCase());

      return statusMatch && employeeMatch;
    });

    // Sort locations
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (sortBy === 'checkInTime' || sortBy === 'checkOutTime') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
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

  const filteredLocations = getFilteredAndSortedLocations();

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
            Location Tracking
          </Typography>
          {!isAdmin && (
            <>
              {!isCheckedIn ? (
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <LocationIcon />}
                  onClick={handleInstantCheckIn}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    alignSelf: { xs: 'stretch', sm: 'auto' },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(52, 211, 153, 0.3)',
                    },
                    '&:disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {loading ? 'Checking In...' : '📍 Check In'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <CheckOutIcon />}
                  onClick={() => handleCheckOut(currentLocationId)}
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    alignSelf: { xs: 'stretch', sm: 'auto' },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    },
                    '&:disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {loading ? 'Checking Out...' : '🔴 Check Out'}
                </Button>
              )}
            </>
          )}
        </Box>

        {locationError && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
            <Typography color="error">{locationError}</Typography>
          </Paper>
        )}

        {!isAdmin && locations.some(loc => loc.status === 'checked-in') && (
          <Card sx={{ mb: 3, bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                You are currently checked in
              </Typography>
              <Typography variant="body2">
                Don't forget to check out at the end of your work day.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Admin Filters and Sorting */}
        {isAdmin && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Filter & Sort Locations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  size="small"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="checked-in">Checked In</MenuItem>
                  <MenuItem value="checked-out">Checked Out</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  size="small"
                >
                  <MenuItem value="checkInTime">Check In Time</MenuItem>
                  <MenuItem value="checkOutTime">Check Out Time</MenuItem>
                  <MenuItem value="employeeName">Employee Name</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
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
                  setFilters({ status: 'all', employee: 'all' });
                  setSortBy('checkInTime');
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
                {isAdmin && <TableCell>Employee</TableCell>}
                {isAdmin && <TableCell>Location</TableCell>}
                <TableCell>Check In Time</TableCell>
                <TableCell>Check Out Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 4} align="center">
                    {isAdmin && (filters.status !== 'all' || filters.employee !== 'all')
                      ? 'No locations match the current filters'
                      : 'No location records found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((loc) => (
                  <TableRow key={loc.id}>
                    {isAdmin && (
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {loc.employeeName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            ID: {loc.employeeId}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {loc.address}
                          </Typography>
                          {/* Location Icon for Direct Google Maps Access */}
                          {loc.status === 'checked-in' && (
                            <IconButton
                              color="primary"
                              onClick={() => handleViewLiveLocation(loc)}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                              title="View Live Location on Google Maps"
                            >
                              <LocationIcon sx={{ color: '#3b82f6' }} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    )}
                    <TableCell>{loc.checkInTime}</TableCell>
                    <TableCell>{loc.checkOutTime || 'Not checked out yet'}</TableCell>
                    <TableCell>{getStatusChip(loc.status)}</TableCell>
                    <TableCell align="right">
                      {/* Employee Actions */}
                      {!isAdmin && loc.status === 'checked-in' && (
                        <IconButton
                          color="primary"
                          onClick={() => handleCheckOut(loc.id)}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            },
                          }}
                        >
                          <CheckOutIcon />
                        </IconButton>
                      )}

                      {/* Admin Actions */}
                      {isAdmin && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteLocation(loc.id)}
                          size="small"
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            },
                          }}
                          title="Delete Location Record"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>


    </Container>
  );
};

export default Locations;
