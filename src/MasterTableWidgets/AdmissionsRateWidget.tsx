import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AdmissionsRateProps {
  admissionsRate: string;
}

const AdmissionsRateWidget: React.FC<AdmissionsRateProps> = ({ admissionsRate }) => {
  const rate = parseFloat(admissionsRate) || 0;
  const remaining = 100 - rate;

  const data = [
    { name: 'Admitted', value: rate },
    { name: 'Not Admitted', value: remaining }
  ];

  const colorThresholds = [
    { threshold: 15, color: '#613ed2ff' }, 
    { threshold: 25, color: '#1b6abeff' }, 
    { threshold: 50, color: '#0b5f1fff' },    
    { threshold: 75, color: '#10a508ff' },
    { threshold: Infinity, color: '#424342ff' }
  ];

  // Find the first threshold that matches
  const { color } = colorThresholds.find(({ threshold }) => rate <= threshold) ||
    { color: '#F44336' };


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
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Admissions Rate:</Text>

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
              cornerRadius={10}
              paddingAngle={2}
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
                fill: color
              }}
            >
              {admissionsRate}%
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill="#666" style={{ fontSize: '14px' }}>
              <tspan x="50%" dy="0">Of Applicants</tspan>
              <tspan x="50%" dy="15">Admitted</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default AdmissionsRateWidget;