import React, { createContext, useContext, useState } from "react";
import axios, { HttpStatusCode } from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);

  const [userData, setUserData] = useState(authContext);
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    // try {
    const res = await client.post("/register", { name, username, password });
    if (res.status === HttpStatusCode.Created) {
      return res.data.message;
    }
    // throw new Error("Registration failed with status " + res.status);
    // } catch (e) {
    //   // re-throw the original AxiosError so .response stays intact
    //   throw e;
    // }
    throw new Error(`Registration failed (status ${res.status})`);
  };

  const handleLogin = async (username, password) => {
    // try {
    let request = await client.post("/login", {
      username: username,
      password: password,
    });
    if (request.status === HttpStatusCode.Ok) {
      localStorage.setItem("token", request.data.token);
      router("/home");
    }
    throw new Error(`Login failed (status ${request.status})`);

    // } catch (e) {
    // throw e;
    // }
  };

  const getHistoryOfUser = async () => {
    // try {
    let request = await client.get("/get_all_activity", {
      params: {
        token: localStorage.getItem("token"),
      },
    });
    return request.data;
    // } catch (e) {
    //   throw e;
    // }
  };

  const deleteFromHistory = async (meetingCode) => {
    let request = await client.delete("/delete_from_history", {
      data: {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      },
    });
    return request;
  };

  const addToUserHistory = async (meetingCode) => {
    // try {
    let request = await client.post("/add_to_activity", {
      token: localStorage.getItem("token"),
      meeting_code: meetingCode,
    });
    return request;
    // } catch (e) {
    //   throw e;
    // }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
    deleteFromHistory,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
