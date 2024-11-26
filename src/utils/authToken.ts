import { admin } from "../config/firebase";

export const getIdTokenFromCustomToken = async (
  customToken: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: customToken,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();
    return data.idToken || null;
  } catch (error) {
    console.error("Error fetching idToken:", error);
    return null;
  }
};

export const decodeIdToken = async (
  idToken: string
): Promise<admin.auth.DecodedIdToken | null> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error decoding idToken:", error);
    return null;
  }
};
