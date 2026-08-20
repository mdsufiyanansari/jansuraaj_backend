import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "../firebase-service-account.json" with {
  type: "json",
};

let firebaseApp;

if (getApps().length === 0) {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  firebaseApp = getApps()[0];
}

const adminAuth = getAuth(firebaseApp);

export default adminAuth;