import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import theme from "./renderer/theme";
import Button from "@mui/material/Button";
import { useSettings } from "./renderer/hooks/useSettings";
import { store } from "./renderer/store";

const App = () => {
  const [message, setMessage] = useState("Hello from React!");
  const [isDesktop, setIsDesktop] = useState(false);
  const { fetchAllSettings, settings } = useSettings();

  useEffect(() => {
    // This code runs after the component mounts
    console.log("Component mounted");
    // You can update the state or perform other side effects here
    setMessage("Hello from useEffect!");

    fetchAllSettings();

    return () => {
      console.log("Component unmounted");
    };
  }, []); // Empty dependency array means this runs once after initial render

  useEffect(() => {
    console.log("settings", settings);
  }, [settings]);

  return (
    <>
      <h2>{message}</h2>
      <p>{isDesktop ? "Running on desktop" : "Not running on desktop"}</p>
      <Button color="primary">Cancel</Button>
    </>
  );
};

const root = createRoot(document.body);
root.render(
  <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </>
);
