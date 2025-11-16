import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface StatisticsCardProps {
  title: string;
  value: number;
  active?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  active,
  icon,
  color = 'primary',
}) => {
  const percentage = active !== undefined && value > 0 
    ? Math.round((active / value) * 100) 
    : 100;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        
        {active !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              label={`${active} actifs`}
              color={percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'default'}
            />
            <Typography variant="caption" color="text.secondary">
              {percentage}% actifs
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;
