import {
    Business as BusinessIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { Form, Formik } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await login(values);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(30, 41, 59, 0.08), 0 8px 16px rgba(30, 41, 59, 0.04)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1e293b 0%, #3b82f6 50%, #8b5cf6 100%)',
            }
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 3, mt: 1 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                boxShadow: '0 8px 24px rgba(30, 41, 59, 0.25)',
                border: '2px solid rgba(255, 255, 255, 0.9)'
              }}
            >
              <BusinessIcon sx={{ fontSize: 28, color: '#ffffff' }} />
            </Avatar>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                mb: 0.5,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                letterSpacing: '-0.025em',
                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.3rem', sm: '1.5rem' },
                lineHeight: 1.2
              }}
            >
              Delivero Worx
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontWeight: 500,
                mb: 1,
                letterSpacing: '0.025em',
                fontSize: '0.9rem'
              }}
            >
              Employee Management System
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 2,
                backgroundColor: '#3b82f6',
                borderRadius: 1,
                mx: 'auto',
                mb: 2
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontWeight: 500
              }}
            >
              Welcome back! Please sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626'
              }}
            >
              {error}
            </Alert>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
              <Form>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    name="email"
                    label="Email Address"
                    fullWidth
                    variant="outlined"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: '#f8fafc',
                        height: '48px',
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
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1e293b',
                        fontWeight: 600,
                      },
                      '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                        marginTop: '6px',
                      },
                    }}
                  />

                  <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{
                              color: '#64748b',
                              '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6'
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: '#f8fafc',
                        height: '48px',
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
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1e293b',
                        fontWeight: 600,
                      },
                      '& .MuiFormHelperText-root': {
                        marginLeft: 0,
                        marginTop: '6px',
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    mt: 3,
                    mb: 1.5,
                    py: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(30, 41, 59, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
                      boxShadow: '0 8px 24px rgba(30, 41, 59, 0.35)',
                      transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      background: '#e5e7eb',
                      color: '#9ca3af',
                      boxShadow: 'none',
                      transform: 'none'
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={22} sx={{ color: '#ffffff' }} />
                      <span>Signing In...</span>
                    </Box>
                  ) : (
                    'Sign In to Delivero Worx'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Contact your administrator for account access
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
