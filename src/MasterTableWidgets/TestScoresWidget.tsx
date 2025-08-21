import React, { useEffect, useState } from 'react';
import { Box, Text, Tabs, TabList, Tab, Flex } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TestScoresProps {
  satScore?: string;
  actScore?: string;
}

const TestScoresWidget: React.FC<TestScoresProps> = ({ satScore, actScore }) => {
  const [activeTab, setActiveTab] = useState<'SAT' | 'ACT'>('SAT');

  // Parse scores or use defaults
  const sat = parseInt(satScore || '0') || 0;
  const act = parseInt(actScore || '0') || 0;

  const maxSat = 1600;
  const maxAct = 36;

  const currentScore = activeTab === 'SAT' ? sat : act;
  const maxScore = activeTab === 'SAT' ? maxSat : maxAct;
  const remaining = maxScore - currentScore;



  const data = [
    { name: 'Score', value: currentScore },
    { name: 'Remaining', value: remaining }
  ];

  // Color based on percentile of max score
  const percentile = currentScore / maxScore;
  const colorThresholds = [
    { threshold: .60, color: '#f10c0cff' },
    { threshold: .70, color: '#fca800' },
    { threshold: .75, color: '#fcd200' },
    { threshold: .80, color: '#10a508ff' },
    { threshold: .85, color: '#0b5f1fff' },
    { threshold: .95, color: '#1b6abeff' },
    { threshold: Infinity, color: '#613ed2ff' }
  ];

  // Find the first threshold that matches
  const { color } = colorThresholds.find(({ threshold }) => percentile <= threshold) ||
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
    if (windowSize.width < 768) return { inner: 50, outer: 65 };
    return { inner: 70, outer: 90 };
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
      <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold" mb={2}>Test Scores: </Text>


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
                fontSize: 'clamp(16px, 3.5vw, 32px)',
                fontWeight: 'bold',
                fill: color
              }}
            >
              {currentScore}
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill="#666" style={{ fontSize: 'clamp(8px, 1.5vw, 14px)' }}>
              <tspan x="50%" dy="0">Avg. Score</tspan>
              <tspan x="50%" dy="15">Out of {maxScore}</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Flex alignItems="center" justifyContent="space-between" mb={2}>
        <Tabs variant="soft-rounded" onChange={(index) => setActiveTab(index === 0 ? 'SAT' : 'ACT')}>
          <TabList>
            <Tab fontSize={{ base: "xs", md: "sm" }}
              px={{ base: 2, md: 4 }}
              py={{ base: 1, md: 2 }}>SAT</Tab>
            <Tab fontSize={{ base: "xs", md: "sm" }}
              px={{ base: 2, md: 4 }}
              py={{ base: 1, md: 2 }}>ACT</Tab>
          </TabList>
        </Tabs>
      </Flex>
    </Box>
  );
};

export default TestScoresWidget;