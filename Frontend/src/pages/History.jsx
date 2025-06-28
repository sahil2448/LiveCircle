import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import { IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { Snackbar } from "@mui/material";
import { Alert } from "@mui/material";
import EmtpyState from "../../public/EmptyState.webp";
// const card = (

// );

const History = () => {
  const { getHistoryOfUser } = useContext(AuthContext);
  const { deleteFromHistory } = useContext(AuthContext);
  let [meetings, setMeetings] = useState([]);
  const [open, setOpen] = useState(false);
  let routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let history = await getHistoryOfUser();
        setMeetings(history);
      } catch (e) {
        console.log(e);
      }
    };

    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}/${month}/${day}`;

    return formattedDate;
  };
  let formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;
    return formattedTime;
  };

  const handleDeleteButton = async (meetingCode) => {
    await deleteFromHistory(meetingCode);
    let UpdatedHistory = await getHistoryOfUser();
    setMeetings(UpdatedHistory);
    setOpen(true);
  };

  return (
    <div style={{ padding: "1.4rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {" "}
        <h3
          onClick={() => routeTo("/history")}
          style={{ fontSize: "2rem", cursor: "pointer" }}
        >
          History
        </h3>
        <IconButton
          onClick={() => {
            routeTo("/home");
          }}
          style={{ borderRadius: "1px", display: "flex", gap: "4px" }}
        >
          <HomeIcon />
          <p style={{ fontSize: "1.2rem" }}>Home</p>
        </IconButton>
      </div>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          // height: "70vh",
        }}
      >
        {meetings.map((e) => {
          return (
            <div key={e._id} style={{ width: "25rem" }}>
              <Card variant="outlined">
                <CardContent>
                  <div
                    className="content"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>
                      <Typography
                        gutterBottom
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        User: {e.user_id}
                      </Typography>
                      <Typography
                        gutterBottom
                        sx={{ color: "text.secondary", fontSize: 14 }}
                      >
                        Meeting code : {e.meetingCode}
                      </Typography>
                    </div>

                    <Typography
                      gutterBottom
                      sx={{ color: "text.secondary", fontSize: 14 }}
                    >
                      Date: {formatDate(e.date) || "No Date"} <br />
                      Time: {formatTime(e.date) || "No time"}
                      {}
                    </Typography>
                  </div>
                </CardContent>
                <CardActions>
                  <IconButton
                    color="primary"
                    onClick={() => handleDeleteButton(e.meetingCode)}
                    style={{ borderRadius: "1px", display: "flex", gap: "4px" }}
                  >
                    {" "}
                    <DeleteIcon />
                    <p style={{ fontSize: "1rem" }}>Delete</p>
                  </IconButton>
                </CardActions>
              </Card>
            </div>
          );
        })}
        {meetings.length == 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              className="emptyImg"
              src={EmtpyState}
              style={{
                height: "60vh",
                width: "100vw",
                objectFit: "contain",
                display: "flex",
                alignSelf: "center",
                justifySelf: "center",
              }}
              alt=""
            />
            <h1 className="emptyText" style={{ textAlign: "center" }}>
              {" "}
              OOPS...No past Meetings exists !
            </h1>
          </div>
        ) : (
          <></>
        )}
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
          Meet successfully deleted
        </Alert>
      </Snackbar>{" "}
    </div>
  );
};

export default History;
