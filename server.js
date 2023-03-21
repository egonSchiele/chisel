import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

app.post("/api/expand", async (req, res) => {
  fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: req.body.prompt,
      max_tokens: 50,
      model: "text-davinci-003",
    }),
  }).then((result) => {
    console.log({ result });
    result.json().then((json) => {
      console.log({ json });
      res.json(json);
    });
  });
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Server running on port ${port}`));
