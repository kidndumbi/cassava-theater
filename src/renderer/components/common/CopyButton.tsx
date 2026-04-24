import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

interface CopyButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  sx?: any;
  onCopy?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  size = 'small',
  color = 'inherit',
  sx = {},
  onCopy,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyText = async () => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Tooltip title={copySuccess ? "Copied!" : "Copy text"}>
      <IconButton
        onClick={handleCopyText}
        size={size}
        color={color}
        sx={sx}
      >
        {copySuccess ? <Check /> : <ContentCopy />}
      </IconButton>
    </Tooltip>
  );
};