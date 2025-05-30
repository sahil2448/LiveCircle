let IS_PROD = true;
const server = IS_PROD
  ? "https://livecirclebackend.onrender.com"
  : "http://localhost:8000";

export default server;
