import axios from "axios";

const openai = axios.create({
  baseURL: "https://api.openai.com/v1/completions",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export default openai;
