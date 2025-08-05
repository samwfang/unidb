// GraduationRateWidget.tsx
import React from 'react';
import { Box, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

interface TotalStudentWidgetProps {
  totalStudents: string;
}

const COLORS = ['#0088FE', '#FF69B4', '#FFBB28'];

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

const TotalStudentsWidget: React.FC<TotalStudentWidgetProps> = ({ totalStudents }) => {

  const data = [
    { name: 'Male', value: 40 },
    { name: 'Female', value: 10 },
    { name: 'Other', value: 50 },
  ];

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="md"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="120px"
      bg="rgba(255, 255, 255, 0.2)" // Semi-transparent white background
      //backdropFilter="blur(16px)"  // Applies the frosted glass effect      // Rounds the corners of the box
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" // Softer shadow
      border="1px solid rgba(255, 255, 255, 0.2)" // Lighter border
      position="relative" 
    >
      <Text fontSize="2xl" fontWeight="bold">Total Students:</Text>
      <Box height="305px" position="relative" overflow="visible" css={{
          "& .recharts-wrapper": {
            overflow: "visible !important",
          },
          "& .recharts-surface": {
            overflow: "visible !important",
          }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ left: 60, right: 60 }}>
              <Pie
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                animationDuration={800}
                animationBegin={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <g>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}
                >
                  {totalStudents}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  fill="#666"
                  style={{ fontSize: '14px' }}
                >
                  Students
                </text>
              </g>
            </PieChart>
          </ResponsiveContainer>

      </Box>
    </Box>
  );
};

export default TotalStudentsWidget;