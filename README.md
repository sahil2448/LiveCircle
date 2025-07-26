# LiveCircle# Real‑Time Video Conferencing App

A modern, secure, real‑time video‑conferencing application built with the MERN stack and Socket.io.

---

## 📋 About

This application enables peer‑to‑peer video conferencing with integrated in‑call chat. It leverages WebRTC for low‑latency media streams, Socket.io for signaling and messaging, and JWT for authentication & authorization.

**Timeline:** May 2025 – June 2025

---

## ✨ Features

- **Peer‑to‑Peer Video Calls**  
  Establish direct WebRTC connections for crystal‑clear, low‑latency video & audio.

- **In‑Call Chat**  
  Real‑time text messaging alongside video—facilitates collaboration without leaving the meeting.

- **Secure Access**  
  JWT‑based login flow ensures only authenticated users can create or join rooms.

- **Room Management**  
  Create, join, and leave meeting rooms; dynamic user lists update on connect/disconnect.

- **Scalable Signaling**  
  Socket.io channels handle WebRTC offer/answer exchange and ICE candidate negotiation.

---

## 🛠 Tech Stack

- **Frontend**  
  - React  
  - Tailwind CSS (optional)  
  - WebRTC APIs  

- **Backend**  
  - Node.js + Express  
  - MongoDB (Mongoose)  
  - Socket.io  

- **Authentication**  
  - JSON Web Tokens (JWT)  

---

## 🏁 Getting Started

### Prerequisites

- Node.js ≥ 14.x  
- npm or yarn  
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/LiveCircle.git
   cd LiveCircle
1. **Install node_modules**  
   ```bash
   cd backend
     npm install
   cd frontend
     npm install
