import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { config } from "./config.js";

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
      storageBucket: config.firebase.storageBucket,
    });

export const db = getFirestore(app);
export const storage = getStorage(app);
export const timestamp = FieldValue.serverTimestamp;
