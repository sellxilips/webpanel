// src/firebase.js (hoặc tạo một tệp tương tự)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFOid-YSiojjYz-O-WbEjx5yzizoWBprU",
  authDomain: "myapp-75cb3.firebaseapp.com",
  projectId: "myapp-75cb3",
  storageBucket: "myapp-75cb3.appspot.com",
  messagingSenderId: "950420459904",
  appId: "1:950420459904:web:161fc6f26501e102997165"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
