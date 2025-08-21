// GraduationRateWidget.tsx
import React, { useEffect, useState } from 'react';
import { Box, Text, Alert, AlertIcon, Tabs, TabList, Tab } from '@chakra-ui/react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { DemographicsData } from 'src/MasterTable';

interface TotalStudentWidgetProps {
  totalStudents: string;
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

const TotalStudentsWidget: React.FC<TotalStudentWidgetProps> = ({ totalStudents, avgHouseholdIncome, demographics, departments }) => {

  const [activeTab, setActiveTab] = useState<DisplayMode>(DisplayMode.Department);


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

  // DYNAMICALLY ADJUST PIE CHART SIZE ACCORDING TO WINDOW HEIGHT (SINCE RECHARTS DOESNT SUPPORT THIS GRRR)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });



  // Responsive radius based on window width
  const getRadius = () => {
    if (windowSize.width < 480) return { inner: 50, outer: 70 };
    if (windowSize.width < 768) return { inner: 60, outer: 80 };
    return { inner: 80, outer: 100 };
  };

  const { inner, outer } = getRadius();


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
        <Text fontSize={{base: "md", md: "xl"}}  fontWeight="bold">Total Students:</Text>
        <Box height="250px" position="relative" overflow="visible" css={{
          "& .recharts-wrapper": { overflow: "visible !important" },
          "& .recharts-surface": { overflow: "visible !important" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ left: 60, right: 60 }}>
              <Pie
                label={renderCustomizedLabel}
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
                  style={{ fontSize: 'clamp(20px, 3.5vw, 32px)', fontWeight: 'bold' }}>
                  {getCenterText(activeTab, totalStudents, avgHouseholdIncome)}
                </text>
                <text x="50%" y="60%" textAnchor="middle" fill="#666" style={{ fontSize: 'clamp(10px, 2vw, 14px)' }}>
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
            <Tab key={mode} fontSize={{ base: "xs", md: "sm" }}
              px={{ base: 2, md: 4 }}
              py={{ base: 1, md: 2 }}>{DATA_SET_NAMES[mode]}</Tab>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
};

export default TotalStudentsWidget;