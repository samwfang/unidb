import React from 'react';
import { AccordionPanel } from '@chakra-ui/react';

// Define the props type
interface MTExpandedEntryProps {
  content?: React.ReactNode; // Use ReactNode for flexible content
  isLoading?: boolean;
}

const MTExpandedEntry: React.FC<MTExpandedEntryProps> = ({ content, isLoading }) => {
  if (isLoading) return <AccordionPanel pb={4}>Loading...</AccordionPanel>;
  return <AccordionPanel pb={4}>{content || "No content available"}</AccordionPanel>;
};

export default MTExpandedEntry;