import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { colors } from '../theme';

const ProgressRing = ({ 
  value = 0, 
  size = 120, 
  thickness = 6, 
  color = colors.primary.main,
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  label,
  unit = '%',
  showPercentage = true,
  children 
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background circle */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{
          color: backgroundColor,
          position: 'absolute',
        }}
      />
      
      {/* Progress circle */}
      <CircularProgress
        variant="determinate"
        value={normalizedValue}
        size={size}
        thickness={thickness}
        sx={{
          color: color,
          filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))',
          transition: 'all 0.3s ease-in-out',
        }}
      />
      
      {/* Center content */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
        {children || (
          <>
            {showPercentage && (
              <Typography
                variant="h4"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: colors.text.primary,
                  lineHeight: 1,
                }}
              >
                {Math.round(normalizedValue)}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ 
                    fontSize: '0.7em',
                    color: colors.text.secondary,
                  }}
                >
                  {unit}
                </Typography>
              </Typography>
            )}
            {label && (
              <Typography
                variant="caption"
                sx={{
                  color: colors.text.secondary,
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  mt: 0.5,
                }}
              >
                {label}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProgressRing;
