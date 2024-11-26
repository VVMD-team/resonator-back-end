import express, { Request, Response } from "express";
import * as ngrok from "@ngrok/ngrok";
import cors from "cors";
import cookieParser from "cookie-parser";

import ngrokConfig from "../src/config/ngrok";

import { PORT, whitelist } from "../src/constants";
import router from "../src/routes";

import errorHandler from "../src/utils/errorHandler";

const app = express();

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (whitelist.indexOf(origin as string) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Dapp Resonator Back End.");
});

app.use(router);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Listening on port ${PORT}`);

  try {
    const listener = await ngrok.forward(ngrokConfig);

    console.log("ngrok url", listener.url());
  } catch (error) {
    console.error("Error starting ngrok:", error);
  }
});
