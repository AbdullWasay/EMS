import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';

// Validation schema
const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required')
});

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // In a real app, you would call an API to update the profile
      // For now, we'll just simulate a successful update
      setTimeout(() => {
        setSuccess(true);
        setError(null);
        toast.success('Profile updated successfully!');
        setSubmitting(false);
      }, 1000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          mb: 3
        }}>
          <Avatar
            sx={{
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              mr: { xs: 0, sm: 2 },
              alignSelf: { xs: 'center', sm: 'flex-start' }
            }}
            alt={user.name}
            src="/static/images/avatar/1.jpg"
          />
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant={{ xs: 'h5', sm: 'h4' }} gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.role === 'admin' ? 'Administrator' : `${user.department} - ${user.position}`}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>

        <Formik
          initialValues={{
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            department: user.department || '',
            position: user.position || ''
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Full Name"
                    fullWidth
                    variant="outlined"
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
                    variant="outlined"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="phoneNumber"
                    label="Phone Number"
                    fullWidth
                    variant="outlined"
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
                    variant="outlined"
                    error={touched.address && Boolean(errors.address)}
                    helperText={touched.address && errors.address}
                  />
                </Grid>
                {user.role === 'employee' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="department"
                        label="Department"
                        fullWidth
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="position"
                        label="Position"
                        fullWidth
                        variant="outlined"
                        disabled
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    sx={{ mt: 2 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Update Profile'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Profile;
