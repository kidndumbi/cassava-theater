import { Box, CircularProgress, Typography } from "@mui/material";
import theme from "../theme";
import { useState } from "react";
import { AppModal } from "./common/AppModal";
import { useSelector } from "react-redux";
import { selConvertToMp4Progress } from "../store/videoInfo/folderVideosInfoSelectors";
import { CircularProgressWithLabel } from "./common/CircularProgressWithLabel";

const StatusDisplayItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <Box
      sx={{
        padding: "0 10px",
        margin: 0,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "inherit",
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
  const convertToMp4Progress = useSelector(selConvertToMp4Progress);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "30px",
        backgroundColor: theme.customVariables.appDarker,
        color: theme.customVariables.appWhiteSmoke,
        display: "flex",
        alignItems: "center",
        fontSize: "1rem",
        padding: "0",
        borderTop: `1px solid ${theme.palette.secondary.dark}`,
      }}
    >
      <StatusDisplayItem>PORT: {port} </StatusDisplayItem>
      <StatusDisplayItem
        onClick={() => {
          console.log("StatusDisplayItem clicked"); // Placeholder for any action
          setIsProcessing(true); // Simulate processing state
        }}
      >
        <CircularProgress color="secondary" size="20px" />
      </StatusDisplayItem>
      <AppModal
        open={isProcessing}
        onClose={setIsProcessing.bind(null, false)}
        title="Processing..."
        fullScreen={true}
      >
        {convertToMp4Progress &&
          convertToMp4Progress.map((progress, index) => (
            <Box key={index} className="flex" sx={{ padding: "10px" }}>
              <Typography variant="h6" sx={{
                color: theme.customVariables.appWhiteSmoke,
                marginRight: "10px",
              }} component="div">
                {progress.toPath}
              </Typography>
              <CircularProgressWithLabel value={progress.percent} />
            </Box>
          ))}
      </AppModal>
    </Box>
  );
};
