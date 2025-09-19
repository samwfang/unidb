import React, { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import PercentileBar from 'src/helpers/PercentileBar';

interface GraduationRateWidgetProps {
  universityName: string;
  graduationRate: string;
  graduationRatePercentile: string;
}

const GraduationRateWidget: React.FC<GraduationRateWidgetProps> = ({ universityName, graduationRate, graduationRatePercentile }) => {
  const rate = parseFloat(graduationRate) || 0;
  const remaining = 100 - rate;

  const data = [
    { name: 'Graduated', value: rate },
    { name: 'Remaining', value: remaining }
  ];

  const colorThresholds = [
    { threshold: 30, color: '#f10c0cff' },
    { threshold: 50, color: '#fca800' },
    { threshold: 70, color: '#fcd200' },
    { threshold: 80, color: '#10a508ff' },
    { threshold: 90, color: '#0b5f1fff' },
    { threshold: 95, color: '#1b6abeff' },
    { threshold: Infinity, color: '#613ed2ff' }
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
      bg="white"
      border="1px solid rgba(255, 255, 255, 0.2)"
      height="100%"
    >
      <Text fontSize={{base: "sm", sm: "md",  lg: "lg"}} fontWeight="bold" mb={2}>Graduation Rate</Text>

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
              cornerRadius={5}  // Adds rounded edges
              paddingAngle={5}  // Small gap between slices
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
                fill: color  // Match text color to gauge
              }}
            >
              {graduationRate}%
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill="#666" style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}>
              <tspan x="50%" dy="0">Graduated Within</tspan>
              <tspan x="50%" dy="12">6 Years</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={2}>
        <PercentileBar 
          value={parseFloat(graduationRatePercentile)} 
          name={universityName} 
          type="Graduation Rate" 
        />
      </Box>

    </Box>
  );
};

export default GraduationRateWidget;