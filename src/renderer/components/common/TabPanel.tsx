import React from "react";
import { Box, BoxProps } from "@mui/material";

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  index: number;
  value: number;
  boxProps?: BoxProps;
}

/**
 * A customizable tab panel component that follows WAI-ARIA tab panel patterns.
 * @param props - TabPanel configuration
 * @param props.children - Content to be displayed in the tab panel
 * @param props.index - The index of this tab panel
 * @param props.value - The currently selected tab index
 * @param props.boxProps - Additional props to pass to the inner Box component
 */
export const CustomTabPanel = ({
  children,
  value,
  index,
  boxProps = { sx: { p: 0 } },
  ...other
}: TabPanelProps) => {
  const isSelected = value === index;
  const tabId = `simple-tab-${index}`;
  const panelId = `simple-tabpanel-${index}`;

  return (
    <div
      role="tabpanel"
      hidden={!isSelected}
      id={panelId}
      aria-labelledby={tabId}
      {...other}
    >
      {isSelected && <Box {...boxProps}>{children}</Box>}
    </div>
  );
};

/**
 * Generates accessibility props for tab buttons to associate them with their panels
 * @param index - The index of the tab
 * @returns An object containing id and aria-controls attributes
 */
export const a11yProps = (index: number): { 
  id: string;
  'aria-controls': string;
} => ({
  id: `simple-tab-${index}`,
  'aria-controls': `simple-tabpanel-${index}`,
});