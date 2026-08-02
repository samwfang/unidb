import React, { useState } from 'react';
import { Box, Text, Tabs, TabList, Tab, Flex, useColorMode } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import PercentileBar from 'src/ReusableComponents/PercentileBar';
import WidgetBox from 'src/containers/WidgetBox';
import { useResponsive } from 'src/containers/useResponsive';
import DataInfoPopover from 'src/ReusableComponents/DataInfoPopover';
import { useGlobalStats } from 'src/helpers/useGlobalStats';

interface TestScoresProps {
  satScore?: string;
  actScore?: string;
  universityName?: string;
  satScorePercentile: string;
  actScorePercentile: string;
}

const TestScoresWidget: React.FC<TestScoresProps> = ({ satScore, actScore, universityName,
  satScorePercentile, actScorePercentile }) => {
  const [activeTab, setActiveTab] = useState<'SAT' | 'ACT'>('SAT');

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Parse scores or use defaults
  const sat = parseInt((satScore || '0').replace(/,/g, '')) || 0;
  const act = parseInt((actScore || '0').replace(/,/g, '')) || 0;
  const hasSatData = satScore !== 'No Data' && satScore !== '';
  const hasActData = actScore !== 'No Data' && actScore !== '';

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
    { threshold: .60, color: '#E15759' },    // Red
    { threshold: .70, color: '#F28E2B' },    // Orange
    { threshold: .75, color: '#EDC949' },    // Yellow
    { threshold: .80, color: '#59A14F' },    // Green
    { threshold: .85, color: '#4E79A7' },    // Blue
    { threshold: .95, color: '#7D6EC8' },    // Blue-purple
    { threshold: Infinity, color: '#9B59B6' } // Purple
  ];

  // Find the first threshold that matches
  const { color } = colorThresholds.find(({ threshold }) => percentile <= threshold) ||
    { color: '#F44336' };


  const { chartRadius } = useResponsive();
  const { inner, outer } = chartRadius;
  const globalStats = useGlobalStats();


  return (
    <WidgetBox
      p={{ base: 2, md: 4 }}
      height="100%"
      position="relative"
    >
      <Flex alignItems="center" justifyContent="space-between" mb={1}>
        <Tabs variant="soft-rounded" onChange={(index) => setActiveTab(index === 0 ? 'SAT' : 'ACT')}>
          <TabList>
            <Tab fontSize={{ base: "xs", md: "xs" }}
              px={{ base: 2, md: 4 }}
              py={{ base: 1, md: 2 }}>SAT</Tab>
            <Tab fontSize={{ base: "xs", md: "xs" }}
              px={{ base: 2, md: 4 }}
              py={{ base: 1, md: 2 }}>ACT</Tab>
          </TabList>
        </Tabs>
      </Flex>


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
              <Cell fill={color} stroke={isDark ? 'rgba(20,24,36,0.5)' : 'white'} strokeWidth={1} />
              <Cell fill={isDark ? 'rgba(255,255,255,0.06)' : '#EDF2F7'} stroke={isDark ? 'rgba(20,24,36,0.5)' : 'white'} strokeWidth={1} />
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
              {(activeTab === 'SAT' ? hasSatData : hasActData) ? currentScore : 'N/A'}
            </text>
            <text x="50%" y="80%" textAnchor="middle" fill={isDark ? "#d1d5db" : "#4b5563"} style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}>
              <tspan x="50%" dy="0">Avg. Score</tspan>
              <tspan x="50%" dy="12">Out of {maxScore}</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={2}>
        <PercentileBar
          value={activeTab === "SAT" 
            ? (hasSatData ? parseFloat(satScorePercentile) || 0 : 0)
            : (hasActData ? parseFloat(actScorePercentile) || 0 : 0)}
          name={universityName}
          type={activeTab === "SAT" ? "SAT Score" : "ACT Score"}
          globalAvg={globalStats && (activeTab === "SAT"
            ? globalStats.undergrad.satScore
            : globalStats.undergrad.actScore)}
        />
      </Box>

      <DataInfoPopover />
    </WidgetBox>
  );
};

export default TestScoresWidget;