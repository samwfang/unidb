import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GraduationRateWidgetProps {
  graduationRate: string;
}

const GraduationRateWidget: React.FC<GraduationRateWidgetProps> = ({ graduationRate }) => {
  const rate = parseFloat(graduationRate) || 0;
  const remaining = 100 - rate;
  
  const data = [
    { name: 'Graduated', value: rate },
    { name: 'Remaining', value: remaining }
  ];

  const color = rate >= 80 ? '#5cc960ff' : rate >= 50 ? '#FFC107' : '#F44336';

  return (
    <Box 
      p={4} 
      borderWidth={1} 
      borderRadius="md" 
      minHeight="120px"
      bg="rgba(255, 255, 255, 0.2)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      border="1px solid rgba(255, 255, 255, 0.2)"
    >
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Graduation Rate:</Text>
      
      <Box height="120px" position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="#E0E0E0" />
            </Pie>
            <text 
              x="50%" 
              y="70%" 
              textAnchor="middle" 
              style={{ fontSize: '32px', fontWeight: 'bold' }}
            >
              {graduationRate}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GraduationRateWidget;