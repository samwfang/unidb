import React from 'react';
import { Box, Text, Popover, PopoverTrigger, PopoverContent, PopoverBody, Flex, useColorMode } from '@chakra-ui/react';
import { Cell, Pie, PieChart } from 'recharts';


const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};


interface PercentileBarProps {
  value: number;
  colorScheme?: 'default' | 'inverted' | 'positive_only' | 'positive_only_inverted';
  name?: string;
  type?: string;
  globalAvg?: string;
}


const colorSchemes = {
  default: [
    { threshold: 30, color: '#E15759' },    // Muted red
    { threshold: 50, color: '#F28E2B' },    // Muted orange
    { threshold: 70, color: '#EDC949' },    // Muted yellow
    { threshold: 80, color: '#59A14F' },    // Muted green
    { threshold: 90, color: '#4E79A7' },    // Muted blue
    { threshold: 95, color: '#7D6EC8' },    // Blue-purple transition
    { threshold: Infinity, color: '#9B59B6' } // More vibrant purple
  ],
  inverted: [
    { threshold: 30, color: '#9B59B6' },    // More vibrant purple
    { threshold: 50, color: '#7D6EC8' },    // Blue-purple transition
    { threshold: 70, color: '#4E79A7' },    // Muted blue
    { threshold: 80, color: '#59A14F' },    // Muted green
    { threshold: 90, color: '#EDC949' },    // Muted yellow
    { threshold: 95, color: '#F28E2B' },    // Muted orange
    { threshold: Infinity, color: '#E15759' } // Muted red
  ],
  positive_only: [
    { threshold: 25, color: '#8C8C8C' },    // Muted gray
    { threshold: 50, color: '#59A14F' },    // Muted green
    { threshold: 75, color: '#4E79A7' },    // Muted blue
    { threshold: 90, color: '#7D6EC8' },    // Blue-purple transition
    { threshold: Infinity, color: '#9B59B6' } // More vibrant purple
  ],
  positive_only_inverted: [
    { threshold: 15, color: '#9B59B6' },    // More vibrant purple
    { threshold: 25, color: '#7D6EC8' },    // Blue-purple transition
    { threshold: 50, color: '#4E79A7' },    // Muted blue
    { threshold: 75, color: '#59A14F' },    // Muted green
    { threshold: Infinity, color: '#8C8C8C' } // Muted gray
  ]
};


const RADIAN = Math.PI / 180;


const Needle: React.FC<{
  value: number;
  cx: number;
  cy: number;
  iR: number;
  oR: number;
  color: string;
}> = ({ value, cx, cy, iR, oR, color }) => {
  const total = 100; // Fixed total for percentile
  const ang = 180.0 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 3;
  const x0 = cx + 5;
  const y0 = cy + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />
      <path
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="none"
        fill={color}
      />
    </g>
  );
};



const PercentileBar: React.FC<PercentileBarProps> = ({ value, colorScheme = 'default', name = "This university", type = "score", globalAvg = "No Data"}) => {


  const thresholds = colorSchemes[colorScheme];
  const barColor = thresholds.find(({ threshold }) => value <= threshold)?.color || thresholds[thresholds.length - 1].color;

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  // Create chart data based on the selected color scheme
  const chartData = thresholds.map((threshold, index) => {
    const prevThreshold = index === 0 ? 0 : thresholds[index - 1].threshold;
    const sectorValue = threshold.threshold === Infinity ? 100 - prevThreshold : threshold.threshold - prevThreshold;

    return {
      name: `sector-${index}`,
      value: sectorValue,
      color: threshold.color,
      max: threshold.threshold
    };
  });


  const textPosition = value > 30 ? 'outside' : 'inside';
  const textColor = isDark ? "white" : textPosition === 'outside' ? 'white' : barColor;
  const textOffset = '8px';

  // Mini chart dimensions
  const chartWidth = 100;
  const chartHeight = 50;
  const cx = chartWidth / 2;
  const cy = chartHeight - 10;
  const iR = 15;
  const oR = 25;

  const ordinalSuffix = getOrdinalSuffix(value);


  return (
    <Popover trigger="hover" placement="top">
      <PopoverTrigger>
        <Box width="100%" maxW="120px" mx="auto" mt={2} position="relative" cursor="pointer">
          <Box width="100%" height="20px" bg={isDark ? "gray.500" : "gray.200"} borderRadius="full" position="relative" overflow="hidden">
            <Box
              width={`${value}%`}
              height="100%"
              bg={barColor}
              borderRadius="full"
              position="absolute"
            />
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={textColor}
              position="absolute"
              left={textPosition === 'inside' ? 'auto' : textOffset}
              right={textPosition === 'inside' ? textOffset : 'auto'}
              top="50%"
              transform="translateY(-50%)"
              zIndex={1}
              textShadow={textPosition === 'outside' ? '0 0 2px rgba(0,0,0,0.3)' : 'none'}
            >
              {value}
                {ordinalSuffix}

            </Text>
          </Box>
        </Box>
      </PopoverTrigger>
      <PopoverContent width="auto" maxW="280px" borderRadius="md" boxShadow="lg">
        <PopoverBody p={4}>
          {/* Chart and percentile header */}
          <Flex align="center" mb={3}>
            <Box  width={`${chartWidth}px`} height={`${chartHeight}px`} mr={1} mt={-5}>
              <PieChart width={chartWidth} height={chartHeight}>
                <Pie
                  dataKey="value"
                  startAngle={180}
                  endAngle={0}
                  data={chartData}
                  cx={cx}
                  cy={cy}
                  innerRadius={iR}
                  outerRadius={oR}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Needle
                  value={value}
                  cx={cx}
                  cy={cy}
                  iR={iR}
                  oR={oR}
                  color={isDark ? "white" : "#333"}
                />
              </PieChart>
            </Box>
            <Text fontSize="sm" fontWeight="bold" color={barColor}>
              {value}
                {ordinalSuffix}
  
              {" "}Percentile
            </Text>
          </Flex>

          {/* Description */}
          <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"} textAlign="left" mb={2}>
            <Text as="span" fontWeight="bold" color={isDark ? "white" : "black"}>{name} </Text> has a higher <Text as="span" fontWeight="bold" color={isDark ? "white" : "black"}>{type}</Text> than <Text as="span" fontWeight="bold" color={barColor}>{value}%</Text> of all universities in UniDB

            
          </Text>
          <Text fontSize="xs" color={isDark ? "gray.300" : "gray.600"} textAlign="left">
            The average <Text as="span" fontWeight="bold" color={isDark ? "white" : "black"}>{type}</Text> is <Text as="span" fontWeight="bold" color={barColor}>{globalAvg}</Text>
          </Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default PercentileBar;