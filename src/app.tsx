import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import theme from "./renderer/theme";
import Button from "@mui/material/Button";

const App = () => {
  const [message, setMessage] = useState("Hello from React!");

  useEffect(() => {
    // This code runs after the component mounts
    console.log("Component mounted");
    // You can update the state or perform other side effects here
    setMessage("Hello from useEffect!");

    // Cleanup function (optional)
    return () => {
      console.log("Component unmounted");
    };
  }, []); // Empty dependency array means this runs once after initial render

  return (
    <>
      <h2>{message}</h2>
      <Button color="primary">Cancel</Button>
    </>
  );
};

const root = createRoot(document.body);
root.render(
  <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </>
);
