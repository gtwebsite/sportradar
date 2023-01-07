import { Box, Typography, CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Box id="layout-root">
        <Typography variant="h1">Hello world</Typography>
      </Box>
    </ThemeProvider>
  );
}
