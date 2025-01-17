import WebSocket from "ws";

import { AuthIncomingMessage } from "custom-types/AuthIncomingMessage";
import { getIdTokenFromCustomToken, decodeIdToken } from "utils/authToken";

import { Server } from "http";
import { PORT } from "const";

const userConnections = new Map<string, WebSocket>();

export const startWSServer = (server: Server) => {
  const wss = new WebSocket.Server({
    server,
    verifyClient: async (info, done) => {
      const requestUrl = info.req.url as string;

      const url = new URL(requestUrl, `http://${info.req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        done(false, 401, "Unauthorized");
        return;
      }

      const idToken = await getIdTokenFromCustomToken(token);

      if (!idToken) {
        done(false, 401, "Unauthorized");
        return;
      }

      const decodedToken = await decodeIdToken(idToken);

      if (!decodedToken) {
        done(false, 401, "Unauthorized");
        return;
      }

      const infoReq = info.req as AuthIncomingMessage;
      infoReq.userId = decodedToken.uid;

      done(true);
    },
  });

  wss.on("connection", (ws: WebSocket, req: any) => {
    const userId = req.userId as string;

    if (userId) {
      userConnections.set(userId, ws);
      console.log(`User ${userId} connected to WebSocket`);
    } else {
      console.log("User not authenticated");
      ws.close();
    }

    ws.on("close", () => {
      userConnections.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });

  wss.on("listening", () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
  });
  wss.on("error", (error) => {
    console.log(`Websocket error: ${error}`);
  });

  return wss;
};

type SendMessageToUserData = {
  userId: string;
  message: string;
};
export const sendMessageToUser = ({
  userId,
  message,
}: SendMessageToUserData) => {
  const client = userConnections.get(userId);

  if (client && client.readyState === WebSocket.OPEN) {
    client.send(message);
  }
};
