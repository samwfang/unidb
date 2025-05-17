import React from 'react';
import { ModeType } from './App';

interface ModeToggleProps {
  mode: ModeType;
  onToggle: () => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({mode, onToggle }) => {
  return (
    <button onClick={onToggle}>
      Switch Mode To {mode == ModeType.Undergrad ? 'Graduate' : 'Undergraduate'}
    </button>
  );
};

export default ModeToggle;
