import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { LockOutlined as LockIcon } from '@mui/icons-material';

const Unauthorized = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <LockIcon color="error" sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          You do not have permission to access this page. This area is restricted to authorized personnel only.
        </Typography>
        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
          color="primary"
          size="large"
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
