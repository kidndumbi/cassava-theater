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
  const { fetchAllSettings, settings } = useSettings();

  useEffect(() => {
    fetchAllSettings();
  }, []);

  useEffect(() => {
    console.log("settings", settings);
  }, [settings]);

  return (
    <>
      <h2>APP PAGE</h2>

      <Button color="primary">APP PAGE</Button>
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
