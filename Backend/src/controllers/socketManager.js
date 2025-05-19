/*
SOCKET.IO AND WEBRTC IMPLEMENTATION EXPLAINED

CORE CONCEPTS:
- Socket.io: Provides real-time communication between clients and server
- Connections object: Maps room paths to arrays of socket IDs
- Messages object: Stores chat history for each room
- WebRTC: Handles peer-to-peer media streaming (signaling coordinated through Socket.io)

SOCKET.IO METHODS:
- socket.on(): Listens for events from a specific client
- io.to().emit(): Sends message to specific client(s)
- socket.emit(): Sends message back to the sender

EVENT FLOW:
1. Client connects to server → socket "connection" event fires
2. Client joins a call → "join-call" event with room path
3. Server tracks connection in connections[path] array
4. Server notifies all users in room → "user-joined" event
5. WebRTC signaling occurs through "signal" events
6. Chat messages handled through "chat-message" events
7. User disconnects → "disconnect" event, cleanup occurs

OBJECT ITERATION:
- Object.entries() converts objects to [key, value] arrays for iteration
- reduce() method used to find which room contains a specific socket ID
- JSON.parse(JSON.stringify()) creates deep copy to avoid modification during iteration

ROOM MANAGEMENT:
- Each path string represents a separate video call room
- Users in same room can exchange messages and WebRTC signals
- Empty rooms are automatically cleaned up on disconnect
*/

// import { connections } from "mongoose";
import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};
export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }
      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      // connections[path].forEach((ele) => {
      //   io.to(ele);
      // });
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });
    //  io.to(toId).emit("signal", socket.id, message) sends signaling data to a specific user

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections) // I will get the all entries of connections... Here i need to find Matching room and the user in the room....to send the reply back..because we have recieved a message from client side
        .reduce(
          ([room, isFound], [roomKey, roomValue]) => {
            if (!isFound && roomValue.includes(socket.id)) {
              return [roomKey, true];
            }
            return [room, isFound];
          },
          ["", false]
        );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });
        console.log("message", KeyboardEvent, ":", sender, data);

        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    /*
UNDERSTANDING THE REDUCE FUNCTION

The reduce() method in this code finds which room a socket belongs to:

const [matchingRoom, found] = Object.entries(connections)
  .reduce(
    ([room, isFound], [roomKey, roomValue]) => {
      if (!isFound && roomValue.includes(socket.id)) {
        return [roomKey, true];
      }
      return [room, isFound];
    },
    ["", false]
  );

HOW IT WORKS:
1. Object.entries(connections) converts the connections object to an array of [key, value] pairs
   Example: { "room1": ["socket1", "socket2"] } becomes [["room1", ["socket1", "socket2"]]]

2. reduce() processes this array with:
   - Initial value: ["", false] (empty room name and "not found" flag)
   - Accumulator: [room, isFound] (tracks our search progress)
   - Current item: [roomKey, roomValue] (current room being checked)

3. For each room, it checks:
   - If we haven't found the socket yet (!isFound)
   - If current room contains the socket ID (roomValue.includes(socket.id))

4. If both conditions are true:
   - Returns [roomKey, true] (found the room and marks it as found)
   - Otherwise, returns unchanged accumulator

5. Result after processing all rooms:
   - matchingRoom: Name of room containing the socket (or empty if not found)
   - found: Boolean indicating if socket was found in any room

This approach efficiently searches all rooms in a single pass and stops
effectively once the socket is found by not changing the result in later iterations.
*/

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());

      var key; // it is to track the matching room here

      for (const [room, persons] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < persons.length; ++a) {
          if (persons[a] === socket.id) {
            key = room;
            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
              var index = connections[key].indexOf(socket.id);
              connections[key].splice(index, 1);

              if (connections[key].length === 0) {
                delete connections[key];
              }
            }
          }
        }
      }
    });
  });

  return io;
};

// Common Issues with WebRTC and Socket.io
// Understanding event flow: Socket.io events can be confusing at first. Remember that socket.on() listens for events, while socket.emit() and io.to().emit() send events.

// Room management: Your code uses a custom room system rather than Socket.io's built-in rooms, which is fine but requires manual tracking.

// Visualizing the frontend: The frontend would need to handle:

// Joining calls with a unique path

// Sending/receiving WebRTC signals

// Displaying video streams

// Sending/displaying chat messages

// Debugging: Use console logs to track events and data flow between clients and server.

// This implementation creates a solid foundation for a WebRTC application, handling the critical signaling process needed to establish peer connections.
