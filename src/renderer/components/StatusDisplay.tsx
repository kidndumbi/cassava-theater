import { Box, CircularProgress } from "@mui/material";
import theme from "../theme";
import { useState } from "react";
import { AppModal } from "./common/AppModal";
import AppIconButton from "./common/AppIconButton";
import CheckIcon from "@mui/icons-material/Check";
import { useMp4Conversion } from "../hooks/useMp4Conversion";
import { Mp4ProgressList } from "./Mp4ProgressList";

const StatusDisplayItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <Box
      className="m-0 flex h-full items-center justify-center bg-inherit px-[10px]"
      sx={{
        "&:hover": {
          backgroundColor: theme.palette.primary.light,
        },
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

interface StatusDisplayProps {
  port: string | undefined;
}

export const StatusDisplay = ({ port }: StatusDisplayProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { convertToMp4Progress } = useMp4Conversion();

  return (
    <Box
      className="fixed bottom-0 left-0 right-0 flex h-[30px] items-center border-t p-0 text-base"
      style={{
        borderTop: `1px solid ${theme.palette.secondary.dark}`,
        backgroundColor: theme.customVariables.appDarker,
        color: theme.customVariables.appWhiteSmoke,
      }}
    >
      <StatusDisplayItem>PORT: {port} </StatusDisplayItem>
      <StatusDisplayItem
        onClick={() => {
          setIsProcessing(true);
        }}
      >
        {convertToMp4Progress.length > 0 &&
        convertToMp4Progress.some((p) => p.percent < 100) ? (
          <CircularProgress color="secondary" size="20px" />
        ) : (
          <AppIconButton
            tooltip="view processes"
            onClick={setIsProcessing.bind(null, true)}
            className="left-0"
            sx={{
              width: 24,
              height: 24,
            }}
          >
            <CheckIcon />
          </AppIconButton>
        )}
      </StatusDisplayItem>
      <AppModal
        open={isProcessing}
        onClose={setIsProcessing.bind(null, false)}
        title="Processing..."
        fullScreen={true}
      >
        <Mp4ProgressList progressList={convertToMp4Progress} />
      </AppModal>
    </Box>
  );
};
