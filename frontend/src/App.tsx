import {
  Box,
  Container,
  Typography,
  Link,
  CssBaseline,
  ThemeProvider,
  Divider,
} from "@mui/material";
import { Outlet, Link as RouteLink } from "react-router-dom";

import { createTheme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />

      <Box id="layout-root">
        <Container>
          <Box component="header" sx={{ marginBottom: 4 }}>
            <Typography variant="h1">Hello world</Typography>
            <Box
              component="nav"
              sx={{
                display: "flex",
                hr: { marginX: 4 },
              }}
            >
              <Link component={RouteLink} to="/">
                Toggle
              </Link>
              <Divider orientation="vertical" variant="middle" flexItem />
              <Link component={RouteLink} to="/feed">
                Feed
              </Link>
            </Box>
          </Box>
          <Box component="main">
            <Outlet />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
