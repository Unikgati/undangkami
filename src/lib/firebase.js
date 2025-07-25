import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCng39jE_0N5Spco2ADef3xmijpZgyhxCI",
  authDomain: "undangan-digital-38d0b.firebaseapp.com",
  projectId: "undangan-digital-38d0b",
  storageBucket: "undangan-digital-38d0b.appspot.com",
  messagingSenderId: "389804485470",
  appId: "1:389804485470:web:a3f39722d76ca149b8fdcf",
  measurementId: "G-7WCGDGHR0T"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
