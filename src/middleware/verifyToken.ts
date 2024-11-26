import { Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";
import { getIdTokenFromCustomToken, decodeIdToken } from "../utils/authToken";

const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const bearer_token = authHeader.split(" ")[1];

  const idToken = await getIdTokenFromCustomToken(bearer_token);

  if (!idToken) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const decodedToken = await decodeIdToken(idToken);

  if (!decodedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.userId = decodedToken.uid;
  next();
};

export default verifyToken;
