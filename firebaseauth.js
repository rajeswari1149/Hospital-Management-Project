import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
 const firebaseConfig = {
    apiKey: YOUR-API-KEY,
    authDomain: YOUR-AUTH-DOMAIN,
    projectId: YOUR-PROJECT-ID,
    storageBucket: YOUR-STORAGE-BUCKET,
    messagingSenderId: YOUR-MESSAGING-ID,
    appId: YOUR-API-ID
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// SIGN UP
const signUpBtn = document.getElementById("signUpBtn");
signUpBtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-pass").value;
  const specialisation = document.getElementById("specialisation").value;
  const availability = document.getElementById("availability").value;

  if (!document.getElementById("agree").checked) {
    alert("Please agree to the terms & conditions.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra data in Firestore
    await setDoc(doc(db, "Users", user.uid), {
      name,
      email,
      specialisation,
      availability,
      role: "user" // or "doctor" depending on your use case
    });

    alert("Registration successful!");
    console.log("User Registered & Data Saved:", user);

    // Clear input fields
    document.getElementById("reg-name").value = "";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-pass").value = "";
    document.getElementById("specialisation").value = "";
    document.getElementById("availability").value = "";
    document.getElementById("agree").checked = false;

  } catch (error) {
    console.error(error.message);
    alert("Registration failed: " + error.message);
  }
});

// SIGN IN
const signInBtn = document.getElementById("signInBtn");
signInBtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const email = document.getElementById("log-email").value;
  const password = document.getElementById("log-pass").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDocRef = doc(db, "Users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;

      alert("Login successful!");
      console.log("Logged in:", user);

      // Redirect based on role
      if (role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "doctor-dashboard.html";
      }

    } else {
      alert("No user data found.");
    }

  } catch (error) {
    console.error(error.message);
    alert("Login failed: " + error.message);
  }
});
