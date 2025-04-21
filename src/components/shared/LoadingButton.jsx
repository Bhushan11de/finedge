import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const LoadingButton = ({ loading, children, ...props }) => {
  return (
    <Button
      disabled={loading}
      {...props}
      sx={{
        position: 'relative',
        ...props.sx
      }}
    >
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
      {children}
    </Button>
  );
};

export default LoadingButton; 