document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------
       FORM FIELDS
    ------------------------- */
  const profilePhotoInput = document.getElementById("profilePhoto");
  const fullName = document.getElementById("fullName");
  const jobTitle = document.getElementById("jobTitle");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const address = document.getElementById("address");
  const linkedin = document.getElementById("linkedin");
  const website = document.getElementById("website");
  const summary = document.getElementById("summary");
  const skills = document.getElementById("skills");

  const experienceListEl = document.getElementById("experience-list");
  const educationListEl = document.getElementById("education-list");
  const projectsListEl = document.getElementById("projects-list");

  /* ------------------------
       PREVIEW FIELDS
    ------------------------- */
  const previewPhoto = document.getElementById("preview-photo");
  const previewName = document.getElementById("preview-name");
  const previewTitle = document.getElementById("preview-title");
  const previewEmail = document.getElementById("preview-email");
  const previewPhone = document.getElementById("preview-phone");
  const previewAddress = document.getElementById("preview-address");
  const previewLinkedin = document.getElementById("preview-linkedin");
  const previewWebsite = document.getElementById("preview-website");
  const previewSummary = document.getElementById("preview-summary");
  const previewSkillsList = document.getElementById("preview-skills-list");
  const previewExperienceList = document.getElementById(
    "preview-experience-list"
  );
  const previewEducationList = document.getElementById(
    "preview-education-list"
  );
  const previewProjectsList = document.getElementById("preview-projects-list");

  /* ------------------------
       TEMPLATE + ACTION BTNS
    ------------------------- */
  const templateSelect = document.getElementById("template-select");
  const resumePreview = document.getElementById("resume-preview");
  const downloadBtn = document.getElementById("download-pdf");
  const printBtn = document.getElementById("print-resume");
  const loadSampleBtn = document.getElementById("load-sample");
  const resetBtn = document.getElementById("reset-form");
  const saveBtn = document.getElementById("save-resume");
  const loadBtn = document.getElementById("load-resume");
  const removePhotoBtn = document.getElementById("removePhoto");
  const photoDropzone = document.getElementById("photo-dropzone");

  const modal = document.getElementById("item-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalItemTitle = document.getElementById("modal-item-title");
  const modalItemSubtitle = document.getElementById("modal-item-subtitle");
  const modalItemTime = document.getElementById("modal-item-time");
  const modalItemDesc = document.getElementById("modal-item-desc");
  const modalCancel = document.getElementById("modal-cancel");
  const modalSave = document.getElementById("modal-save");

  const templates = [
    "template-1",
    "template-2",
    "template-3",
    "template-4",
    "template-5",
    "template-6",
    "template-7",
    "template-8",
    "template-9",
    "template-10",
    "template-11",
    "template-12",
    "template-13",
    "template-14",
    "template-15",
  ];

  /* ------------------------
       GLOBAL STATE
    ------------------------- */
  const state = {
    experience: [],
    education: [],
    projects: [],
    currentModalSection: null, // 'experience' | 'education' | 'projects'
  };

  const STORAGE_KEY_AUTOSAVE = "resumeGenerator:autoSave";
  const STORAGE_KEY_PREFIX = "resumeGenerator:saved:";
  const STORAGE_KEY_INDEX = "resumeGenerator:saved:index";

  /* ------------------------
       UTILS
    ------------------------- */
  function safeText(value, fallback) {
    const trimmed = (value || "").trim();
    return trimmed.length ? trimmed : fallback;
  }

  function buildSkillsList(value) {
    if (!value) return [];
    return value
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  function renderList(listElement, items, fallback) {
    listElement.innerHTML = "";
    if (!items || items.length === 0) {
      if (fallback) {
        const li = document.createElement("li");
        li.textContent = fallback;
        listElement.appendChild(li);
      }
      return;
    }
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      listElement.appendChild(li);
    });
  }

  function validateEmail(str) {
    if (!str) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  }

  function validateUrl(str) {
    if (!str) return true;
    return /^(https?:\/\/)?[^\s]+\.[^\s]+$/.test(str.trim());
  }

  function validatePhone(str) {
    if (!str) return true;
    return /^[0-9+\-\s]{7,20}$/.test(str.trim());
  }

  function setInputError(el, hasError) {
    if (hasError) {
      el.classList.add("input-error");
    } else {
      el.classList.remove("input-error");
    }
  }
  function hasValidationErrors() {
    return (
      !validateEmail(email.value) ||
      !validatePhone(phone.value) ||
      !validateUrl(linkedin.value) ||
      !validateUrl(website.value)
    );
  }

  /* ------------------------
       UPDATE PREVIEW
    ------------------------- */
  function updatePreview() {
    // Text fields
    previewName.textContent = safeText(fullName.value, "Your Name");
    previewTitle.textContent = safeText(jobTitle.value, "Your Job Title");
    previewEmail.textContent = safeText(email.value, "you@example.com");
    previewPhone.textContent = safeText(phone.value, "+91-9876543210");
    previewAddress.textContent = safeText(
      address.value,
      "City, State, Country"
    );

    previewLinkedin.textContent = safeText(
      linkedin.value,
      "linkedin.com/in/username"
    );
    previewWebsite.textContent = safeText(website.value, "yourportfolio.com");

    previewSummary.textContent = safeText(
      summary.value,
      "Short summary about your skills and experience."
    );

    // Skills
    renderList(
      previewSkillsList,
      buildSkillsList(skills.value),
      "Add your core skills."
    );

    // Dynamic sections
    renderDynamicPreviewSection(
      previewExperienceList,
      state.experience,
      "Add your work experience."
    );
    renderDynamicPreviewSection(
      previewEducationList,
      state.education,
      "Add your education details."
    );
    renderDynamicPreviewSection(
      previewProjectsList,
      state.projects,
      "Add your project details."
    );

    // Autosave on every update
    autoSaveDebounced();
  }

  function renderDynamicPreviewSection(listEl, items, fallbackText) {
    listEl.innerHTML = "";
    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.textContent = fallbackText;
      listEl.appendChild(li);
      return;
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      const lineParts = [];
      if (item.title) lineParts.push(item.title);
      if (item.subtitle) lineParts.push(item.subtitle);
      if (item.time) lineParts.push(item.time);
      const titleLine = lineParts.join(" • ");
      const text = item.desc ? `${titleLine} — ${item.desc}` : titleLine;
      li.textContent = text;
      listEl.appendChild(li);
    });
  }

  function renderDynamicLists() {
    renderDynamicList(experienceListEl, state.experience, "experience");
    renderDynamicList(educationListEl, state.education, "education");
    renderDynamicList(projectsListEl, state.projects, "projects");
  }

  function renderDynamicList(container, items, sectionKey) {
    container.innerHTML = "";
    items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "dynamic-item";

      const main = document.createElement("div");
      main.className = "dynamic-item-main";

      const t = document.createElement("div");
      t.className = "dynamic-item-title";
      t.textContent = item.title || "(No title)";
      main.appendChild(t);

      if (item.subtitle) {
        const st = document.createElement("div");
        st.className = "dynamic-item-subtitle";
        st.textContent = item.subtitle;
        main.appendChild(st);
      }

      if (item.time) {
        const ti = document.createElement("div");
        ti.className = "dynamic-item-time";
        ti.textContent = item.time;
        main.appendChild(ti);
      }

      if (item.desc) {
        const d = document.createElement("div");
        d.className = "dynamic-item-desc";
        d.textContent = item.desc;
        main.appendChild(d);
      }

      const actions = document.createElement("div");
      actions.className = "dynamic-item-actions";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn small danger";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        state[sectionKey].splice(idx, 1);
        renderDynamicLists();
        updatePreview();
      });

      actions.appendChild(delBtn);

      li.appendChild(main);
      li.appendChild(actions);

      container.appendChild(li);
    });
  }

  /* ------------------------
       LISTENERS - Live Update
    ------------------------- */
  [
    fullName,
    jobTitle,
    email,
    phone,
    address,
    linkedin,
    website,
    summary,
    skills,
  ].forEach((el) => el.addEventListener("input", updatePreview));

  // Simple validation on blur
  email.addEventListener("blur", () => {
    setInputError(email, !validateEmail(email.value));
  });
  phone.addEventListener("blur", () => {
    setInputError(phone, !validatePhone(phone.value));
  });
  linkedin.addEventListener("blur", () => {
    setInputError(linkedin, !validateUrl(linkedin.value));
  });
  website.addEventListener("blur", () => {
    setInputError(website, !validateUrl(website.value));
  });

  /* ------------------------
       TEMPLATE CHANGE
    ------------------------- */
  templateSelect.addEventListener("change", () => {
    templates.forEach((t) => resumePreview.classList.remove(t));
    resumePreview.classList.add(templateSelect.value);
    autoSaveDebounced(); // ✅
  });

  /* ------------------------
       LOAD SAMPLE DATA
    ------------------------- */
  loadSampleBtn.addEventListener("click", () => {
    fullName.value = "Amit Yadav";
    jobTitle.value = "Full-Stack Web Developer";
    email.value = "amit.Yadav@example.com";
    phone.value = "+91-3333333333";
    address.value = "Ahemedabad, Gujarat , India";
    linkedin.value = "linkedin.com/in/amit-yadav-dev";
    website.value = "amityadav.dev";

    summary.value =
      "Full-stack web developer focused on clean UI, reusable components, and real-world problem solving.";

    skills.value =
      "HTML, CSS, JavaScript, React, Node.js, MongoDB, Express, Git, Responsive Design";

    state.experience = [
      {
        title: "Full-Stack Developer",
        subtitle: "Freelance",
        time: "2023 – Present",
        desc: "Building web apps with MERN stack and modern UI.",
      },
      {
        title: "Frontend Intern",
        subtitle: "ABC Tech",
        time: "2022 – 2023",
        desc: "Implemented responsive interfaces and reusable components.",
      },
    ];

    state.education = [
      {
        title: "B.Tech – Computer Science",
        subtitle: "XYZ University",
        time: "2020 – 2024",
        desc: "CGPA: 8.5",
      },
      {
        title: "12th – CBSE",
        subtitle: "",
        time: "",
        desc: "Percentage: 86%",
      },
    ];

    state.projects = [
      {
        title: "Resume Generator",
        subtitle: "HTML, CSS, JS",
        time: "",
        desc: "Built an interactive resume generator with live preview.",
      },
      {
        title: "Task Manager",
        subtitle: "MERN Stack",
        time: "",
        desc: "Full-stack CRUD app with authentication.",
      },
    ];

    renderDynamicLists();
    updatePreview();
  });

  /* ------------------------
       PROFILE PHOTO UPLOAD
    ------------------------- */
  function handlePhotoFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewPhoto.src = e.target.result;
      previewPhoto.style.display = "block";
      photoDropzone.style.display = "flex";
      autoSave();
    };
    reader.readAsDataURL(file);
  }

  profilePhotoInput.addEventListener("change", () => {
    const file = profilePhotoInput.files[0];
    handlePhotoFile(file);
  });

  // Drag & Drop
  photoDropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    photoDropzone.classList.add("drag-over");
  });

  photoDropzone.addEventListener("dragleave", () => {
    photoDropzone.classList.remove("drag-over");
  });

  photoDropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    photoDropzone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    handlePhotoFile(file);
  });

  removePhotoBtn.addEventListener("click", () => {
    previewPhoto.src = "";
    previewPhoto.style.display = "none";
    photoDropzone.style.display = "none";
    profilePhotoInput.value = "";
    autoSaveDebounced(); // ✅
  });

  /* ------------------------
       RESET FORM
    ------------------------- */
  resetBtn.addEventListener("click", () => {
    document.getElementById("resume-form").reset();
    previewPhoto.src = "";
    previewPhoto.style.display = "none";
    state.experience = [];
    state.education = [];
    state.projects = [];
    renderDynamicLists();
    localStorage.removeItem(STORAGE_KEY_AUTOSAVE);
    updatePreview();
  });

  /* ------------------------
       MODAL HANDLING (Dynamic Sections)
    ------------------------- */
  document.querySelectorAll(".dynamic-section .add-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionKey = btn.closest(".dynamic-section").dataset.target;
      state.currentModalSection = sectionKey;
      modalTitle.textContent =
        "Add " +
        (sectionKey.charAt(0).toUpperCase() +
          sectionKey.slice(1).replace(/s$/, ""));
      modalItemTitle.value = "";
      modalItemSubtitle.value = "";
      modalItemTime.value = "";
      modalItemDesc.value = "";
      modal.classList.remove("hidden");
    });
  });

  modalCancel.addEventListener("click", () => {
    modal.classList.add("hidden");
    state.currentModalSection = null;
  });

  modalSave.addEventListener("click", () => {
    if (!state.currentModalSection) return;

    const item = {
      title: modalItemTitle.value.trim(),
      subtitle: modalItemSubtitle.value.trim(),
      time: modalItemTime.value.trim(),
      desc: modalItemDesc.value.trim(),
    };

    if (!item.title && !item.desc) {
      alert("At least Title or Description add karo.");
      return;
    }

    state[state.currentModalSection].push(item);
    state.currentModalSection = null;
    modal.classList.add("hidden");
    renderDynamicLists();
    updatePreview();
  });

  // Close modal on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      state.currentModalSection = null;
    }
  });

  /* ------------------------
       LOCAL STORAGE - PRO MODE
    ------------------------- */
  function getFormData() {
    return {
      fullName: fullName.value,
      jobTitle: jobTitle.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      linkedin: linkedin.value,
      website: website.value,
      summary: summary.value,
      skills: skills.value,
      template: templateSelect.value,
      sections: {
        experience: state.experience,
        education: state.education,
        projects: state.projects,
      },
      photoData: previewPhoto.src || "",
    };
  }

  function setFormData(data) {
    if (!data) return;
    fullName.value = data.fullName || "";
    jobTitle.value = data.jobTitle || "";
    email.value = data.email || "";
    phone.value = data.phone || "";
    address.value = data.address || "";
    linkedin.value = data.linkedin || "";
    website.value = data.website || "";
    summary.value = data.summary || "";
    skills.value = data.skills || "";
    if (data.template && templates.includes(data.template)) {
      templateSelect.value = data.template;
      templates.forEach((t) => resumePreview.classList.remove(t));
      resumePreview.classList.add(data.template);
    }

    state.experience = data.sections?.experience || [];
    state.education = data.sections?.education || [];
    state.projects = data.sections?.projects || [];

    if (data.photoData) {
      previewPhoto.src = data.photoData;
      previewPhoto.style.display = "block";
      photoDropzone.style.display = "flex";
    } else {
      previewPhoto.src = "";
      previewPhoto.style.display = "none";
      photoDropzone.style.display = "none";
    }

    renderDynamicLists();
    updatePreview();
  }
  let autoSaveTimer;

  function autoSaveDebounced() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(autoSave, 500);
  }

  function autoSave() {
    const data = getFormData();
    try {
      localStorage.setItem(STORAGE_KEY_AUTOSAVE, JSON.stringify(data));
    } catch (e) {
      console.warn("Autosave failed:", e);
    }
  }

  function getSavedIndex() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INDEX);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setSavedIndex(list) {
    try {
      localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save index:", e);
    }
  }

  saveBtn.addEventListener("click", () => {
    const name = prompt("Enter a name for this resume:");
    if (!name) return;

    const key = STORAGE_KEY_PREFIX + name;
    const data = getFormData();
    try {
      localStorage.setItem(key, JSON.stringify(data));
      const index = getSavedIndex();
      if (!index.includes(name)) {
        index.push(name);
        setSavedIndex(index);
      }
      alert("Resume saved as: " + name);
    } catch (e) {
      console.error(e);
      alert("Save karte time issue aaya.");
    }
  });

  loadBtn.addEventListener("click", () => {
    const index = getSavedIndex();
    if (!index.length) {
      alert("Koi saved resume nahi mila.");
      return;
    }
    const listText =
      "Saved resumes:\n" +
      index.map((n) => "- " + n).join("\n") +
      "\n\nType name to load:";
    const name = prompt(listText);
    if (!name) return;
    if (!index.includes(name)) {
      alert("Ye naam saved list me nahi hai.");
      return;
    }
    const key = STORAGE_KEY_PREFIX + name;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        alert("Data nahi mila.");
        return;
      }
      const data = JSON.parse(raw);
      setFormData(data);
      alert("Loaded: " + name);
    } catch (e) {
      console.error(e);
      alert("Load karte time issue aaya.");
    }
  });

  // Try to restore autosave on first load
  (function restoreAutoSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
      if (!raw) return;
      const data = JSON.parse(raw);
      setFormData(data);
    } catch (e) {
      console.warn("Failed to restore autosave:", e);
    }
  })();

  /* ------------------------
       DOWNLOAD PDF (Multi-page Mode)
    ------------------------- */

  downloadBtn.addEventListener("click", async () => {
    if (hasValidationErrors()) {
      alert("Please check Email / Phone / Links. Kuch galat hai.");
      return;
    }
    try {
      const resumeElement = document.getElementById("resume-preview");
      const { jsPDF } = window.jspdf;

      const canvas = await html2canvas(resumeElement, {
        scale: window.devicePixelRatio >= 2 ? 3 : 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const name = fullName.value.trim().replace(/\s+/g, "_") || "Resume";
      pdf.save(name + "_Resume.pdf");
    } catch (err) {
      console.error(err);
      alert("High quality PDF generate nahi ho paayi.");
    }
  });

  /* ------------------------
       PRINT
    ------------------------- */
  printBtn.addEventListener("click", () => window.print());

  /* ------------------------
       INITIAL RENDER
    ------------------------- */
  renderDynamicLists();
  updatePreview();
});
