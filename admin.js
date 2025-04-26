import {
    initializeApp
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import {
    getAuth,
    signOut
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyAlsMiFO3-NyQ8aRoBdXUwv3AAjeEprJlM",
    authDomain: "hospitalmanagement-3dcb3.firebaseapp.com",
    projectId: "hospitalmanagement-3dcb3",
    storageBucket: "hospitalmanagement-3dcb3.firebasestorage.app",
    messagingSenderId: "345238179108",
    appId: "1:345238179108:web:9745ca307e426330b8b7b1"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // DOM Elements
  const doctorTableBody = document.getElementById('doctorTableBody');
  const patientTableBody = document.getElementById('patientTableBody');
  const patientForm = document.getElementById('addPatientForm');
  const doctorListGroup = document.getElementById('doctorListGroup');
  
  let doctors = []; // Cache for doctor list
  let editingPatientId = null; // For tracking edit mode

  const dateElement = document.getElementById("currentDate");
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', options);
  dateElement.textContent = today;
  
  // Load Doctors
  async function loadDoctors() {
    doctorTableBody.innerHTML = "";
    doctors = [];
    const snapshot = await getDocs(collection(db, "Users"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.role === "user") {
        const doctor = { id: docSnap.id, ...data };
        doctors.push(doctor);
        const row = `
          <tr>
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${data.specialisation}</td>
            <td>${data.availability}</td>
            <td>
              <button class="btn btn-sm btn-primary me-2" onclick="editDoctor('${doctor.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${doctor.id}')">Delete</button>
            </td>
          </tr>
        `;
        doctorTableBody.innerHTML += row;
      }
    });
  }
  
  // Load Patients
  async function loadPatients() {
    patientTableBody.innerHTML = "";
    const snapshot = await getDocs(collection(db, "Patients"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = `
        <tr>
          <td>${data.name}</td>
          <td>${data.age}</td>
          <td>${data.gender}</td>
          <td>${data.illness}</td>
          <td>${data.contact}</td>
          <td>${data.status || "Pending"}</td>
          <td>${data.assignedDoctor || "Not Assigned"}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick="editPatient('${docSnap.id}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deletePatient('${docSnap.id}')">Delete</button>
            <button class="btn btn-sm btn-primary" onclick="openAssignDoctorModal('${docSnap.id}')">Assign Doctor</button>
          </td>
        </tr>
      `;
      patientTableBody.innerHTML += row;
    });
  }
  
  // Add or Update Patient
  patientForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const updatedPatient = {
      name: patientForm.patientName.value,
      age: parseInt(patientForm.patientAge.value),
      gender: patientForm.patientGender.value,
      illness: patientForm.patientIllness.value,
      contact: patientForm.patientContact.value,
      status: "Pending",
      assignedDoctor: ""
    };
  
    if (editingPatientId) {
      // Update existing patient
      await updateDoc(doc(db, "Patients", editingPatientId), updatedPatient);
      alert("Patient updated successfully!");
      editingPatientId = null;
      patientForm.querySelector("button[type='submit']").textContent = "Add Patient";
    } else {
      // Add new patient
      await addDoc(collection(db, "Patients"), updatedPatient);
      alert("Patient added successfully!");
    }
  
    patientForm.reset();
    loadPatients();
  });
  
  // Delete Patient
  window.deletePatient = async (id) => {
    await deleteDoc(doc(db, "Patients", id));
    loadPatients();
  };
  
  // Assign Doctor Modal
  window.openAssignDoctorModal = async (patientId) => {
    const modal = new bootstrap.Modal(document.getElementById("assignDoctorModal"));
    doctorListGroup.innerHTML = "";
  
    doctors.forEach(doctor => {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item d-flex justify-content-between align-items-center";
      listItem.innerHTML = `
        ${doctor.name} - ${doctor.specialisation}
        <button class="btn btn-sm btn-success">Assign</button>
      `;
      listItem.querySelector("button").addEventListener("click", async () => {
        await updateDoc(doc(db, "Patients", patientId), {
          assignedDoctor: doctor.name,
          status: "Assigned"
        });
        modal.hide();
        loadPatients();
      });
      doctorListGroup.appendChild(listItem);
    });
  
    modal.show();
  };

  function editDoctor(doctorId) {
    console.log("Edit doctor with ID:", doctorId);
    // Open modal or form to edit details
  }
  
  function deleteDoctor(doctorId) {
    if (confirm("Are you sure you want to delete this doctor?")) {
      console.log("Deleting doctor with ID:", doctorId);
      // Call Firestore delete logic here
    }
  }
  
  
  // Edit Patient (prefills form)
  window.editPatient = async (id) => {
    const patientDoc = await getDoc(doc(db, "Patients", id));
    const data = patientDoc.data();
  
    // Fill form
    patientForm.patientName.value = data.name;
    patientForm.patientAge.value = data.age;
    patientForm.patientGender.value = data.gender;
    patientForm.patientIllness.value = data.illness;
    patientForm.patientContact.value = data.contact;
  
    editingPatientId = id;
    patientForm.querySelector("button[type='submit']").textContent = "Update Patient";
  };
  
  // Logout
  window.logout = () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  };
  
  // Load Initial Data
  loadDoctors();
  loadPatients();  