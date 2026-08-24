const { MongoMemoryServer } = require("mongodb-memory-server");

async function prepareTestMongoDB() {
  const server = await MongoMemoryServer.create();
  await server.stop();
  process.stdout.write("MongoDB test binary is ready.\n");
}

prepareTestMongoDB().catch((error) => {
  console.error("Unable to prepare the MongoDB test binary.", error);
  process.exitCode = 1;
});
