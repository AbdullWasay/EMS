import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  Help as HelpIcon,
  LocationOn as LocationIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const drawerWidth = 280;

const AdminLayout = ({ children }) => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      color: '#3b82f6'
    },
    ...(isAdmin ? [{
      text: 'Employees',
      icon: <PeopleIcon />,
      path: '/employees',
      color: '#8b5cf6'
    }] : []),
    {
      text: 'Documents',
      icon: <DocumentIcon />,
      path: '/documents',
      color: '#10b981'
    },
    {
      text: 'Locations',
      icon: <LocationIcon />,
      path: '/locations',
      color: '#f59e0b'
    },
    {
      text: 'Help Center',
      icon: <HelpIcon />,
      path: '/help-center',
      color: '#ef4444'
    },
    ...(isAdmin ? [{
      text: 'Payment Records',
      icon: <PaymentIcon />,
      path: '/payment-records',
      color: '#10b981'
    }] : [{
      text: 'My Payments',
      icon: <PaymentIcon />,
      path: '/my-payments',
      color: '#10b981'
    }])
  ];

  const profileItems = [
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
      color: '#6b7280'
    }
  ];

  const isActive = (path) => location.pathname === path;

  // Drawer content component
  const drawerContent = (
    <>
      {/* Logo Section */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            fontSize: '1.1rem'
          }}
        >
          DELIVERWORX LTD
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#94a3b8',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.7rem'
          }}
        >
          FINAL MILE EXPERTS
        </Typography>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: '#3b82f6',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1.2
              }}
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={isAdmin ? 'Administrator' : 'Employee'}
          size="small"
          sx={{
            backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: isAdmin ? '#fca5a5' : '#93c5fd',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            border: `1px solid ${isAdmin ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography
          variant="overline"
          sx={{
            px: 3,
            color: '#94a3b8',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.05em'
          }}
        >
          Main Menu
        </Typography>
        <Box>
          <List sx={{ px: 2, mt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  backgroundColor: isActive(item.path) ? alpha(item.color, 0.2) : 'transparent',
                  border: isActive(item.path) ? `1px solid ${alpha(item.color, 0.4)}` : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: alpha(item.color, 0.1),
                    border: `1px solid ${alpha(item.color, 0.2)}`
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? item.color : '#94a3b8',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive(item.path) ? 600 : 500,
                      color: isActive(item.path) ? '#ffffff' : '#e2e8f0',
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          </List>
        </Box>

        <Box>
          <Divider sx={{ mx: 3, my: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Typography
            variant="overline"
            sx={{
              px: 3,
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.05em'
            }}
          >
            Account
          </Typography>
          <List sx={{ px: 2, mt: 1 }}>
          {profileItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive(item.path) ? alpha(item.color, 0.1) : 'transparent',
                  border: isActive(item.path) ? `1px solid ${alpha(item.color, 0.2)}` : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: alpha(item.color, 0.05),
                    border: `1px solid ${alpha(item.color, 0.1)}`
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? item.color : '#94a3b8',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive(item.path) ? 600 : 500,
                      color: isActive(item.path) ? '#ffffff' : '#e2e8f0',
                      fontSize: '0.95rem'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ mb: 0.3 }}>
            <ListItemButton
              onClick={() => {
                handleLogout();
                if (isMobile) handleDrawerToggle();
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: alpha('#ef4444', 0.05),
                  border: `1px solid ${alpha('#ef4444', 0.1)}`
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#f87171',
                  minWidth: 40
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    color: '#f87171',
                    fontSize: '0.95rem'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
          </List>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.5)',
                },
              },
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.5)',
                },
              },
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            color: '#1e293b'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Mobile Hamburger Menu */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    color: '#1e293b',
                    '&:hover': { backgroundColor: alpha('#1e293b', 0.1) }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}
                >
                  {menuItems.find(item => isActive(item.path))?.text ||
                   profileItems.find(item => isActive(item.path))?.text ||
                   'Dashboard'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.8rem'
                  }}
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleMenu}
                sx={{
                  color: '#6b7280',
                  '&:hover': { backgroundColor: alpha('#6b7280', 0.1) }
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            p: isMobile ? 2 : 3,
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f5f9',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cbd5e1',
              borderRadius: '4px',
              '&:hover': {
                background: '#94a3b8',
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
