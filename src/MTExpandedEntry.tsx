import React from 'react';
import { AccordionPanel } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { Content } from './MasterTable';
import { ModeType } from './App';

interface MTExpandedEntryProps {
  mode: ModeType;
  content?: Content;
  isLoading?: boolean;
}

const MTExpandedEntry: React.FC<MTExpandedEntryProps> = ({ content, mode, isLoading }) => {
  if (isLoading) return <AccordionPanel pb={4}>Loading...</AccordionPanel>;

  return (
    <AccordionPanel pb={4}>
      {(mode === ModeType.Undergrad
        ? content?.undergrad_content?.content
        : content?.grad_content?.content) || "No content available"}
    </AccordionPanel>
  );
};

export default MTExpandedEntry;