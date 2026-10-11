import dotenv from "dotenv";
import { createServer } from "node:http";
import app from "./app.js";
import prisma from "./utils/prisma.js";

dotenv.config();

const PORT = process.env.PORT || 3212;
const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Closing server gracefully...`);

  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected.");
  } catch (err) {
    console.error("Error disconnecting Prisma:", err);
  }

  httpServer.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
