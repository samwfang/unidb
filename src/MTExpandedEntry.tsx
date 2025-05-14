import React from 'react';
import { AccordionPanel } from '@chakra-ui/react';

// Define the props type
interface MTExpandedEntryProps {
  content: React.ReactNode; // Use ReactNode for flexible content
}

const MTExpandedEntry: React.FC<MTExpandedEntryProps> = ({ content }) => {
  return <AccordionPanel pb={4}>{content}</AccordionPanel>;
};

export default MTExpandedEntry;