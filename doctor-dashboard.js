import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAlsMiFO3-NyQ8aRoBdXUwv3AAjeEprJlM",
  authDomain: "hospitalmanagement-3dcb3.firebaseapp.com",
  projectId: "hospitalmanagement-3dcb3",
  storageBucket: "hospitalmanagement-3dcb3.appspot.com",
  messagingSenderId: "345238179108",
  appId: "1:345238179108:web:9745ca307e426330b8b7b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const assignedPatientsTable = document.getElementById("assignedPatientsTableBody");
const otScheduleTable = document.getElementById("otScheduleTableBody");

// Render patient row
function renderPatientRow(patient, id) {
  return `
    <tr>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.illness}</td>
      <td>${patient.contact}</td>
      <td>${patient.status}</td>
      <td>
        <select class="form-select form-select-sm" data-id="${id}">
          <option ${patient.status === "Under Treatment" ? "selected" : ""}>Under Treatment</option>
          <option ${patient.status === "Recovered" ? "selected" : ""}>Recovered</option>
        </select>
      </td>
    </tr>
  `;
}

// Render OT row
async function renderOTRow(ot) {
  let patientName = "Unknown";
  try {
    const patientDoc = await getDocs(query(collection(db, "Patients"), where("__name__", "==", ot.patientId)));
    if (!patientDoc.empty) {
      patientName = patientDoc.docs[0].data().name;
    }
  } catch (e) {
    console.error("Error fetching patient name:", e);
  }

  return `
    <tr>
      <td>${patientName}</td>
      <td>${new Date(ot.scheduledTime).toLocaleString()}</td>
      <td>${ot.otRoom}</td>
      <td>${ot.anesthesiologist}</td>
      <td>${ot.assistantSurgeon}</td>
      <td>${(ot.nursesInvolved || []).join(", ")}</td>
      <td>${ot.preOpEvents}</td>
      <td>${ot.postOpEvents}</td>
      <td>${(ot.requiredMaterials || []).join(", ")}</td>
    </tr>
  `;
}

// Load assigned patients
async function loadAssignedPatients(doctorName) {
  assignedPatientsTable.innerHTML = "";
  const q = query(collection(db, "Patients"), where("assignedDoctor", "==", doctorName));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    assignedPatientsTable.innerHTML += renderPatientRow(data, docSnap.id);
  });
}

// Load OT schedules
async function loadDoctorOTSchedules(doctorId) {
  otScheduleTable.innerHTML = "";
  const q = query(collection(db, "OTSchedules"), where("doctorId", "==", doctorId));
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const row = await renderOTRow(data);
    otScheduleTable.innerHTML += row;
  }
}

// Listen for dropdown status change
document.addEventListener("change", async (e) => {
  if (e.target.tagName === "SELECT" && e.target.dataset.id) {
    const patientId = e.target.dataset.id;
    const newStatus = e.target.value;
    await updateDoc(doc(db, "Patients", patientId), { status: newStatus });
    alert("Patient status updated!");
  }
});

// Logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// On Auth Change
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDocs(query(collection(db, "Users"), where("email", "==", user.email)));
    const userData = userDoc.docs[0].data();
    const doctorName = userData.name;
    const doctorId = userDoc.docs[0].id;

    document.getElementById("welcomeDoctor").textContent = `Welcome, ${doctorName}`;
    loadAssignedPatients(doctorName);
    loadDoctorOTSchedules(doctorId);
  } else {
    window.location.href = "index.html";
  }
});