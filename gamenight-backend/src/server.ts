import "dotenv/config";
import app from "./app";
import prisma from "./utils/prisma";

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`🚀 GameNight API running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

start();
