import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Description as DocumentIcon,
  LocationOn as LocationIcon,
  Pending as PendingIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography
} from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { documentService, employeeService, locationService } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0,
    totalLocations: 0
  });
  const [loading, setLoading] = useState(true);
  const [checkInStatus, setCheckInStatus] = useState({
    isCheckedIn: false,
    checkInTime: null,
    currentLocation: null
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Fetch admin dashboard data
        const [employeesRes, documentsRes, locationsRes] = await Promise.all([
          employeeService.getAllEmployees(),
          documentService.getAllDocuments(),
          locationService.getAllLocations()
        ]);

        const documents = documentsRes.data.data || [];
        const pendingDocs = documents.filter(doc => doc.verificationStatus === 'pending').length;
        const verifiedDocs = documents.filter(doc => doc.verificationStatus === 'verified').length;
        const rejectedDocs = documents.filter(doc => doc.verificationStatus === 'rejected').length;

        setStats({
          totalEmployees: employeesRes.data.count || 0,
          totalDocuments: documents.length,
          pendingDocuments: pendingDocs,
          verifiedDocuments: verifiedDocs,
          rejectedDocuments: rejectedDocs,
          totalLocations: locationsRes.data.count || 0
        });
      } else {
        // Fetch employee dashboard data
        const [documentsRes, locationsRes] = await Promise.all([
          documentService.getAllDocuments(),
          locationService.getAllLocations()
        ]);

        const documents = documentsRes.data.data || [];
        const pendingDocs = documents.filter(doc => doc.verificationStatus === 'pending').length;
        const verifiedDocs = documents.filter(doc => doc.verificationStatus === 'verified').length;
        const rejectedDocs = documents.filter(doc => doc.verificationStatus === 'rejected').length;

        // Check if employee is currently checked in
        const locations = locationsRes.data.data || [];
        const currentCheckIn = locations.find(loc =>
          loc.employee && loc.employee._id === user.id && loc.checkOutTime === null
        );

        setCheckInStatus({
          isCheckedIn: !!currentCheckIn,
          checkInTime: currentCheckIn?.checkInTime || null,
          currentLocation: currentCheckIn?.address || null
        });

        setStats({
          totalEmployees: 0,
          totalDocuments: documents.length,
          pendingDocuments: pendingDocs,
          verifiedDocuments: verifiedDocs,
          rejectedDocuments: rejectedDocs,
          totalLocations: locationsRes.data.count || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for location status changes
  useEffect(() => {
    const handleLocationStatusChange = () => {
      console.log('Location status changed, refreshing dashboard...');
      fetchDashboardData();
    };

    // Listen for custom location status change events
    window.addEventListener('locationStatusChanged', handleLocationStatusChange);

    // Listen for storage changes (for cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'locationStatusChanged') {
        handleLocationStatusChange();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('locationStatusChanged', handleLocationStatusChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      sx={{
        height: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: color,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.25rem' }}>
              {loading ? '...' : value}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, action }) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: color,
        }
      }}
      onClick={action}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: color,
            color: '#ffffff',
            width: 56,
            height: 56,
            mx: 'auto',
            mb: 2
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={{ xs: 'h5', sm: 'h4' }}
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            mb: 1,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          {isAdmin ? 'Here\'s what\'s happening with your team today.' : 'Here\'s your personal dashboard overview.'}
        </Typography>
      </Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
          {isAdmin && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees}
                icon={<PeopleIcon />}
                color="#1e40af"
                subtitle="Active staff members"
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments}
              icon={<DocumentIcon />}
              color="#059669"
              subtitle={isAdmin ? "All documents" : "My documents"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Review"
              value={stats.pendingDocuments}
              icon={<PendingIcon />}
              color="#d97706"
              subtitle="Awaiting approval"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Verified Documents"
              value={stats.verifiedDocuments}
              icon={<CheckCircleIcon />}
              color="#16a34a"
              subtitle="Approved documents"
            />
          </Grid>

        </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: '#1e293b',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
            {isAdmin ? (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="Manage Employees"
                    description="Add, edit, or remove employee records"
                    icon={<PeopleIcon />}
                    color="#1e40af"
                    action={() => window.location.href = '/employees'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="Review Documents"
                    description="Verify and approve employee documents"
                    icon={<DocumentIcon />}
                    color="#059669"
                    action={() => window.location.href = '/documents'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <QuickActionCard
                    title="Location Tracking"
                    description="Monitor employee locations and check-ins"
                    icon={<LocationIcon />}
                    color="#d97706"
                    action={() => window.location.href = '/locations'}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Upload Documents"
                    description="Submit your documents for verification"
                    icon={<DocumentIcon />}
                    color="#059669"
                    action={() => window.location.href = '/documents'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title={checkInStatus.isCheckedIn ? "Check Out" : "Check In"}
                    description={checkInStatus.isCheckedIn ? "End your work session" : "Start your work session"}
                    icon={<LocationIcon />}
                    color={checkInStatus.isCheckedIn ? "#dc2626" : "#34d399"}
                    action={() => window.location.href = '/locations'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="My Profile"
                    description="View and update your profile information"
                    icon={<BusinessIcon />}
                    color="#1e40af"
                    action={() => window.location.href = '/profile'}
                  />
                </Grid>
              </>
            )}
        </Grid>
      </Box>


    </Box>
  );
};

export default Dashboard;
