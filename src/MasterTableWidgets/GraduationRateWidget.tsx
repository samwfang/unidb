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

  const color = rate >= 80 ? '#489c4bff' : rate >= 50 ? '#FFC107' : '#F44336';

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

      <Box height="140px" position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              cornerRadius={10}  // Adds rounded edges
              paddingAngle={2}  // Small gap between slices
              dataKey="value"
            >
              <Cell fill={color} stroke={color} strokeWidth={1} />
              <Cell fill="#EDF2F7" stroke="#E2E8F0" strokeWidth={1} />
            </Pie>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                fill: color  // Match text color to gauge
              }}
            >
              {graduationRate}
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill="#666" style={{ fontSize: '14px' }}>
              <tspan x="50%" dy="0">Graduated Within</tspan>
              <tspan x="50%" dy="15">8 Years</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GraduationRateWidget;