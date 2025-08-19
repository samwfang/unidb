import React, { useState } from 'react';
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
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold">Avg.</Text>
        <Tabs variant="soft-rounded" onChange={(index) => setActiveTab(index === 0 ? 'SAT' : 'ACT')}>
          <TabList>
            <Tab>SAT</Tab>
            <Tab>ACT</Tab>
          </TabList>
        </Tabs>
        <Text fontSize="lg" fontWeight="bold">Score:</Text>
      </Flex>

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
              {currentScore}
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill="#666" style={{ fontSize: '14px' }}>
              <tspan x="50%" dy="0">Out of</tspan>
              <tspan x="50%" dy="15">{maxScore}</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default TestScoresWidget;