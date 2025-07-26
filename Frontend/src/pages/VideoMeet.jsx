import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { io } from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEnd from "@mui/icons-material/CallEnd";
import Mic from "@mui/icons-material/Mic";
import MicOff from "@mui/icons-material/MicOff";
import ScreenShare from "@mui/icons-material/ScreenShare";
import StopScreenShare from "@mui/icons-material/StopScreenShare";
import Chat from "@mui/icons-material/Chat";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import "../App.css";

// Configuration
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const server_url = "http://localhost:8000"; // Replace with your server URL

const VideoMeet = () => {
  // Refs
  const routeTo = useNavigate();
  const socketRef = useRef(null);
  const socketIdRef = useRef("");
  const localVideoRef = useRef(null);
  const connectionsRef = useRef({});
  const localStreamRef = useRef(null);

  // Media availability state
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  // Media control state
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState(0);
  const [askForUserName, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  // Create black video track
  const createBlackVideoTrack = useCallback((width = 640, height = 480) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
    }
    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];
    track.enabled = false;
    return track;
  }, []);

  // Create silent audio track
  const createSilentAudioTrack = useCallback(() => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return track;
  }, []);

  // Create black silence stream
  const createBlackSilenceStream = useCallback(() => {
    const videoTrack = createBlackVideoTrack();
    const audioTrack = createSilentAudioTrack();
    return new MediaStream([videoTrack, audioTrack]);
  }, [createBlackVideoTrack, createSilentAudioTrack]);

  // Get permissions
  const getPermissions = useCallback(async () => {
    try {
      // Check video permission
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setVideoAvailable(true);
        setVideo(true); // Enable video by default if available
        videoStream.getTracks().forEach((track) => track.stop());
      } catch {
        setVideoAvailable(false);
        setVideo(false);
      }

      // Check audio permission
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setAudioAvailable(true);
        setAudio(true); // Enable audio by default if available
        audioStream.getTracks().forEach((track) => track.stop());
      } catch {
        setAudioAvailable(false);
        setAudio(false);
      }

      // Check screen sharing availability
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      // Don't initialize with black silence here - let the lobby effect handle it
    } catch (error) {
      console.error("Error getting permissions:", error);
    }
  }, []);

  // Update local stream based on current settings
  const updateLocalStream = useCallback(async () => {
    try {
      // Stop current stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      let newStream;

      if ((video && videoAvailable) || (audio && audioAvailable)) {
        // Get user media with current settings
        newStream = await navigator.mediaDevices.getUserMedia({
          video: video && videoAvailable,
          audio: audio && audioAvailable,
        });
      } else {
        // Use black silence stream
        newStream = createBlackSilenceStream();
      }

      localStreamRef.current = newStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }

      // Update all peer connections with new stream
      Object.values(connectionsRef.current).forEach((connection) => {
        // Remove old tracks
        connection.getSenders().forEach((sender) => {
          if (sender.track) {
            connection.removeTrack(sender);
          }
        });

        // Add new tracks
        newStream.getTracks().forEach((track) => {
          connection.addTrack(track, newStream);
        });

        // Create new offer
        connection.createOffer().then((description) => {
          connection.setLocalDescription(description).then(() => {
            if (socketRef.current) {
              socketRef.current.emit(
                "signal",
                Object.keys(connectionsRef.current).find(
                  (id) => connectionsRef.current[id] === connection
                ),
                JSON.stringify({ sdp: connection.localDescription })
              );
            }
          });
        });
      });
    } catch (error) {
      console.error("Error updating local stream:", error);
    }
  }, [video, audio, videoAvailable, audioAvailable, createBlackSilenceStream]);

  // Handle screen sharing
  const updateScreenShare = useCallback(async () => {
    if (!screen) return;

    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = screenStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Handle screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        setScreen(false);
      };

      // Update peer connections
      Object.values(connectionsRef.current).forEach((connection) => {
        connection.getSenders().forEach((sender) => {
          if (sender.track) {
            connection.removeTrack(sender);
          }
        });

        screenStream.getTracks().forEach((track) => {
          connection.addTrack(track, screenStream);
        });

        connection.createOffer().then((description) => {
          connection.setLocalDescription(description).then(() => {
            if (socketRef.current) {
              socketRef.current.emit(
                "signal",
                Object.keys(connectionsRef.current).find(
                  (id) => connectionsRef.current[id] === connection
                ),
                JSON.stringify({ sdp: connection.localDescription })
              );
            }
          });
        });
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
      setScreen(false);
    }
  }, [screen]);

  // Update lobby stream based on current settings - FIXED VERSION
  const updateLobbyStream = useCallback(async () => {
    try {
      // Stop current stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      let newStream;

      // Handle different combinations of video/audio states
      if (video && videoAvailable && audio && audioAvailable) {
        // Both video and audio enabled
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } else if (video && videoAvailable && (!audio || !audioAvailable)) {
        // Only video enabled
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const silentAudioTrack = createSilentAudioTrack();
        newStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          silentAudioTrack,
        ]);
      } else if ((!video || !videoAvailable) && audio && audioAvailable) {
        // Only audio enabled - this was the problematic case
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const blackVideoTrack = createBlackVideoTrack();
        newStream = new MediaStream([
          blackVideoTrack,
          ...audioStream.getAudioTracks(),
        ]);
      } else {
        // Neither video nor audio enabled
        newStream = createBlackSilenceStream();
      }

      localStreamRef.current = newStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Error updating lobby stream:", error);
      // Fallback to black silence on error
      const fallbackStream = createBlackSilenceStream();
      localStreamRef.current = fallbackStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = fallbackStream;
      }
    }
  }, [
    video,
    audio,
    videoAvailable,
    audioAvailable,
    createBlackSilenceStream,
    createSilentAudioTrack,
    createBlackVideoTrack,
  ]);

  // Handle WebRTC signaling
  const handleSignal = useCallback((fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId === socketIdRef.current) return;

    const connection = connectionsRef.current[fromId];
    if (!connection) return;

    if (signal.sdp) {
      connection
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connection.createAnswer().then((description) => {
              connection.setLocalDescription(description).then(() => {
                if (socketRef.current) {
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: connection.localDescription })
                  );
                }
              });
            });
          }
        })
        .catch((error) => console.error("Error handling SDP:", error));
    }

    if (signal.ice) {
      connection
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((error) => console.error("Error adding ICE candidate:", error));
    }
  }, []);

  // Connect to socket server
  const connectToSocketServer = useCallback(() => {
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", handleSignal);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
        setMessages((prev) => [...prev, { sender, data }]);
        if (socketIdSender !== socketIdRef.current) {
          setNewMessage((prev) => prev + 1);
        }
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((video) => video.socketId !== id));
        if (connectionsRef.current[id]) {
          connectionsRef.current[id].close();
          delete connectionsRef.current[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;

          const connection = new RTCPeerConnection(peerConfigConnections);
          connectionsRef.current[socketListId] = connection;

          connection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connection.ontrack = (event) => {
            setVideos((prev) => {
              const existingIndex = prev.findIndex(
                (v) => v.socketId === socketListId
              );
              const newVideo = {
                socketId: socketListId,
                stream: event.streams[0],
                autoPlay: true,
                playsinline: true,
              };

              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newVideo;
                return updated;
              } else {
                return [...prev, newVideo];
              }
            });
          };

          // Add local stream to connection
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
              connection.addTrack(track, localStreamRef.current);
            });
          }
        });

        // Create offers for new connections
        if (id === socketIdRef.current) {
          Object.entries(connectionsRef.current).forEach(
            ([peerId, connection]) => {
              if (peerId === socketIdRef.current) return;

              connection.createOffer().then((description) => {
                connection.setLocalDescription(description).then(() => {
                  if (socketRef.current) {
                    socketRef.current.emit(
                      "signal",
                      peerId,
                      JSON.stringify({ sdp: connection.localDescription })
                    );
                  }
                });
              });
            }
          );
        }
      });
    });
  }, [handleSignal]);

  // Initialize media and connect
  const initializeCall = useCallback(() => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }, [videoAvailable, audioAvailable, connectToSocketServer]);

  // Event handlers
  const handleVideo = () => setVideo((prev) => !prev);
  const handleAudio = () => setAudio((prev) => !prev);
  const handleScreenShare = () => setScreen((prev) => !prev);
  const handleChat = () => {
    setShowModal((prev) => !prev);
    setNewMessage(0);
  };

  const sendMessage = () => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  const handleEndCall = () => {
    // Clean up streams and connections
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    Object.values(connectionsRef.current).forEach((connection) => {
      connection.close();
    });

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Navigate to home (you'll need to implement this based on your routing)
    routeTo("/home");
  };

  const connect = (enteredUsername) => {
    if (enteredUsername.trim()) {
      setAskForUsername(false);
      initializeCall();
    }
  };

  // Effects
  useEffect(() => {
    getPermissions();
  }, [getPermissions]);

  useEffect(() => {
    if (!askForUserName) {
      updateLocalStream();
    }
  }, [video, audio, askForUserName, updateLocalStream]);

  useEffect(() => {
    if (screen && !askForUserName) {
      updateScreenShare();
    }
  }, [screen, askForUserName, updateScreenShare]);

  // Update lobby stream when video/audio settings change in lobby
  useEffect(() => {
    if (askForUserName) {
      updateLobbyStream();
    }
  }, [video, audio, askForUserName, updateLobbyStream]);

  useEffect(() => {
    // Handle local audio muting based on participant count
    if (localVideoRef.current) {
      localVideoRef.current.muted = videos.length > 0;
    }
  }, [videos.length]);

  // Render
  if (askForUserName) {
    return (
      <div
        className="lobbyContainer"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <video
            ref={localVideoRef}
            className="lobbyVideo"
            autoPlay
            muted
            style={{ width: "100%", height: "200px", borderRadius: "10px" }}
          />
        </div>

        <h2>Enter into Lobby</h2>

        <div style={{ margin: "1rem 0" }}>
          <Tooltip title="Video" TransitionComponent={Zoom}>
            <IconButton style={{ color: "black" }} onClick={handleVideo}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="End Call" TransitionComponent={Zoom}>
            <IconButton style={{ color: "red" }} onClick={handleEndCall}>
              <CallEnd />
            </IconButton>
          </Tooltip>

          <Tooltip title="Audio" TransitionComponent={Zoom}>
            <IconButton style={{ color: "black" }} onClick={handleAudio}>
              {audio ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            onKeyPress={(e) => e.key === "Enter" && connect(username)}
          />
          <Button
            variant="contained"
            onClick={() => connect(username)}
            disabled={!username.trim()}
          >
            Connect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        backgroundColor: "#00283fff",
      }}
    >
      {/* Chat Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "350px",
            height: "100vh",
            backgroundColor: "white",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              borderBottom: "1px solid #ccc",
            }}
          >
            <h3>Chat</h3>
            <IconButton onClick={() => setShowModal(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  {msg.sender === username ? "You" : msg.sender}
                </div>
                <div
                  style={{
                    backgroundColor:
                      msg.sender === username ? "#e8f5e8" : "#e3f2fd",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    marginTop: "0.25rem",
                  }}
                >
                  {msg.data}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              padding: "1rem",
              borderTop: "1px solid #ccc",
              gap: "0.5rem",
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
            />
            <IconButton onClick={sendMessage} disabled={!message.trim()}>
              <SendIcon />
            </IconButton>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "1rem",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "1rem",
          borderRadius: "50px",
        }}
      >
        <Tooltip title="Video" TransitionComponent={Zoom}>
          <IconButton style={{ color: "white" }} onClick={handleVideo}>
            {video ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Audio" TransitionComponent={Zoom}>
          <IconButton style={{ color: "white" }} onClick={handleAudio}>
            {audio ? <Mic /> : <MicOff />}
          </IconButton>
        </Tooltip>

        {screenAvailable && (
          <Tooltip title="Screen Share" TransitionComponent={Zoom}>
            <IconButton style={{ color: "white" }} onClick={handleScreenShare}>
              {screen ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
          </Tooltip>
        )}

        <Badge badgeContent={newMessage} max={999} color="secondary">
          <Tooltip title="Chat" TransitionComponent={Zoom}>
            <IconButton style={{ color: "white" }} onClick={handleChat}>
              <Chat />
            </IconButton>
          </Tooltip>
        </Badge>

        <Tooltip title="End Call" TransitionComponent={Zoom}>
          <IconButton style={{ color: "red" }} onClick={handleEndCall}>
            <CallEnd />
          </IconButton>
        </Tooltip>
      </div>

      {/* Video Grid */}
      <div
        style={{
          // display: "grid",
          // gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
          padding: "1rem",
          // height: "calc(100vh - 120px)",
        }}
        className="VideosContainer"
      >
        {/* Local Video */}
        <div>
          <video
            className="videoElement"
            ref={localVideoRef}
            autoPlay
            muted={videos.length > 0} // Only mute when other participants are present
            style={{
              position: "absolute",
              bottom: "8rem",
              left: "1rem",
              // width: "15vw",
              // height: "30vh",
              objectFit: "cover",
              borderRadius: "8px",
              backgroundColor: "black",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "6.5rem",
              left: "1rem",
              color: "white",
              backgroundColor: "rgba(0,0,0,0.7)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.8rem",
            }}
          >
            {username} (You)
          </div>
        </div>

        {/* Remote Videos */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            flexDirection: "row",
            height: "60vh",
            overflowY: "scroll",
          }}
        >
          {videos.map((videoStream) => (
            <div key={videoStream.socketId}>
              <video
                className="remoteVideoElement"
                ref={(ref) => {
                  if (ref && videoStream.stream) {
                    ref.srcObject = videoStream.stream;
                  }
                }}
                autoPlay
                style={{
                  objectFit: "cover",
                  borderRadius: "8px",
                  backgroundColor: "black",
                }}
              />
              <div
                style={{
                  // position: "absolute",
                  // bottom: "0.5rem",
                  // left: "0.5rem",
                  color: "white",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  width: "fit-content",
                }}
              >
                User {videoStream.socketId.slice(-4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoMeet;
