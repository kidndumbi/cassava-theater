import { createTheme } from "@mui/material/styles";

// Extend the Theme interface to include custom properties
declare module "@mui/material/styles" {
  interface Theme {
    customVariables: {
      appDark: string;
      appDarker: string;
      appWhite: string;
      appWhiteSmoke: string;
    };
  }

  // Allow configuration using `createTheme`
  interface ThemeOptions {
    customVariables?: {
      appDark?: string;
      appDarker?: string;
      appWhite?: string;
      appWhiteSmoke?: string;
    };
  }
}

// Create a Material-UI theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: "#4b7d3c",
      contrastText: "#ffffff",
      dark: "#3a5e2d",
      light: "#5e9b4d",
    },
    secondary: {
      main: "#5b3c7d",
      contrastText: "#ffffff",
      dark: "#452e61",
      light: "#6f4e99",
    },
    success: {
      main: "#2dd55b",
      contrastText: "#000000",
      dark: "#28bb50",
      light: "#42d96b",
    },
    warning: {
      main: "#ffc409",
      contrastText: "#000000",
      dark: "#e0ac08",
      light: "#ffca22",
    },
    error: {
      main: "#c5000f",
      contrastText: "#ffffff",
      dark: "#ad000d",
      light: "#cb1a27",
    },
    info: {
      main: "#5f5f5f",
      contrastText: "#ffffff",
      dark: "#545454",
      light: "#6f6f6f",
    },
    background: {
      default: "white",
    },
  },
  typography: {
    fontWeightMedium: 600,
    fontSize: 17,
    h1: {
      fontSize: "2.2rem",
      fontWeight: 400,
      color: "#9EEAF9",
    },
    body1: {
      color: "black",
    },
  },
  customVariables: {
    appDark: "#303233",
    appDarker: "#171818",
    appWhite: "white",
    appWhiteSmoke: "whitesmoke",
  },
});

export default theme;
