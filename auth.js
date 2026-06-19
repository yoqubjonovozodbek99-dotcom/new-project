window.AcademyAuth = (function () {
  const SESSION_KEY = "mo_academy_session_id";
  let supabase = null;
  let validateTimer = null;

  function config() {
    return window.AUTH_CONFIG || {};
  }

  function isConfigured() {
    const c = config();
    return (
      c.SUPABASE_URL &&
      c.SUPABASE_ANON_KEY &&
      !c.SUPABASE_URL.includes("SIZNING") &&
      !c.SUPABASE_ANON_KEY.includes("SIZNING")
    );
  }

  function isAllowedSite() {
    const c = config();
    if (c.ALLOW_LOCAL) {
      if (location.protocol === "file:") return true;
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return true;
    }
    const hosts = c.ALLOWED_HOSTS || [];
    if (!hosts.length) return true;
    return hosts.includes(location.hostname);
  }

  function getOfficialSiteUrl() {
    return config().SITE_URL || "https://yoqubjonovozodbek99-dotcom.github.io/new-project/";
  }

  function blockIfWrongSite() {
    if (isAllowedSite()) return false;
    return getOfficialSiteUrl();
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!supabase && window.supabase) {
      supabase = window.supabase.createClient(config().SUPABASE_URL, config().SUPABASE_ANON_KEY);
    }
    return supabase;
  }


  function getSessionId() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSessionId(id) {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  async function getAccessToken() {
    const client = getClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function detectIp() {
    try {
      const res = await fetch("https://api.ipify.org?format=json", {
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json();
      return data.ip || "unknown";
    } catch {
      return "unknown";
    }
  }

  async function registerSession() {
    const client = getClient();
    if (!client) throw new Error("Supabase sozlanmagan");

    const ip = await detectIp();

    const { data, error } = await client.rpc("register_user_session", {
      p_ip: ip,
      p_user_agent: navigator.userAgent || "unknown",
    });

    if (error) throw new Error(error.message || "Sessiya ro'yxatdan o'tmadi");
    if (!data?.session_id) throw new Error("Sessiya ro'yxatdan o'tmadi");

    setSessionId(data.session_id);
    return data;
  }

  async function validateSession() {
    const client = getClient();
    const sessionId = getSessionId();
    if (!client || !sessionId) return { valid: false };

    const { data, error } = await client.rpc("validate_user_session", {
      p_session_id: sessionId,
    });

    if (error) return { valid: false, reason: error.message };
    return data;
  }

  function normalizeLogin(input) {
    const v = input.trim();
    if (v.includes("@")) return v;
    const domain = config().LOGIN_DOMAIN || "moacademy.uz";
    return `${v}@${domain}`;
  }

  async function login(emailOrLogin, password) {
    const blocked = blockIfWrongSite();
    if (blocked) throw new Error(`Faqat rasmiy sayt orqali kiring: ${blocked}`);

    const client = getClient();
    if (!client) throw new Error("Supabase sozlanmagan");

    const email = normalizeLogin(emailOrLogin);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await registerSession();
    return data;
  }

  async function logout(message) {
    stopValidation();
    const client = getClient();
    setSessionId(null);
    if (client) await client.auth.signOut();
    const params = message ? `?msg=${encodeURIComponent(message)}` : "";
    window.location.href = `login.html${params}`;
  }

  function startValidation(intervalMs = 30000) {
    stopValidation();
    validateTimer = setInterval(async () => {
      const result = await validateSession();
      if (!result.valid) {
        await logout(result.reason || "Sessiya tugadi");
      }
    }, intervalMs);
  }

  function stopValidation() {
    if (validateTimer) {
      clearInterval(validateTimer);
      validateTimer = null;
    }
  }

  async function requireAuth(page) {
    const blocked = blockIfWrongSite();
    if (blocked) {
      window.location.href = blocked + "login.html";
      return false;
    }

    if (!isConfigured()) {
      window.location.href = "login.html?setup=1";
      return false;
    }

    const client = getClient();
    const { data } = await client.auth.getSession();
    if (!data.session) {
      window.location.href = "login.html";
      return false;
    }

    if (!getSessionId()) {
      try {
        await registerSession();
      } catch {
        await logout("Sessiya xatosi");
        return false;
      }
    }

    const result = await validateSession();
    if (!result.valid) {
      await logout(result.reason || "Kirish rad etildi");
      return false;
    }

    if (page === "admin" && result.role !== "admin") {
      window.location.href = "index.html";
      return false;
    }

    startValidation();
    return result;
  }

  function showUserBar(user) {
    const header = document.querySelector(".header-inner");
    if (!header || document.getElementById("userBar")) return;

    const bar = document.createElement("div");
    bar.id = "userBar";
    bar.className = "user-bar";
    bar.innerHTML = `
      <span class="user-name">${escapeHtml(user.full_name || user.email || "")}</span>
      ${user.role === "admin" ? '<a href="admin.html" class="user-link">Admin</a>' : ""}
      <button type="button" class="user-logout" id="logoutBtn">Chiqish</button>
    `;
    const toggle = document.getElementById("menuToggle");
    if (toggle) header.insertBefore(bar, toggle);
    else header.appendChild(bar);
    document.getElementById("logoutBtn")?.addEventListener("click", () => logout());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return {
    isConfigured,
    isAllowedSite,
    getOfficialSiteUrl,
    blockIfWrongSite,
    getClient,
    login,
    logout,
    validateSession,
    requireAuth,
    loadScript,
    showUserBar,
    getSessionId,
    registerSession,
  };
})();
