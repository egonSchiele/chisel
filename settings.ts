const path = require("path");

module.exports = {
  openAiApiKey: process.env.OPENAI_API_KEY,
  firebaseServiceAccountKeyPath: path.resolve(
    __dirname,
    "serviceAccountKey.json"
  ),
  storage: "firebase",
};
