// import * as React from "react";
// import Avatar from "@mui/material/Avatar";
// import Button from "@mui/material/Button";
// import CssBaseline from "@mui/material/CssBaseline";
// import TextField from "@mui/material/TextField";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Checkbox from "@mui/material/Checkbox";
// import Link from "@mui/material/Link";
// import Paper from "@mui/material/Paper";
// import Box from "@mui/material/Box";
// import Grid from "@mui/material/Grid";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import Typography from "@mui/material/Typography";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// // import { AuthContext } from "../contexts/AuthContext";
// import { Snackbar } from "@mui/material";

// // TODO remove, this demo shouldn't need to reset the theme.

// const defaultTheme = createTheme();

// export default function Authentication() {
//   const [username, setUsername] = React.useState();
//   const [password, setPassword] = React.useState();
//   const [name, setName] = React.useState();
//   const [error, setError] = React.useState();
//   const [message, setMessage] = React.useState();

//   const [formState, setFormState] = React.useState(0);

//   const [open, setOpen] = React.useState(false);

//   //   const { handleRegister, handleLogin } = React.useContext(AuthContext);

//   let handleAuth = async () => {
//     try {
//       if (formState === 0) {
//         let result = await handleLogin(username, password);
//       }
//       if (formState === 1) {
//         let result = await handleRegister(name, username, password);
//         console.log(result);
//         setUsername("");
//         setMessage(result);
//         setOpen(true);
//         setError("");
//         setFormState(0);
//         setPassword("");
//       }
//     } catch (err) {
//       console.log(err);
//       let message = err.response.data.message;
//       setError(message);
//     }
//   };

//   return (
//     <ThemeProvider theme={defaultTheme}>
//       <Grid container component="main" sx={{ height: "100vh" }}>
//         <CssBaseline />
//         <Grid
//           item
//           xs={false}
//           sm={4}
//           md={7}
//           sx={{
//             backgroundImage:
//               "url('https://unsplash.com/photos/snow-capped-mountains-during-daytime-T-FSAK4Bv9c')",
//             backgroundRepeat: "no-repeat",
//             backgroundColor: (t) =>
//               t.palette.mode === "light"
//                 ? t.palette.grey[50]
//                 : t.palette.grey[900],
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }}
//         />
//         <Grid item xs={12} sm={8} md={5} component={Paper} square>
//           <Box
//             sx={{
//               my: 8,
//               mx: 4,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//             }}
//           >
//             <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
//               <LockOutlinedIcon />
//             </Avatar>

//             <div>
//               <Button
//                 variant={formState === 0 ? "contained" : ""}
//                 onClick={() => {
//                   setFormState(0);
//                 }}
//               >
//                 Sign In
//               </Button>
//               <Button
//                 variant={formState === 1 ? "contained" : ""}
//                 onClick={() => {
//                   setFormState(1);
//                 }}
//               >
//                 Sign Up
//               </Button>
//             </div>

//             <Box component="form" noValidate sx={{ mt: 1 }}>
//               {formState === 1 ? (
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   id="username"
//                   label="Full Name"
//                   name="username"
//                   value={name}
//                   autoFocus
//                   onChange={(e) => setName(e.target.value)}
//                 />
//               ) : (
//                 <></>
//               )}

//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 id="username"
//                 label="Username"
//                 name="username"
//                 value={username}
//                 autoFocus
//                 onChange={(e) => setUsername(e.target.value)}
//               />
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 name="password"
//                 label="Password"
//                 value={password}
//                 type="password"
//                 onChange={(e) => setPassword(e.target.value)}
//                 id="password"
//               />

//               <p style={{ color: "red" }}>{error}</p>

//               <Button
//                 type="button"
//                 fullWidth
//                 variant="contained"
//                 sx={{ mt: 3, mb: 2 }}
//                 onClick={handleAuth}
//               >
//                 {formState === 0 ? "Login " : "Register"}
//               </Button>
//             </Box>
//           </Box>
//         </Grid>
//       </Grid>

//       <Snackbar open={open} autoHideDuration={4000} message={message} />
//     </ThemeProvider>
//   );
// }

import React, { useContext, useState } from "react";
import nature1 from "../../public/nature1.avif";
import "./Authentication.css";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Button, Snackbar, TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import { Alert } from "@mui/material";

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
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      console.log(err.message);
      setError(message);
    }
  };

  return (
    <div className="mainContainer">
      <div className="left">
        <img className="leftImg" src={nature1} alt="" />
      </div>
      <div className="right">
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
