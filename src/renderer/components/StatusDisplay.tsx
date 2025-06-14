import { Box, CircularProgress } from "@mui/material";
import theme from "../theme";
import { useModalState } from "../hooks/useModalState";
import { AppModal } from "./common/AppModal";
import AppIconButton from "./common/AppIconButton";
import CheckIcon from "@mui/icons-material/Check";
import { Processing } from "./processing/Processing";
import { useSelector } from "react-redux";
import { selYoutubeDownloadProgress } from "../store/youtubeDownload.slice";
import { selConvertToMp4Progress } from "../store/mp4ConversionNew.slice";

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
  const { open, openModal, closeModal } = useModalState(false);
  const youtubeDownloadProgressQueue = useSelector(selYoutubeDownloadProgress);
  const mp4ConversionProgressNew = useSelector(selConvertToMp4Progress);

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
      <StatusDisplayItem onClick={openModal}>
        {mp4ConversionProgressNew.length > 0  ||
        youtubeDownloadProgressQueue.length > 0 ? (
          <CircularProgress color="secondary" size="20px" />
        ) : (
          <AppIconButton
            tooltip="view processes"
            onClick={openModal}
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
        open={open}
        onClose={closeModal}
        title="Processing"
        fullScreen={true}
      >
        <Processing
          youtubeDownloadProgressList={youtubeDownloadProgressQueue}
          mp4ConversionProgress={mp4ConversionProgressNew}
        />
      </AppModal>
    </Box>
  );
};
