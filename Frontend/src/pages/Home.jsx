import React, { useContext, useEffect, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { IconButton, Button, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";

const Home = () => {
  let [meetingCode, setMeetingCode] = useState("");
  let navigate = useNavigate();

  const { addToUserHistory } = useContext(AuthContext);
  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const threshold = 750;
  const [myWidth, setMyWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setMyWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="navBar">
        <div
          className="navHeader"
          style={{ display: "flex", alignItems: "center" }}
          onClick={() => navigate("/home")}
        >
          {myWidth > threshold && (
            <h1 style={{ fontSize: "2rem", cursor: "pointer" }}>Home</h1>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
          <IconButton
            onClick={() => {
              navigate("/history");
            }}
            style={{ borderRadius: "1px", display: "flex", gap: "4px" }}
          >
            <RestoreIcon />
            <p style={{ fontSize: "1.2rem" }}>History</p>
          </IconButton>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            variant="contained"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div className="innerLeft">
            <p>
              Delivering <span> Premium Video Calls</span> with <br />
              the Clarity You Deserve{" "}
            </p>

            <div
              style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}
            >
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
              />
              <Button
                onClick={handleJoinVideoCall}
                variant="contained"
                style={{ height: "2.5rem" }}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
        {myWidth > threshold && (
          <div className="rightPanel">
            <img srcSet="/logo3.webp" alt="" />
          </div>
        )}
      </div>
    </>
  );
};

export default withAuth(Home);
