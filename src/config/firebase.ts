import { initializeApp } from "firebase/app";
import admin from "firebase-admin";
import { firebaseConfig, databaseURL, serviceAccount } from "../constants";
import { getAuth, signOut, signInWithCustomToken, Auth } from "firebase/auth";
import { Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
  storageBucket: `${firebaseConfig.projectId}.appspot.com`,
});

const db: Firestore = admin.firestore();
const auth: Auth = getAuth();

const storage: Storage = getStorage();

export { getAuth, signOut, db, admin, signInWithCustomToken, auth, storage };
