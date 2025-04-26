import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyAlsMiFO3-NyQ8aRoBdXUwv3AAjeEprJlM",
    authDomain: "hospitalmanagement-3dcb3.firebaseapp.com",
    projectId: "hospitalmanagement-3dcb3",
    storageBucket: "hospitalmanagement-3dcb3.firebasestorage.app",
    messagingSenderId: "345238179108",
    appId: "1:345238179108:web:9745ca307e426330b8b7b1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Example Arrays for surgery types and anesthesia types
const surgeryTypes = ["Appendectomy", "Gallbladder Removal", "Heart Bypass", "Hip Replacement"];
const anesthesiaTypes = ["General", "Local", "Epidural"];

// Fetch and Display Surgery Info for Assigned Doctor
auth.onAuthStateChanged(user => {
    if (user) {
        const doctorUID = user.uid;

        // Fetch Assigned Surgeries from Firestore
        db.collection("SurgicalInfo")
            .where("doctorUID", "==", doctorUID)
            .get()
            .then(snapshot => {
                const surgeryList = document.getElementById("surgeryList").getElementsByTagName("tbody")[0];
                snapshot.forEach(doc => {
                    const s = doc.data();
                    const row = `
                        <tr>
                            <td>${getRandomFutureDateTime()}</td>
                            <td>${getRandomOTId()}</td>
                            <td>${s.patientName || "N/A"}</td>
                            <td>${getRandomItem(surgeryTypes)}</td>
                            <td>${getRandomItem(anesthesiaTypes)} - ${s.anesthesiologist || "N/A"}</td>
                            <td>${s.reportUrl ? `<a href="${s.reportUrl}" target="_blank">View</a>` : "N/A"}</td>
                        </tr>
                    `;
                    surgeryList.innerHTML += row;
                });
            });
    } else {
        alert("Please login to view surgery information.");
        window.location.href = "registerlogin.html";
    }
});

// Function to Add Surgery Info
document.getElementById("surgeryForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const patientName = document.getElementById("patientName").value;
    const anesthesiologist = document.getElementById("anesthesiologist").value;
    const doctorUID = auth.currentUser.uid;

    db.collection("SurgicalInfo").add({
        doctorUID: doctorUID,
        patientName,
        surgeryType: getRandomItem(surgeryTypes),
        anesthesiologist,
        reportUrl: "", // You can add a report URL if needed
        scheduledAt: getRandomFutureDateTime()
    }).then(() => {
        alert("Surgery info added!");
        window.location.reload(); // Reload to see updated list
    }).catch(error => {
        console.error("Error adding surgery info: ", error);
    });
});

// Utility functions
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomFutureDateTime() {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 7)); // Random future date within a week
    return date.toLocaleString();
}

function getRandomOTId() {
    return "OT-" + Math.floor(Math.random() * 1000);
}
