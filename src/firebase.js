// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBSPiXp-NaId99HZkBaApdm8L_Nueqa-gQ",
  authDomain: "brain-quests.firebaseapp.com",
  projectId: "brain-quests",
  storageBucket: "brain-quests.appspot.com",
  messagingSenderId: "875795216296",
  appId: "1:875795216296:web:3d536b945771416c908f9d",
  measurementId: "G-JQ4QB01RH9"
};

// ✅ This initializes the Firebase App once
const app = initializeApp(firebaseConfig);

// ✅ These are what you should import elsewhere
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);
