import React from 'react';
import { Box } from '@chakra-ui/react';

interface DepartmentContentProps {
  content: string;
}

const DepartmentContent: React.FC<DepartmentContentProps> = ({ content }) => {
  return <Box p={4}>{content}</Box>;
};

export default DepartmentContent;