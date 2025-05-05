const enviroment = process.env.NODE_ENV;
console.log(`enviroment: ${enviroment}`);
export const isProduction = enviroment === "production";

export const PORT = process.env.PORT;
export const whitelist = [
  "https://escrow.rsntr.io",
  "https://resonator.ngrok.io",
  "https://dapp.rsntr.io",
  "https://resonator-front-end.vercel.app",
  "https://fragma.vercel.app",
  "https://dapp.frgm.io",
  ...(isProduction ? [] : ["http://localhost:3000"]),
];

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not defined");
}

export const serviceAccount = JSON.parse(serviceAccountKey);

export const databaseURL = `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`;
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export const authCookieOptions = {
  httpOnly: true,
  secure: true, // Must be true for cross-origin cookies
  sameSite: "none" as const, // Required for cross-origin cookies
  maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
  path: "/", // Ensure it's available on all paths
};

export const MAX_USER_STORAGE_SIZE = 1000 * 1024 * 1024;
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export const ESCROW_SECONDS_TILL_EXPIRATION = 7 * 24 * 60 * 60; // 7 days

export const authMessage = process.env.AUTH_SIGNATURE_MESSAGE as string;
