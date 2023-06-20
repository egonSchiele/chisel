import { WriteStream } from "fs";

import { nanoid } from "nanoid";
import settings from "../../settings.js";
import {
  PollyClient,
  SynthesizeSpeechCommand,
  StartSpeechSynthesisTaskCommand,
  GetSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";

const region = "us-west-2";
const polly = new PollyClient({
  region,
  credentials: {
    accessKeyId: settings.awsAccessKeyId,
    secretAccessKey: settings.awsSecretAccessKey,
  },
});

export async function textToSpeech(text, outputFileName, res) {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: text,
    VoiceId: "Joanna",
  });

  try {
    const response = await polly.send(command);
    const audioStream = response.AudioStream;
    const outputStream = new WriteStream(outputFileName);
    audioStream.pipe(outputStream);

    return new Promise(function (resolve, reject) {
      outputStream.on("finish", () => {
        console.log(`Speech saved to: ${outputFileName}`);
        resolve(outputFileName);
      });
      outputStream.on("error", (err) => {
        console.error(`Failed saving speech to: ${outputFileName}`);
        reject(err);
      });
    });
  } catch (err) {
    console.error("Error occurred while converting text to speech:", err);
  }
}
