import React, { useReducer, useRef, useState, useEffect } from "react";
import "../styles/VideoMeet.css";
import TextField from "@mui/material/TextField";
const server_url = "http://localhost:8000"; // Backend server URL for signaling
import { Button } from "@mui/material";
let connections = {}; // Object to store all peer connections
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // STUN server configuration for NAT traversal
};

const VideoMeet = () => {
  // Refs for socket and DOM elements
  let socketRef = useRef(); // Reference to WebSocket connection
  let socketIdRef = useRef(); // Reference to store this user's socket ID
  let localVideoRef = useRef(); // Reference to the local video element

  // Media state variables
  let [videoAvailable, setVideoAvailable] = useState(true); // Whether camera is available
  let [audioAvailable, setAudioAvailable] = useState(true); // Whether microphone is available
  let [video, setVideo] = useState(); // Whether video is enabled
  let [audio, setAudio] = useState(); // Whether audio is enabled
  let [screen, setScreen] = useState(); // For screen sharing stream
  let [screenAvailable, setScreenAvailable] = useState(); // Whether screen sharing is available

  // UI state variables
  let [showModal, setShowModel] = useState(); // For showing/hiding modals
  let [messages, setMessages] = useState([]); // Chat messages
  let [message, setMessage] = useState(); // Current message being typed
  let [newMessage, setNewMessage] = useState(0); // Counter for new messages
  let [askForUserName, setAskForUsername] = useState(true); // Whether to show username prompt
  let [username, setUsername] = useState(""); // User's chosen username

  // Video display state
  let [videos, setVideos] = useState([]); // Array of remote video streams
  const videoRef = useRef([]); // References to remote video elements

  /**
   * Requests camera and microphone permissions and sets up local stream
   */
  const getPermissions = async () => {
    try {
      // Check for video permission
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      // Check for audio permission
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      // Check if screen sharing is available
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      // If either video or audio is available, get the media stream
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream; // Store stream globally
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream; // Display local video
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Request permissions when component mounts
  useEffect(() => {
    getPermissions();
  }, []);

  // Placeholder for handling successful media stream acquisition
  let getUserMediaSuccess = (stream) => {
    // Responsible for ---> maine apne audio/video ko band kiya hai...jutni baaki saari devices hai vaha pr bhi ise band karvao
  };

  /**
   * Gets user media (camera/mic) based on current settings
   */
  let getUserMedia = () => {
    // this is not lobby...it is after entering the lobby
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess) // TODO :Implement getUserMediaSuccess
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        // Stop all tracks if media is disabled
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());

        // This releases hardware resources (camera/mic)
        // Turns off camera indicator light
        // Completely ends the permission to use these devices
        // Important for both resource management and user privacy
        // Similar to hanging up a call vs just muting yourself
      } catch (e) {}
    }
  };

  // Update media stream when audio or video settings change
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  /**
   * Initializes media and would connect to socket server
   */
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    // connectToSocketServer(); // TODO: Implement this function
  };

  /**
   * Handles the connect button click
   */
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {/* Conditional rendering based on username state - incomplete */}
      {askForUserName === true}

      <h2>Enter into Lobby</h2>
      {/* Username input field */}
      <TextField
        id="outlined-basic"
        label="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        variant="outlined"
      />
      {/* Connect button to join the meeting */}
      <Button variant="contained" onClick={connect}>
        Connect
      </Button>

      <div>
        {/* Local video display */}
        <video ref={localVideoRef} autoPlay muted></video>
      </div>
    </div>
  );
};

export default VideoMeet;
