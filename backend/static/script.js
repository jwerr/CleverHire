document.addEventListener("DOMContentLoaded", function () {
  const sidebarItems = document.querySelectorAll(".sidebar-menu .menu-item");
  const contentSections = document.querySelectorAll(".content-section");

  const validSections = ["dashboard", "candidates", "resume-upload"];
  const savedSection = localStorage.getItem("activeSection");
  const defaultSection = validSections.includes(savedSection)
    ? savedSection
    : "dashboard";

  contentSections.forEach((section) => section.classList.remove("active"));
  document.getElementById(`${defaultSection}-section`).classList.add("active");

  function handleSidebarClick(event) {
    event.preventDefault();
    sidebarItems.forEach((item) => item.classList.remove("active"));
    contentSections.forEach((section) => section.classList.remove("active"));

    const targetSection = this.getAttribute("data-section");
    localStorage.setItem("activeSection", targetSection);

    document
      .querySelector(`[data-section="${targetSection}"]`)
      .classList.add("active");
    document.getElementById(`${targetSection}-section`).classList.add("active");
  }

  sidebarItems.forEach((item) => {
    item.addEventListener("click", handleSidebarClick);
  });

  const fileInput = document.getElementById("fileInput");
  const fileUpload = document.getElementById("fileUpload");
  const uploadText = document.getElementById("uploadText");
  const uploadHint = document.getElementById("uploadHint");
  const filePreview = document.getElementById("filePreview");
  const fileNameDisplay = document.getElementById("fileName");
  const removeFileBtn = document.getElementById("removeFile");

  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      fileUpload.classList.add("uploaded");
      uploadText.style.display = "none";
      uploadHint.style.display = "none";
      filePreview.style.display = "block";
      fileNameDisplay.textContent = `Uploaded: ${file.name}`;
    }
  });

  removeFileBtn.addEventListener("click", function () {
    fileInput.value = "";
    fileUpload.classList.remove("uploaded");
    uploadText.style.display = "block";
    uploadHint.style.display = "block";
    filePreview.style.display = "none";
  });

  fetchCandidates();
});

function resetResumeUploadSection() {
  const fileInput = document.getElementById("fileInput");
  const fileUpload = document.getElementById("fileUpload");
  const uploadText = document.getElementById("uploadText");
  const uploadHint = document.getElementById("uploadHint");
  const filePreview = document.getElementById("filePreview");
  const statusMessage = document.getElementById("statusMessage");
  const jobDesc = document.getElementById("jd");

  fileInput.value = "";
  fileUpload.classList.remove("uploaded");
  uploadText.style.display = "block";
  uploadHint.style.display = "block";
  filePreview.style.display = "none";
  statusMessage.textContent = "";
  jobDesc.value = "";
}

async function uploadResume() {
  const uploadButton = document.getElementById("uploadButton");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const statusMessage = document.getElementById("statusMessage");
  const fileInput = document.getElementById("fileInput");
  const jobDesc = document.getElementById("jd");

  loadingSpinner.style.display = "block";
  statusMessage.style.display = "none";
  uploadButton.disabled = true;

  if (!fileInput.files[0] || !jobDesc.value.trim()) {
    alert("Please upload a resume and enter a job description.");
    loadingSpinner.style.display = "none";
    uploadButton.disabled = false;
    return;
  }

  let formData = new FormData();
  formData.append("resume", fileInput.files[0]);
  formData.append("job_desc", jobDesc.value);

  try {
    let response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    let result = await response.json();
    statusMessage.textContent =
      "Resume processed successfully! Match Score: " + result.score;
    statusMessage.style.display = "block";
    statusMessage.classList.remove("error");

    fetchCandidates();
  } catch (error) {
    console.error("Error uploading resume:", error);
    statusMessage.textContent = "Error processing resume. Please try again.";
    statusMessage.style.display = "block";
    statusMessage.classList.add("error");
  } finally {
    uploadButton.disabled = false;
    loadingSpinner.style.display = "none";
    resetResumeUploadSection();
    alert("Score updated, check your dashboard");
  }
}

async function fetchCandidates() {
  try {
    let response = await fetch("http://127.0.0.1:8000/candidates");
    let candidates = await response.json();
    window.allCandidates = candidates;

    let candidatesTableBody = document.querySelector("#candidates-tab tbody");
    candidatesTableBody.innerHTML = "";

    let shortlistedCount = 0;
    let rejectedCount = 0;
    let latestDate = null;
    let totalScore = 0;

    if (!document.getElementById("pdfModal")) {
      const modal = document.createElement("div");
      modal.id = "pdfModal";
      modal.className = "modal";
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-button">&times;</span>
          <iframe id="pdfViewer" src="" frameborder="0"></iframe>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector(".close-button").onclick = () => {
        modal.style.display = "none";
      };
      window.onclick = function (event) {
        if (event.target === modal) {
          modal.style.display = "none";
        }
      };
    }

    const modal = document.getElementById("pdfModal");
    const pdfViewer = document.getElementById("pdfViewer");

    candidates.forEach((candidate) => {
      if (candidate.status === "Shortlisted") shortlistedCount++;
      if (candidate.status === "Rejected") rejectedCount++;
      if (!latestDate || new Date(candidate.applied_on) > new Date(latestDate)) {
        latestDate = candidate.applied_on;
      }
      totalScore += candidate.match_score || 0;

      let row = document.createElement("tr");
      row.innerHTML = `
        <td>${candidate.name}</td>
        <td><div class="match-score ${getMatchScoreClass(
          candidate.match_score
        )}">${candidate.match_score}%</div></td>
        <td>${candidate.applied_on || new Date().toLocaleDateString()}</td>
        <td>
          <select onchange="updateStatus('${candidate.name}', this.value)">
            <option value="Pending" ${candidate.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Shortlisted" ${candidate.status === "Shortlisted" ? "selected" : ""}>Shortlisted</option>
            <option value="Interview Scheduled" ${candidate.status === "Interview Scheduled" ? "selected" : ""}>Interview Scheduled</option>
            <option value="Rejected" ${candidate.status === "Rejected" ? "selected" : ""}>Rejected</option>
            <option value="Hired" ${candidate.status === "Hired" ? "selected" : ""}>Hired</option>
          </select>
        </td>
        <td>
          <div class="action-btn view-btn" data-filename="${candidate.name}">
            <i class="fas fa-eye"></i>
          </div>
          <div class="action-btn delete-btn" onclick="deleteCandidate('${candidate.name}')">
            <i class="fas fa-trash"></i>
          </div>
        </td>
      `;
      candidatesTableBody.appendChild(row);
    });

    // Attach search again
    document.getElementById("candidateSearch").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const rows = document.querySelectorAll("#candidates-tab tbody tr");

      rows.forEach((row) => {
        const name = row.children[0].innerText.toLowerCase();
        const score = row.children[1].innerText.toLowerCase();
        row.style.display =
          name.includes(query) || score.includes(query) ? "" : "none";
      });
    });

    const fuseOptions = {
      keys: ["name", "match_score"],
      threshold: 0.4,
    };

    document.getElementById("candidateSearch").addEventListener("input", function () {
      const query = this.value.trim();
      const tbody = document.querySelector("#candidates-tab tbody");

      if (!query) {
        fetchCandidates(); // Reset table
        return;
      }

      const fuse = new Fuse(window.allCandidates, fuseOptions);
      const results = fuse.search(query).map(r => r.item);

      tbody.innerHTML = "";
      results.forEach(candidate => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${candidate.name}</td>
          <td><div class="match-score ${getMatchScoreClass(
            candidate.match_score
          )}">${candidate.match_score}%</div></td>
          <td>${candidate.applied_on || new Date().toLocaleDateString()}</td>
          <td>
            <select onchange="updateStatus('${candidate.name}', this.value)">
              <option value="Pending" ${candidate.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Shortlisted" ${candidate.status === "Shortlisted" ? "selected" : ""}>Shortlisted</option>
              <option value="Interview Scheduled" ${candidate.status === "Interview Scheduled" ? "selected" : ""}>Interview Scheduled</option>
              <option value="Rejected" ${candidate.status === "Rejected" ? "selected" : ""}>Rejected</option>
              <option value="Hired" ${candidate.status === "Hired" ? "selected" : ""}>Hired</option>
            </select>
          </td>
          <td>
            <div class="action-btn view-btn" data-filename="${candidate.name}">
              <i class="fas fa-eye"></i>
            </div>
            <div class="action-btn delete-btn" onclick="deleteCandidate('${candidate.name}')">
              <i class="fas fa-trash"></i>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    });

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.onclick = function () {
        const filename = this.getAttribute("data-filename");
        pdfViewer.src = `http://127.0.0.1:8000/resume/${filename}`;
        modal.style.display = "block";
      };
    });

    // Dashboard card updates
    document.querySelector(".stat-card:nth-child(1) .stat-value").innerText = candidates.length;
    document.querySelector(".stat-card:nth-child(2) .stat-value").innerText = calculateHighestScore(candidates);
    document.getElementById("shortlistedCount").innerText = shortlistedCount;
    document.getElementById("rejectedCount").innerText = rejectedCount;
    document.getElementById("latestDate").innerText = latestDate || "N/A";
    document.getElementById("averageScore").innerText = candidates.length > 0 ? Math.round(totalScore / candidates.length) : 0;
    

  } catch (error) {
    console.error("Error fetching candidates:", error);
    const statCards = document.querySelectorAll(".stat-card .stat-value");
    if (statCards.length >= 2) {
      statCards[0].innerText = "Error";
      statCards[1].innerText = "Error";
    }
  }
}



async function updateStatus(name, status) {
  try {
    const response = await fetch("http://127.0.0.1:8000/candidates/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update status");
    }
    console.log("Status updated successfully");
  } catch (err) {
    console.error("Status update failed:", err);
    alert("Could not update candidate status");
  }
}

async function deleteCandidate(candidateName) {
  if (confirm("Are you sure you want to delete this candidate?")) {
    try {
      let response = await fetch(
        `http://127.0.0.1:8000/candidates/${candidateName}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        alert("Candidate deleted successfully!");
        fetchCandidates();
      } else {
        alert("Failed to delete candidate. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("An error occurred while deleting the candidate.");
    }
  }
}

function calculateHighestScore(candidates) {
  if (candidates.length === 0) return 0;
  let highestScore = candidates[0].match_score;
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i].match_score > highestScore) {
      highestScore = candidates[i].match_score;
    }
  }
  return highestScore;
}

function getMatchScoreClass(score) {
  if (score >= 90) return "high-match";
  if (score >= 70) return "medium-match";
  return "low-match";
}

function toggleChat() {
  const chatBox = document.getElementById("chat-box");
  chatBox.style.display = chatBox.style.display === "flex" ? "none" : "flex";
}

async function handleChat(e) {
  if (e.key === "Enter") {
    const input = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");
    const question = input.value.trim();
    if (!question) return;

    messages.innerHTML += `<div><b>You:</b> ${question}</div>`;
    input.value = "";

    const res = await fetch("/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: question })
    });

    const data = await res.json();
    messages.innerHTML += `<div><b>AI:</b> ${data.response}</div>`;
    messages.scrollTop = messages.scrollHeight;
  }
}

