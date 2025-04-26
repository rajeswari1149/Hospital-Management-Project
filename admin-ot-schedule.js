import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

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
const storage = getStorage(app);

// DOM Elements
const patientSelect = document.getElementById("patientSelect");
const doctorSelect = document.getElementById("doctorSelect");
const dateTimeInput = document.getElementById("dateTime");
const otRoomSelect = document.getElementById("otRoom");
const anesthesiaTypeInput = document.getElementById("anesthesiaType");
const anesthesiologistInput = document.getElementById("anesthesiologist");
const assistantSurgeonInput = document.getElementById("assistantSurgeon");
const nursesInvolvedInput = document.getElementById("nursesInvolved");
const preOpEventsInput = document.getElementById("preOpEvents");
const postOpEventsInput = document.getElementById("postOpEvents");
const requiredMaterialsInput = document.getElementById("requiredMaterials");
const scheduleBtn = document.getElementById("scheduleBtn");

// Helper functions to render dropdowns for patients and doctors
async function renderPatientOptions() {
  const patientsSnapshot = await getDocs(collection(db, "Patients"));
  patientsSnapshot.forEach(docSnap => {
    const patientData = docSnap.data();
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = patientData.name;
    patientSelect.appendChild(option);
  });
}

async function renderDoctorOptions() {
  const doctorsSnapshot = await getDocs(collection(db, "Users"));
  doctorsSnapshot.forEach(docSnap => {
    const userData = docSnap.data();
    if (userData.role === "user") {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = userData.name;
      doctorSelect.appendChild(option);
    }
  });
}

// Handle logout
function logout() {
  signOut(auth).then(() => {
    window.location.href = "/login"; // Redirect to login page after logout
  }).catch((error) => {
    console.error("Error logging out: ", error);
  });
}

// Handle schedule button click
scheduleBtn.addEventListener("click", async () => {
  const selectedPatientId = patientSelect.value;
  const selectedDoctorId = doctorSelect.value;
  const scheduledTime = dateTimeInput.value;
  const assignedRoom = otRoomSelect.value;
  const anesthesiaType = anesthesiaTypeInput.value;
  const anesthesiologist = anesthesiologistInput.value;
  const assistantSurgeon = assistantSurgeonInput.value;
  const nursesInvolved = nursesInvolvedInput.value.split(','); // Split by commas
  const preOpEvents = preOpEventsInput.value;
  const postOpEvents = postOpEventsInput.value;
  const requiredMaterials = requiredMaterialsInput.value.split(','); // Split by commas

  // Validation
  if (!selectedPatientId || !selectedDoctorId || !scheduledTime || !assignedRoom) {
    alert("Please fill all required fields.");
    return;
  }


  const scheduleData = {
    patientId: selectedPatientId,
    doctorId: selectedDoctorId,
    scheduledTime: scheduledTime,
    otRoom: assignedRoom,
    anesthesiaType: anesthesiaType,
    anesthesiologist: anesthesiologist,
    assistantSurgeon: assistantSurgeon,
    nursesInvolved: nursesInvolved,
    preOpEvents: preOpEvents,
    postOpEvents: postOpEvents,
    requiredMaterials: requiredMaterials,
    status: "Scheduled"
  };

  // Save to Firestore
  try {
    await setDoc(doc(db, "OTSchedules", selectedPatientId), scheduleData);
    alert("Surgery scheduled successfully!");
  } catch (error) {
    console.error("Error scheduling surgery: ", error);
    alert("There was an error scheduling the surgery. Please try again.");
  }
});

// Call the render functions on page load
renderPatientOptions();
renderDoctorOptions();

// Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("welcomeAdmin").textContent = `Welcome, ${user.displayName}`;
  } else {
    window.location.href = "/index"; // Redirect to login if not logged in
  }
});
