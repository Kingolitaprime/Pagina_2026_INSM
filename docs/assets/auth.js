(function () {
  "use strict";
  const DOMAIN = "@institutolamerced.edu.ar";
  const ACCOUNTS_KEY = "insm-local-accounts-v1";
  const SESSION_KEY = "insm-session-v1";
  const $ = (id) => document.getElementById(id);
  const form = $("auth-form"), email = $("auth-email"), password = $("auth-password"), confirm = $("auth-confirm");
  const confirmWrap = $("auth-confirm-wrap"), submit = $("auth-submit"), msg = $("auth-message");
  const loginTab = $("tab-login"), registerTab = $("tab-register");
  let mode = "login";

  function normalizeEmail(value) { return value.trim().toLowerCase(); }
  function validInstitutionalEmail(value) {
    const e = normalizeEmail(value);
    return /^[^\s@]+@institutolamerced\.edu\.ar$/.test(e);
  }
  function getAccounts() {
    try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}"); } catch (_) { return {}; }
  }
  function saveAccounts(accounts) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }
  async function hashPassword(value) {
    const data = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  function setMessage(text, type) { msg.textContent = text; msg.className = "auth-message" + (type ? " " + type : ""); }
  function setMode(next) {
    mode = next;
    const register = mode === "register";
    loginTab.classList.toggle("active", !register);
    registerTab.classList.toggle("active", register);
    loginTab.setAttribute("aria-selected", String(!register));
    registerTab.setAttribute("aria-selected", String(register));
    confirmWrap.hidden = !register;
    password.autocomplete = register ? "new-password" : "current-password";
    submit.textContent = register ? "Crear cuenta" : "Iniciar sesión";
    setMessage("", "");
  }
  function saveSession(session) { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }

  loginTab.addEventListener("click", () => setMode("login"));
  registerTab.addEventListener("click", () => setMode("register"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const e = normalizeEmail(email.value);
    if (!validInstitutionalEmail(e)) {
      setMessage("Para crear o usar una cuenta institucional necesitás un correo @institutolamerced.edu.ar.", "error");
      email.focus(); return;
    }
    if (password.value.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.", "error");
      password.focus(); return;
    }
    const accounts = getAccounts();
    if (mode === "register") {
      if (password.value !== confirm.value) { setMessage("Las contraseñas no coinciden.", "error"); confirm.focus(); return; }
      if (accounts[e]) { setMessage("Ya existe una cuenta local con ese correo. Probá iniciar sesión.", "error"); return; }
      accounts[e] = { email: e, passwordHash: await hashPassword(password.value), createdAt: new Date().toISOString() };
      saveAccounts(accounts);
      saveSession({ type: "institutional", email: e });
      setMessage("Cuenta creada en este dispositivo. Redirigiendo...", "success");
    } else {
      if (!accounts[e]) { setMessage("No existe una cuenta local con ese correo en este dispositivo. Primero registrate.", "error"); return; }
      const hash = await hashPassword(password.value);
      if (accounts[e].passwordHash !== hash) { setMessage("El correo o la contraseña no son correctos.", "error"); return; }
      saveSession({ type: "institutional", email: e });
      setMessage("Sesión iniciada. Redirigiendo...", "success");
    }
    setTimeout(() => { window.location.href = "index.html"; }, 500);
  });

  $("anonymous-btn").addEventListener("click", () => {
    saveSession({ type: "anonymous", email: null, createdAt: new Date().toISOString() });
    window.location.href = "index.html";
  });
})();
