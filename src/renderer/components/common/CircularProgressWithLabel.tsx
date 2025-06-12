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
      <CircularProgress
        variant="determinate"
        size={70}
        {...props}
      />
      <Box className="absolute inset-0 flex items-center justify-center">
        <Typography
          variant="caption"
          component="div"
          sx={{ color: theme.customVariables.appWhiteSmoke }}
        >
          {`${(props.value || 0).toFixed(2)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
