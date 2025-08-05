// GraduationRateWidget.tsx
import React, { useState } from 'react';
import { Box, Text, Alert, AlertIcon, Tabs, TabList, Tab } from '@chakra-ui/react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

interface TotalStudentWidgetProps {
  totalStudents: string;
  avgHouseholdIncome?: string;
}

enum DisplayMode {
  Gender = 'gender',
  Ethnicity = 'ethnicity',
  Income = 'income'
}

//match dataset names in json to displaymode
const DATA_SET_NAMES: Record<DisplayMode, string> = {
  [DisplayMode.Gender]: "Gender",
  [DisplayMode.Ethnicity]: "Race and Ethnicity",
  [DisplayMode.Income]: "Income"
};




const COLORS_BY_CATEGORY: Record<string, string[]> = {
  [DisplayMode.Gender]: ['#0088FE', '#FF69B4', '#FFBB28'],
  [DisplayMode.Ethnicity]: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F'],
  [DisplayMode.Income]: ['#8884D8', '#82CA9D', '#FFC658']
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

//render slice of the pie, tbh i have no idea how this works but it's recharts magic 
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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {payload.name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

const TotalStudentsWidget: React.FC<TotalStudentWidgetProps> = ({ totalStudents, avgHouseholdIncome }) => {

  const [activeTab, setActiveTab] = useState<DisplayMode>(DisplayMode.Gender);


  const dataSets = [
    {
      name: "Gender",
      data: [
        { name: 'Male', value: 40 },
        { name: 'Female', value: 10 },
        { name: 'Other', value: 50 },
      ]
    },
    {
      name: "Race and Ethnicity",
      data: [
        { name: 'White', value: 30 },
        { name: 'Black', value: 20 },
        { name: 'Asian', value: 25 },
        { name: 'Hispanic', value: 15 },
        { name: 'Other', value: 10 },
      ]
    },
    {
      name: "Income",
      data: [
        { name: '<$30k', value: 20 },
        { name: '$30k-$60k', value: 30 },
        { name: '>$60k', value: 50 }
      ]
    }
  ];

  const findDataSet = (mode: DisplayMode) => dataSets.find(set => set.name === DATA_SET_NAMES[mode])!;
  const currentData = findDataSet(activeTab);

  if (!currentData) return <Alert status="error">Data not available</Alert>;


  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      display="flex"
      flexDirection="row" // Changed to row for side-by-side layout
      gap={4}
      minHeight="120px"
      bg="rgba(255, 255, 255, 0.2)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      position="relative"
    >


      <Box flex={1}>
        <Text fontSize="2xl" fontWeight="bold">Total Students:</Text>
        <Box height="305px" position="relative" overflow="visible" css={{
          "& .recharts-wrapper": { overflow: "visible !important" },
          "& .recharts-surface": { overflow: "visible !important" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ left: 60, right: 60 }}>
              <Pie
                activeShape={renderActiveShape}
                data={currentData.data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={5}
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
                  style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {getCenterText(activeTab, totalStudents, avgHouseholdIncome)}
                </text>
                <text x="50%" y="60%" textAnchor="middle" fill="#666" style={{ fontSize: '14px' }}>
                  {getCaption(activeTab)}
                </text>
              </g>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      <Tabs
        orientation="vertical"
        variant="soft-rounded"
        onChange={(index) => setActiveTab(Object.values(DisplayMode)[index])}
      >
        <TabList>
          {Object.values(DisplayMode).map((mode) => (
            <Tab key={mode}>{DATA_SET_NAMES[mode]}</Tab>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
};

export default TotalStudentsWidget;