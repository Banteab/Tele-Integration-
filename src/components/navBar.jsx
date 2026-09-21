import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import PhoneIcon from "@mui/icons-material/Phone";

const drawerWidth = 240;

export default function NavBar() {
  const history = useHistory();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if user is logged in (has authtoken)
  // Note: This is a simple check. For reactivity, a context or redux state would be better,
  // but keeping it simple as per current architecture.
  const isLoggedIn = !!localStorage.getItem("authtoken");

  // Get user data if logged in
  const getUserData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const user = getUserData();
  const phoneNumber = user?.phoneNumber || localStorage.getItem("liyu_phone");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("authtoken");
    localStorage.removeItem("user");
    localStorage.removeItem("liyu_phone");
    localStorage.removeItem("selected_seats_/portal/view-buses");
    localStorage.removeItem("selected_seats_11160");

    // Redirect to login page since portal now requires authentication
    history.push("/login");
    // Force reload to update UI state if we aren't using context
    window.location.reload();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        LIYU BUS TICKET
      </Typography>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>

        {isLoggedIn && (
          <>
            {phoneNumber && (
              <ListItem>
                <ListItemText
                  primary={phoneNumber}
                  secondary="Your Phone Number"
                  sx={{ textAlign: "center" }}
                />
              </ListItem>
            )}
            <ListItem button component={Link} to="/ticket-history">
              <ListItemText primary="My Tickets" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
        {!isLoggedIn && (
          <>
            <ListItem button component={Link} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/signup">
              <ListItemText primary="Signup" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}
          >
            <Link
              to="/"
              style={{
                color: "inherit",
                textDecoration: "none",
                fontFamily: "inherit",
              }}
            >
              LIYU BUS TICKET
            </Link>
          </Typography>
          <Box
            sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}
          >
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              <Button sx={{ color: "#fff" }}>Home</Button>
            </Link>

            {isLoggedIn && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {phoneNumber && (
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    {phoneNumber}
                  </Typography>
                )}
                <Button component={Link} to="/ticket-history" color="inherit">
                  My Tickets
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            )}
            {!isLoggedIn && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Link
                  to="/login"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <Button color="inherit">Login</Button>
                </Link>
                <Link
                  to="/signup"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <Button variant="outlined" color="inherit">
                    Signup
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Toolbar />
    </Box>
  );
}
