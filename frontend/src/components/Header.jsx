import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Menu,
  MenuItem
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { useState } from "react";

export default function Header() {
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "#ffffff",
        color: "#222",
        borderBottom: "1px solid #e5e5e5"
      }}
    >
      <Toolbar>

        {/* LOGO */}

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#1976d2"
          }}
        >
          MGCF
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* IMPOSTAZIONI */}

        <Button
          color="inherit"
          startIcon={<SettingsIcon />}
          onClick={(e) => setSettingsAnchor(e.currentTarget)}
        >
          Impostazioni
        </Button>

        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
        >
          <MenuItem>Impostazioni Conti</MenuItem>
          <MenuItem>Impostazioni Immobili</MenuItem>
          <MenuItem>Impostazioni Tasse</MenuItem>
          <MenuItem>Impostazioni Beni Mobili</MenuItem>
        </Menu>

        {/* UTENTE */}

        <Button
          color="inherit"
          startIcon={<AccountCircleIcon />}
          onClick={(e) => setUserAnchor(e.currentTarget)}
        >
          M. Di Fazio
        </Button>

        <Menu
          anchorEl={userAnchor}
          open={Boolean(userAnchor)}
          onClose={() => setUserAnchor(null)}
        >
          <MenuItem>Cambia Password</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>

      </Toolbar>
    </AppBar>
  );
}