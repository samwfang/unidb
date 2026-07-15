import React, { useState } from 'react';
import { Box, Text, Alert, AlertIcon, Tabs, TabList, Tab, Flex, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, useDisclosure, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody, useColorMode } from '@chakra-ui/react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DemographicsData } from 'src/Root/FrontPage/MasterTable';
import { HamburgerIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import PercentileBar from 'src/ReusableComponents/PercentileBar';
import WidgetBox from 'src/containers/WidgetBox';
import GlassBox from 'src/containers/GlassBox';
import { useResponsive } from 'src/containers/useResponsive';

interface TotalStudentWidgetProps {
  universityName: string;
  totalStudents: string;
  totalStudentsPercentile: string;
  avgHouseholdIncome?: string;
  demographics?: DemographicsData;
  departments?: Array<{ department_name: string; total_students?: string }>;
}

enum DisplayMode {
  Department = 'department',
  Income = 'income',
  Ethnicity = 'ethnicity',
  Gender = 'gender'
}

//match dataset names in json to displaymode
const DATA_SET_NAMES: Record<DisplayMode, string> = {
  [DisplayMode.Gender]: "Gender",
  [DisplayMode.Ethnicity]: "Race and Ethnicity",
  [DisplayMode.Income]: "Income",
  [DisplayMode.Department]: "Department"
};




const COLORS_BY_CATEGORY: Record<string, string[]> = {
  [DisplayMode.Gender]: ['#0088FE', '#FF69B4', '#FFBB28'],
  [DisplayMode.Ethnicity]: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F'],
  [DisplayMode.Income]: ['#8884D8', '#82CA9D', '#FFC658'],
  [DisplayMode.Department]: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F']
};

const getCenterText = (activeTab: DisplayMode, totalStudents: string, avgIncome?: string) => {
  switch (activeTab) {
    case DisplayMode.Income: return avgIncome || 'N/A';
    default: return totalStudents;
  }
};

const getCaption = (activeTab: DisplayMode) => {
  switch (activeTab) {
    case DisplayMode.Income: return "Avg. Income";
    default: return "Students";
  }
};


const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const LINE_SCALE_FACTOR = 0.6;
  const sx = cx + (outerRadius + 10 * LINE_SCALE_FACTOR) * cos;
  const sy = cy + (outerRadius + 10 * LINE_SCALE_FACTOR) * sin;
  const mx = cx + (outerRadius + 30 * LINE_SCALE_FACTOR) * cos;
  const my = cy + (outerRadius + 30 * LINE_SCALE_FACTOR) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22 * LINE_SCALE_FACTOR;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const lineCount = payload.name.split('\n').length;
  const percentageOffset = 18 + (lineCount - 1) * 18;

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={payload.fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={payload.fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" style={{ fontSize: 'clamp(10px, 2vw, 14px)' }}>
        {payload.name.split('\n').map((line: string, i: number) => (
          <tspan x={ex + (cos >= 0 ? 1 : -1) * 12} dy={i === 0 ? 0 : 15} key={i}>
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={percentageOffset}
        textAnchor={textAnchor}
        fill="#999"
        style={{ fontSize: 'clamp(9px, 1.8vw, 12px)' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

//renderCustomizedLabel vs renderActiveShape: to use this one just change remove label={
// renderCustomizedLabel} and change it to activeShape={renderActiveShape}
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const lineCount = payload.name.split('\n').length;
  const percentageOffset = 18 + (lineCount - 1) * 18; // 12px per additional line

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333 " style={{ fontSize: 'clamp(10px, 2vw, 14px)' }}>
        {payload.name.split('\n').map((line: string, i: number) => (
          <tspan x={ex + (cos >= 0 ? 1 : -1) * 12} dy={i === 0 ? 0 : 15} key={i}>
            {line}
          </tspan>
        ))}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={percentageOffset}
        textAnchor={textAnchor}
        fill="#999"
        style={{ fontSize: 'clamp(9px, 1.8vw, 12px)' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};




//Find top 20 Departments and find the amount of total students per department as proportion
const processDepartmentData = (
  departments: Array<{ department_name: string; total_students?: string }> = [],
  totalStudents: string
) => {
  const MAX_DEPTS = 20;
  const totalNum = parseInt(totalStudents.replace(/,/g, '')) || 0;

  // Filter and sort departments by number of total students
  const validDepts = departments
    .filter(dept => dept.total_students)
    .map(dept => ({
      name: dept.department_name,
      value: parseInt(dept.total_students!.replace(/,/g, '')) || 0
    }))
    .sort((a, b) => b.value - a.value);

  // Take top departments
  const topDepts = validDepts.slice(0, MAX_DEPTS);
  // Proportion "Other" is the value of all students other than those in the specified departments
  const otherValue = Math.max(0, totalNum - topDepts.reduce((sum, dept) => sum + dept.value, 0));

  if (otherValue > 0) {
    topDepts.push({ name: 'Other/\nUnknown', value: otherValue });
  }

  return topDepts;
};

const TotalStudentsWidget: React.FC<TotalStudentWidgetProps> = ({ totalStudents, avgHouseholdIncome,
  totalStudentsPercentile, universityName, demographics, departments }) => {

  const [activeTab, setActiveTab] = useState<DisplayMode>(DisplayMode.Department);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';


  const dataSets = [
    {
      name: "Department",
      data: processDepartmentData(departments, totalStudents)
    },
    {
      name: "Gender",
      data: demographics?.gender || []
    },
    {
      name: "Race and Ethnicity",
      data: demographics?.ethnicity || []
    },
    {
      name: "Income",
      data: demographics?.income || []
    }

  ];

  const findDataSet = (mode: DisplayMode) => dataSets.find(set => set.name === DATA_SET_NAMES[mode])!;
  const currentData = findDataSet(activeTab);

  const { chartRadius } = useResponsive();
  const { inner: inner, outer } = chartRadius;

  if (!currentData) return <Alert status="error">Data not available</Alert>;


  // Not currently in use, maybe for expanded component
  const renderLegend = () => {
    if (!currentData.data.length) return null;

    // Calculate sum of current data values instead of using totalStudents
    const currentDataSum = currentData.data.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <Box mt={2} maxW="100%" overflowY="auto" maxH="150px">
        <Flex direction="column" gap={1}>
          {currentData.data.map((entry, index) => (
            <Flex key={index} align="center" gap={2}>
              <Box
                w="10px"
                h="10px"
                borderRadius="2px"
                bg={COLORS_BY_CATEGORY[activeTab][index % COLORS_BY_CATEGORY[activeTab].length]}
                flexShrink={0}
              />
              <Text fontSize="xs" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {entry.name.replace('\n', ' ')}: {(entry.value / currentDataSum * 100).toFixed(1)}%
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    );
  };

  const renderLegendPopover = () => {
    if (!currentData.data.length) return null;

    const currentDataSum = currentData.data.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <Popover>
        <PopoverTrigger>
          <HamburgerIcon
            position="absolute"
            top={3}
            right={3}
            cursor="pointer"
            boxSize={{ base: 4, md: 6 }}
            color="gray.500"
            _hover={{ color: "gray.700" }}
          />
        </PopoverTrigger>
        <PopoverContent width="auto" maxWidth="300px">
          <PopoverArrow />
          <PopoverBody p={4}>
            <Text fontSize="md" fontWeight="bold" mb={3}>
              {DATA_SET_NAMES[activeTab]} Distribution
            </Text>
            <Flex direction="column" gap={2}>
              {currentData.data.map((entry, index) => (
                <Flex key={index} align="center" gap={3}>
                  <Box
                    w="12px"
                    h="12px"
                    borderRadius="2px"
                    bg={COLORS_BY_CATEGORY[activeTab][index % COLORS_BY_CATEGORY[activeTab].length]}
                    flexShrink={0}
                  />
                  <Text fontSize="sm">
                    {entry.name.replace('\n', ' ')}: {(entry.value / currentDataSum * 100).toFixed(1)}%
                  </Text>
                </Flex>
              ))}
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };



  return (
    <WidgetBox
      p={4}
      display="flex"
      flexDirection="column"
      gap={4}
      minHeight="120px"
      position="relative"
    >
      {renderLegendPopover()}
      <Box>
        <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="bold">Total Students:</Text>
        <Box height={{ base: "200px", md: "250px" }} position="relative" overflow="visible">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    const total = currentData.data.reduce((sum, entry) => sum + entry.value, 0);
                    const percentage = ((data.value / total) * 100).toFixed(1);
                    const index = currentData.data.findIndex(entry => entry.name === data.name);
                    const color = COLORS_BY_CATEGORY[activeTab][index % COLORS_BY_CATEGORY[activeTab].length];

                    return (
                      <WidgetBox
                        p={3}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        boxShadow="sm"
                        fontSize="sm"
                        minWidth="140px"
                      >
                        <Flex align="center" gap={2} mb={2}>
                          <Box
                            w="12px"
                            h="12px"
                            borderRadius="2px"
                            bg={color}
                            flexShrink={0}
                          />
                          <Text fontWeight="bold" color={isDark ? "gray.100" : "gray.800"} >
                            {data.name.replace('\n', ' ')}
                          </Text>
                        </Flex>
                        <Text color={isDark ? "gray.300" : "gray.600"} fontSize="sm">
                          {percentage}% of Total
                        </Text>
                      </WidgetBox>
                    );
                  }
                  return null;
                }}
                animationDuration={0}
              />
              <Pie
                data={currentData.data}
                cx="50%"
                cy="50%"
                innerRadius={inner}
                outerRadius={outer}
                paddingAngle={5}
                cornerRadius={5}
                dataKey="value"
              >
                {currentData.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS_BY_CATEGORY[activeTab][index % COLORS_BY_CATEGORY[activeTab].length]}
                  />
                ))}
              </Pie>
              <g>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 'bold' }} fill={isDark ? "white" : "black"} >
                  {getCenterText(activeTab, totalStudents, avgHouseholdIncome)}
                </text>
                <text x="50%" y="60%" textAnchor="middle" fill={isDark ? "#d1d5db" : "#4b5563"} style={{ fontSize: 'clamp(10px, 2vw, 14px)' }}>
                  {getCaption(activeTab)}
                </text>
              </g>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* PercentileBar positioned above the tabs */}
      <Flex justify="center" mt={-8} mb={1}>
        <Box width="120px">
          <PercentileBar
            value={parseFloat(totalStudentsPercentile)}
            name={universityName}
            type="total students"
            globalAvg="5,000"
          />
        </Box>
      </Flex>


      {/* Horizontal tabs at the bottom */}
      <Box>
        <Tabs
          variant="soft-rounded"
          onChange={(index) => setActiveTab(Object.values(DisplayMode)[index])}
        >
          <TabList justifyContent="center" flexWrap="wrap" gap={{ base: 1, md: 2 }}>
            {Object.values(DisplayMode).map((mode) => (
              <Tab
                key={mode}
                fontSize={{ base: "xs", sm: "2xs", md: "xs" }}
                px={{ base: 0.5, sm: 1, md: 2 }}
                py={{ base: 0.5, sm: 1, md: 2 }}
                whiteSpace="nowrap"
                flexShrink={0}
              >
                {DATA_SET_NAMES[mode]}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>
    </WidgetBox>
  );
};

export default TotalStudentsWidget;