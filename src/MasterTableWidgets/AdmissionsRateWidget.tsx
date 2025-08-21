import React, { useEffect, useState } from 'react';
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


  // DYNAMICALLY ADJUST PIE CHART SIZE ACCORDING TO WINDOW HEIGHT (SINCE RECHARTS DOESNT SUPPORT THIS GRRR)
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  
    useEffect(() => {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    // Responsive radius based on window width
    const getRadius = () => {
      if (windowSize.width < 480) return { inner: 40, outer: 55 };
      if (windowSize.width < 1000) return { inner: 50, outer: 65 };
      return { inner: 60, outer: 80 };
    };
  
    const { inner, outer } = getRadius();

  return (
    <Box
      p={{ base: 2, md: 4 }}
      borderWidth={1}
      borderRadius="md"
      minHeight="120px"
      bg="rgba(255, 255, 255, 0.2)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      height="100%"
    >
      <Text fontSize={{base: "sm", sm: "md", lg: "lg"}} fontWeight="bold" mb={2}>Admissions Rate:</Text>

      <Box height={{base: "100px", md: "140px"}} position="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={inner}
              outerRadius={outer}
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
                fontSize: 'clamp(16px, 3.5vw, 28px)',
                fontWeight: 'bold',
                fill: color
              }}
            >
              {admissionsRate}%
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill="#666" style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}>
              <tspan x="50%" dy="0">Of Applicants</tspan>
              <tspan x="50%" dy="12">Admitted</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default AdmissionsRateWidget;