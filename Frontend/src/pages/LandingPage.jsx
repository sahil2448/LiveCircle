import React from "react";
import "../App.css";
import mobile from "../../public/mobile.png";
import { Link, useNavigate } from "react-router-dom";
function LandingPage() {
  const routeTo = useNavigate();
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navheader">
          <a>LiveCirle</a>
        </div>
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
      </nav>
      <div className="landingMainContainer">
        <div className="content">
          <p className="p1">
            {" "}
            <span className="connect">Connect</span> with your <br /> Loved ones
          </p>
          <p className="p2">Cover a distance using LiveCircle</p>
          <div role="button">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src={mobile} alt="" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
