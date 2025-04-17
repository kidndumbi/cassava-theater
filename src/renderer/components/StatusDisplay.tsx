import { Box, CircularProgress, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import theme from "../theme";
import { useState } from "react";
import { AppModal } from "./common/AppModal";
import { CircularProgressWithLabel } from "./common/CircularProgressWithLabel";
import AppIconButton from "./common/AppIconButton";
import CheckIcon from "@mui/icons-material/Check";
import { useMp4Conversion } from "../hooks/useMp4Conversion";

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
        convertToMp4Progress.some((p) => p.percent < 99) ? (
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
        {convertToMp4Progress &&
          convertToMp4Progress.map((progress, index) => (
            <Box
              key={index}
              className="m-2 flex items-center rounded-md"
              sx={{
                padding: "10px",
                backgroundColor: theme.palette.secondary.main,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.customVariables.appWhiteSmoke,
                  marginRight: "10px",
                }}
                component="div"
              >
                {progress.toPath}
              </Typography>
              {progress.percent >= 99 ? (
                <CheckCircleIcon
                  sx={{
                    color: theme.palette.primary.main,
                  }}
                />
              ) : (
                <CircularProgressWithLabel value={progress.percent} />
              )}
            </Box>
          ))}
      </AppModal>
    </Box>
  );
};
