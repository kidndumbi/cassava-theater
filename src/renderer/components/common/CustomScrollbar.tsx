import styled from "@emotion/styled";
import { Box } from "@mui/material";

const CustomScrollbar = styled(Box)`
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #101414;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #22272b;
    border-radius: 10px;
    border: 2px solid #101414;
    margin-right: 2px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

export default CustomScrollbar;
