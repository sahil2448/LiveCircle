import React, { useContext, useEffect, useState } from "react";
import nature1 from "../../public/nature1.avif";
import "./Authentication.css";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Button, Snackbar, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Authentication = () => {
  const [formState, setFormState] = useState(0);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [name, setName] = useState();
  const [error, setError] = useState();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState();

  const { handleRegister, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
        setUsername("");
      }
    } catch (err) {
      console.log(err);
      let message = err.response.data.message;
      setError(message);
    }
  };

  const threshold = 750;
  const [myWidth, setMyWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setMyWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routeTo = useNavigate();
  return (
    <div className="mainContainer">
      <div style={{}} className="header" onClick={() => routeTo("/")}>
        <a>LiveCirle</a>
      </div>
      {myWidth > threshold && (
        <div className="left">
          <img className="leftImg" src={nature1} alt="" />
        </div>
      )}
      <div
        className="right"
        style={{ width: myWidth > threshold ? undefined : "100vw" }}
      >
        <div className="icon">
          {" "}
          <LockOutlinedIcon />
        </div>
        <div className="buttons">
          <Button
            variant={`${formState === 0 ? "contained" : ""}`}
            onClick={() => setFormState(0)}
          >
            Sign In
          </Button>
          <Button
            variant={`${formState === 1 ? "contained" : ""}`}
            onClick={() => setFormState(1)}
          >
            Sign Up
          </Button>
        </div>
        {formState === 1 ? (
          <TextField
            margin="normal"
            required
            // fullWidth
            sx={{ width: 350, maxWidth: "100%" }}
            id="fullname"
            label="fullname"
            name="fullname"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <></>
        )}
        <TextField
          margin="normal"
          required
          // fullWidth
          sx={{ width: 350, maxWidth: "100%" }}
          id="username"
          label="Username"
          name="username"
          value={username}
          autoFocus
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          // fullWidth
          sx={{ width: 350, maxWidth: "100%" }}
          name="password"
          label="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          id="password"
        />
        <p style={{ color: "red", textAlign: "start" }}>{error}</p>

        <Button
          variant="contained"
          sx={{ width: 350, maxWidth: "100%" }}
          onClick={handleAuth}
        >
          {formState === 0 ? "Log in" : "Register"}
        </Button>
      </div>
      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        color="green"
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>{" "}
    </div>
  );
};

export default Authentication;
