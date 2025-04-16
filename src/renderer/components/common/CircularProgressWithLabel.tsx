import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import theme from "../../theme";

export function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box className="relative inline-flex">
      <CircularProgress variant="determinate" {...props} />
      <Box className="absolute inset-0 flex items-center justify-center">
        <Typography
          variant="caption"
          component="div"
          sx={{ color: theme.customVariables.appWhiteSmoke }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}
