import React, { useReducer, useRef, useState, useEffect } from "react";
import "../styles/VideoMeet.css";
import TextField from "@mui/material/TextField";
const server_url = "http://localhost:8000"; // Backend server URL for signaling
import { Button } from "@mui/material";
import { io } from "socket.io-client";
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

  // TODO
  let gotMessageFromServer = (FromId, message) => {
    // CHECK THE SIGNMA/DELTA-LIBRARY/BUILDING-ZOOM/MUST-TO-READ ... FOR better understanding of this function
    let signal = JSON.parse(message);

    if (FromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[FromId].setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        )
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[FromId].createAnswer()
                .then((description) => {
                  connections[FromId].setLocalDescription(description)
                    .then(() => {
                      socketIdRef.current.emit(
                        "signal",
                        FromId,
                        JSON.stringify({
                          sdp: connections[FromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[FromId].addIceCandidate(
          new RTCIceCandidate(signal.ice)
        ).catch((e) => console.log(e));
      }
    }
  };
  let addMessage = () => {};

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false }); // After connecting with server...socket will give us an id
    //This line creates a connection to your server (running at http://localhost:8000) using Socket.IO. The socketRef is a React reference that will store this connection so you can use it throughout your component. The { secure: false } option indicates you're not using HTTPS for this connection
    socketRef.current.on("signal", gotMessageFromServer);
    // This sets up an event listener for "signal" events from the server. When another user sends you connection information, the server will forward it to you as a "signal" event, and your gotMessageFromServer function will handle it
    socketRef.current.on("connect", () => {
      //This sets up a handler for when you successfully connect to the server. Everything inside this function will run once you're connected.
      socketRef.current.emit("join-call", window.location.href);
      // This line has an error - it should be socketRef.current.emit() instead of socketIdRef.current.emit(). It sends a "join-call" message to the server with the current URL, which tells the server which meeting room you want to join.
      socketIdRef.current = socketRef.current.id;
      //This stores your unique Socket.IO connection ID, which identifies you to other users.
      socketRef.current.on("chat-message", addMessage);
      // This sets up a listener for chat messages from other users, which will call the addMessage function when received.
      socketRef.current.on("user-left", (id) => {
        setVideo(videos.filter((video) => video.socketIdRef !== id));
      });
      // This listens for when other users leave the call. When someone leaves, it removes their video from your display by filtering out the video with their socket ID.
      socketRef.current.on("user-joined", (id, clients) => {
        // This sets up a handler for when new users join the call. The server sends you their ID and a list of all client IDs currently in the call.

        clients.forEach((socketListId) => {
          //This loops through each client ID and sets up a WebRTC connection for each one.

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // This creates a new WebRTC peer connection for each user in the call, using the STUN server configuration defined earlier. The connections object stores all these connections with the socket ID as the key.

          connections[socketListId].onicecandidate = (event) => {
            // Protocol: interactivity connection establishment ---> it is used for direct connection between  clients
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };
          // ICE (Interactive Connectivity Establishment) candidates are possible connection methods between you and another user. This code sends each ICE candidate to the other user through the signaling server when discovered. This helps establish the most efficient direct connection between browsers.
          connections[socketListId].onaddstream = (event) => {
            //This sets up a handler for when a remote video/audio stream is received from another user.
            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId
            );
            //This checks if you already have a video element for this user.

            if (videoExists) {
              setVideo((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };
          // If a video element already exists for this user, it updates the stream. Otherwise, it creates a new video object and adds it to the list of videos to display.

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            // TODO: BLACKSILENCE:
            // let blackSilence;
          }

          // This adds your local video/audio stream to the connection so the other user can see and hear you. If you don't have a local stream yet, there's a placeholder for creating a "black silence" stream (empty video with no audio).
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current
                  .emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }) // sdp: session description
                  )
                  .catch((e) => console.log(e));
              });
            });
          }
        }
        // This section runs only for the user who just joined. It creates "offers" for each existing user in the call. An offer contains session description information (SDP) that describes your media capabilities. This is sent to each other user through the signaling server, starting the WebRTC connection process.
        // There's a bug here - it should be connections[id2].localDescription (lowercase 'l') instead of connections[id2].LocalDescription.

        //         Summary
        // The connectToSocketServer function:
        // 1. Connects to a signaling server using Socket.IO
        // 2. Joins a specific meeting room
        // 3. Sets up handlers for users joining and leaving
        // 4. Creates WebRTC peer connections for each user
        // 5. Handles the exchange of connection information (ICE candidates and session descriptions)
        // 6. Manages the display of remote video streams
        // 7. This is the foundation of how WebRTC works - browsers connect directly to each other for video/audio streaming, but they need a signaling server to coordinate the initial connection setup.
      });
    });
  };

  /**
   * Initializes media and would connect to socket server
   */
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  /**
   * Handles the connect button click
   *
   * This function is called when the user clicks the Connect button. It sets
   * the username state to false, which triggers the rendering of the meeting
   * room interface. It also calls the getMedia function, which requests
   * camera and microphone permissions and sets up the local stream.
   */
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {/* Conditional rendering based on username state - incomplete */}
      {askForUserName === true ? (
        <div>
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
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default VideoMeet;
