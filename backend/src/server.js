const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');

const PORT = config.port;

async function startServer() {
  console.log(`\n🏥 TeleHealth Portal API Server`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);

  // Connect to MongoDB
  console.log('\n🔌 Connecting to MongoDB...');
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server is listening at http://localhost:${PORT}\n`);
  });
}

startServer();
