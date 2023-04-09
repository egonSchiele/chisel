export default {
  openAiApiKey: "",
  maxMonthlyTokens: 100000,
  storage: "firebase",
  tokenSalt: "",
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
  },
  limits: {
    chapterLength: -1, // in characters
    historyLength: -1,
  },
};
