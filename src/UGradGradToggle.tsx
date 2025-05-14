import React from 'react';

interface ModeToggleProps {
  mode: 'grad' | 'undergrad';
  onToggle: () => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onToggle }) => {
  return (
    <button onClick={onToggle}>
      Switch to {mode === 'undergrad' ? 'Grad' : 'Undergrad'} Mode
    </button>
  );
};

export default ModeToggle;
