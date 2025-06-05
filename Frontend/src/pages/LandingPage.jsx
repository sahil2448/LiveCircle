import React, { useEffect, useState } from "react";
import "../App.css";
import mobile from "../../public/mobile.webp";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";

function LandingPage() {
  const threshold = 1070;
  const [myWidth, setMyWidth] = useState(window.innerWidth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setMyWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routeTo = useNavigate();

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={() => setDrawerOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        <ListItem
          button
          onClick={() => {
            setDrawerOpen(false);
            routeTo("/Guest123");
          }}
        >
          <ListItemText primary="Join as Guest" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/auth"
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemText primary="Register" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/auth"
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemText primary="Login" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navheader" onClick={() => routeTo("/")}>
          <a>LiveCirle</a>
        </div>
        {myWidth > threshold ? (
          // Normal navbar for large screens
          <div className="navlist">
            <a className="nav-item" onClick={() => routeTo("/Guest123")}>
              Join as Guest
            </a>
            <Link
              style={{ color: "white", textDecoration: "none" }}
              to={"/auth"}
              className="nav-item"
            >
              Register
            </Link>
            <Link
              style={{ color: "white", textDecoration: "none" }}
              to={"/auth"}
              className="login"
            >
              Login
            </Link>
          </div>
        ) : (
          // Drawer for small screens
          <div>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: "white" }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              {drawerContent}
            </Drawer>
          </div>
        )}
      </nav>
      <div
        className="landingMainContainer"
        style={{
          flexDirection: myWidth > threshold ? "row" : "column-reverse",
          gap: myWidth > threshold ? "row" : "5rem",
        }}
      >
        <div className="content">
          <p className="p1">
            <span className="connect">Connect</span> with your <br /> Loved ones
          </p>
          <p className="p2">Cover a distance using LiveCircle</p>
          <div role="button">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div className="brdrs">
          <img src={mobile} alt="" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
