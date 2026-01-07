import React, { useEffect, useState } from 'react';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import PercentileBar from 'src/ReusableComponents/PercentileBar';
import GlassBox from 'src/containers/GlassBox';
import WidgetBox from 'src/containers/WidgetBox';

interface AdmissionsRateProps {
  universityName: string;
  admissionsRate: string;
  admissionsRatePercentile: string;
}

const AdmissionsRateWidget: React.FC<AdmissionsRateProps> = ({ universityName, admissionsRate, admissionsRatePercentile }) => {
  const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

  const rate = parseFloat(admissionsRate) || 0;
  const remaining = 100 - rate;

  const data = [
    { name: 'Admitted', value: rate },
    { name: 'Not Admitted', value: remaining }
  ];

  const colorThresholds = [
    { threshold: 15, color: '#9B59B6' },    // Purple
    { threshold: 25, color: '#7D6EC8' },    // Blue-purple
    { threshold: 50, color: '#4E79A7' },    // Blue
    { threshold: 75, color: '#59A14F' },    // Green
    { threshold: Infinity, color: '#b1b1b1ff' } // Red
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
    <WidgetBox
      p={{ base: 2, md: 4 }}
      height="100%"
      position="relative"
    >
      <Text fontSize={{ base: "sm", sm: "md", lg: "lg" }} fontWeight="bold" mb={2}>Admissions Rate</Text>

      <Box height={{ base: "100px", md: "140px" }} position="relative">
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
              cornerRadius={5}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill={color} stroke={"white"} strokeWidth={1} />
              <Cell fill="#EDF2F7" stroke={"white"} strokeWidth={1} />
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
            <text x="50%" y="80%" textAnchor="middle" fill={isDark ? "#d1d5db" : "#4b5563"} style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}>
              <tspan x="50%" dy="0">Of Applicants</tspan>
              <tspan x="50%" dy="12">Admitted</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={2}>
        <PercentileBar
          value={parseFloat(admissionsRatePercentile)}
          name={universityName}
          type="Admissions Rate"
          colorScheme="positive_only_inverted"
        />
      </Box>

    </WidgetBox>
  );
};

export default AdmissionsRateWidget;