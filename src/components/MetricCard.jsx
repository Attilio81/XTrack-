import React from 'react';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { colors, commonStyles } from '../theme';

const MetricCard = ({
  title,
  value,
  subtitle = null,
  unit = '',
  icon: Icon,
  trend = null, // 'up', 'down', 'flat', or null
  trendValue = null,
  gradient = false,
  color = colors.primary.main,
  onClick,
  ...props
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: '#4CAF50', fontSize: 16 }} />;
      case 'down':
        return <TrendingDown sx={{ color: '#F44336', fontSize: 16 }} />;
      case 'flat':
        return <TrendingFlat sx={{ color: colors.text.secondary, fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#4CAF50';
      case 'down':
        return '#F44336';
      case 'flat':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const cardStyle = gradient 
    ? commonStyles.gradientCard 
    : commonStyles.metricCard;

  return (
    <Card
      sx={{
        ...cardStyle,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          ...cardStyle['&:hover'],
          ...(onClick && {
            cursor: 'pointer',
          }),
        },
      }}
      onClick={onClick}
      {...props}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          {Icon && (
            <Box
              sx={{
                ...commonStyles.iconContainer,
                backgroundColor: gradient 
                  ? 'rgba(0, 0, 0, 0.1)' 
                  : 'rgba(255, 215, 0, 0.1)',
              }}
            >
              <Icon 
                sx={{ 
                  fontSize: 28, 
                  color: gradient ? '#000' : color 
                }} 
              />
            </Box>
          )}

          {/* Value */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: gradient ? '#000' : colors.text.primary,
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {value}
              {unit && (
                <Typography
                  component="span"
                  variant="body1"
                  sx={{
                    fontSize: '0.6em',
                    color: gradient ? 'rgba(0, 0, 0, 0.7)' : colors.text.secondary,
                    ml: 0.5,
                  }}
                >
                  {unit}
                </Typography>
              )}
            </Typography>            {/* Title */}
            <Typography
              variant="body2"
              sx={{
                color: gradient ? 'rgba(0, 0, 0, 0.8)' : colors.text.secondary,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: gradient ? 'rgba(0, 0, 0, 0.6)' : colors.text.secondary,
                  fontSize: '0.75rem',
                  mt: -0.5,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Trend */}
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                backgroundColor: gradient 
                  ? 'rgba(0, 0, 0, 0.1)' 
                  : 'rgba(255, 215, 0, 0.1)',
                borderRadius: 2,
                px: 1,
                py: 0.5,
              }}
            >
              {getTrendIcon()}
              {trendValue && (
                <Typography
                  variant="caption"
                  sx={{
                    color: getTrendColor(),
                    fontWeight: 600,
                  }}
                >
                  {trendValue}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
