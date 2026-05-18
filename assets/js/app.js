// =========================
// ASVEORA SHELL CORE (STABLE VERSION)
// =========================

const DEFAULT_PROFILE = "https://username.wheelcorename.xyz";
const DEFAULT_LANDHUB = "https://www.landhubname.app";

const $ = (s) => document.querySelector(s);
const viewer = () => $("#viewer");

// =========================
// STATE RESOLVER (SOURCE OF TRUTH)
// =========================

function getProfile() {
    return localStorage.getItem("asveoraProfile") || DEFAULT_PROFILE;
}

function getLandhub() {
    return localStorage.getItem("asveoraLandHub") || DEFAULT_LANDHUB;
}

function isDefault(value, defaultValue) {
    return !value || value === defaultValue;
}

// =========================
// STARTUP
// =========================

document.addEventListener("DOMContentLoaded", async () => {

    bindUI();
    loadInitialTab();

    await new Promise(r => requestAnimationFrame(r));
    runOnboarding();
});

// =========================
// ONBOARDING FLOW
// =========================

async function runOnboarding() {

    if (typeof promptModal !== "function") {
        console.error("[Shell] promptModal not ready");
        return;
    }

    // PROFILE FIRST
    if (!localStorage.getItem("asveoraProfile")) {

        const profile = await promptModal(
            "Enter Asveora Profile Address",
            DEFAULT_PROFILE
        );

        if (profile) {
            localStorage.setItem("asveoraProfile", profile);
        }
    }

    // LANDHUB SECOND
    if (!localStorage.getItem("asveoraLandHub")) {

        const landhub = await promptModal(
            "Enter LandHub Address",
            DEFAULT_LANDHUB
        );

        if (landhub) {
            localStorage.setItem("asveoraLandHub", landhub);
        }
    }
}

// =========================
// UI BINDING
// =========================

function bindUI() {

    $(".logo-btn").onclick = () => open("https://www.asveora.social/");
    $(".home-btn").onclick = goHome;
    $(".profile-btn").onclick = goProfile;

    $(".dropdown-btn").onclick = toggleDropdown;

    $(".switch-profile-btn").onclick = () =>
        promptModal(
            "Enter Profile Address",
            getProfile(),
            (v) => {
                if (v) localStorage.setItem("asveoraProfile", v);
            }
        );

    $(".switch-landhub-btn").onclick = () =>
        promptModal(
            "Enter LandHub Address",
            getLandhub(),
            (v) => {
                if (v) localStorage.setItem("asveoraLandHub", v);
            }
        );

    $(".reset-btn").onclick = reset;
    $(".about-btn").onclick = about;
    $(".add-tab-btn").onclick = addTab;

    $("#tabs-container").onclick = handleTabs;
}

// =========================
// NAVIGATION (FIXED)
// =========================

function open(url) {
    if (!url) return;
    viewer().src = url;
}

function goProfile() {

    const profile = getProfile();

    if (isDefault(profile, DEFAULT_PROFILE)) {

        promptModal(
            "Profile Not Set",
            "You need to set a Profile Address first.",
            (v) => {

                if (!v) return;

                localStorage.setItem("asveoraProfile", v);

                // 🔥 re-run navigation immediately with new value
                viewer().src = v;
            }
        );

        return;
    }

    viewer().src = profile;
}

function goHome() {

    const landhub = getLandhub();

    if (isDefault(landhub, DEFAULT_LANDHUB)) {

        promptModal(
            "LandHub Not Set",
            "You need to set a LandHub Address first.",
            (v) => {

                if (!v) return;

                localStorage.setItem("asveoraLandHub", v);

                // 🔥 immediately navigate after save
                viewer().src = v;
            }
        );

        return;
    }

    viewer().src = landhub;
}

// =========================
// TABS
// =========================

function handleTabs(e) {

    const tab = e.target.closest(".tab-btn");
    if (!tab) return;

    if (e.target.classList.contains("tab-close")) {
        tab.remove();
        return;
    }

    document.querySelectorAll(".tab-btn")
        .forEach(t => t.classList.remove("active-tab"));

    tab.classList.add("active-tab");

    open(tab.dataset.url);
}

function addTab() {

    promptModal("Tab Name", "New Tab", (name) => {
        if (!name) return;

        promptModal("Tab URL", "https://", (url) => {
            if (!url) return;

            const btn = document.createElement("button");
            btn.className = "tab-btn";
            btn.dataset.url = url;
            btn.innerHTML = `${name} <span class="tab-close">×</span>`;

            $("#tabs-container").appendChild(btn);
        });
    });
}

// =========================
// DROPDOWN
// =========================

function toggleDropdown() {
    $("#switch-menu")?.classList.toggle("show");
}

// =========================
// RESET
// =========================

function reset() {

    confirmModal(
        "Reset all user data?",
        (ok) => {
            if (!ok) return;

            localStorage.removeItem("asveoraProfile");
            localStorage.removeItem("asveoraLandHub");
            localStorage.removeItem("asveoraOnboarded");

            location.reload();
        }
    );
}

// =========================
// ABOUT
// =========================

function about() {

    showModal(`
A lightweight browser shell for navigating the Asveora Ecosystem.

**Version**

v0.5.0  

**Author(s)**

AmzroSevca  

**Repository**

<a href="https://github.com/asveora/browser-shell-client" target="_blank">https://github.com/asveora/browser-shell-client</a>

**User HandBook**

• Some websites will not load within the shell client because not all websites support iframe viewing!
`);
}

// =========================
// MODAL ENGINE (UNCHANGED)
// =========================

const modal = $("#modal");
const title = $("#modal-title");
const body = $("#modal-body");
const input = $("#modal-input");

const yesBtn = $("#modal-yes");
const noBtn = $("#modal-no");

function showModal(markdown) {

    modal.classList.remove("hidden");

    title.innerText = "About Asveora Shell Client";
    body.innerHTML = markdownToHTML(markdown);

    input.style.display = "none";
    yesBtn.style.display = "none";
    noBtn.innerText = "Close";

    noBtn.onclick = closeModal;
}

function confirmModal(text, cb) {

    modal.classList.remove("hidden");

    title.innerText = text;

    body.innerHTML = "";
    input.style.display = "none";

    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    yesBtn.innerText = "Yes";
    noBtn.innerText = "No";

    yesBtn.onclick = () => {
        closeModal();
        cb(true);
    };

    noBtn.onclick = () => {
        closeModal();
        cb(false);
    };
}

function promptModal(titleText, placeholder, cb) {

    modal.classList.remove("hidden");

    title.innerText = titleText;

    body.innerHTML = "";

    input.style.display = "block";
    input.value = "";
    input.placeholder = placeholder;
    input.focus();

    yesBtn.style.display = "inline-block";
    noBtn.style.display = "inline-block";

    yesBtn.innerText = "OK";
    noBtn.innerText = "Cancel";

    yesBtn.onclick = () => {
        const val = input.value;
        closeModal();
        cb(val);
    };

    noBtn.onclick = () => {
        closeModal();
        cb(null);
    };
}

function closeModal() {
    modal.classList.add("hidden");
}

// =========================
// MARKDOWN
// =========================

function markdownToHTML(md) {
    return md
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}