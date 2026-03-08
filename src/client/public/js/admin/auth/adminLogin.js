(function () {
  const form = document.getElementById("adminLoginForm");
  const btn = document.getElementById("loginBtn");

  const box = document.getElementById("loginErrorDropdown");
  const list = document.getElementById("loginErrorList");
  const closeBtn = document.getElementById("closeLoginError");

  const showErrors = (errors) => {
    if (!box || !list) return;
    list.innerHTML = errors.map((e) => `<li>${e}</li>`).join("");
    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hideErrors = () => {
    if (!box || !list) return;
    list.innerHTML = "";
    box.classList.add("hidden");
  };

  closeBtn?.addEventListener("click", hideErrors);
  form?.addEventListener("input", hideErrors, { passive: true });

  const normalize = (v) => String(v ?? "").trim();

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideErrors();

    const email = normalize(form.email?.value).toLowerCase();
    const password = normalize(form.password?.value);

    const errors = [];
    if (!email) errors.push("Email is required.");
    if (!password) errors.push("Password is required.");
    if (password && password.length < 8) errors.push("Password must be at least 8 characters.");

    if (errors.length) {
      showErrors(errors);
      return;
    }

    const original = btn.textContent;
    btn.disabled = true;
    btn.classList.add("opacity-70", "cursor-not-allowed");
    btn.textContent = "Signing in...";

    try {
      const res = await fetch("/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showErrors(json?.errors?.length ? json.errors : ["Invalid email or password."]);
        return;
      }

      window.location.href = "/TMS/dashboard";
    } catch (err) {
      console.error(err);
      showErrors(["Login failed. Please try again."]);
    } finally {
      btn.disabled = false;
      btn.classList.remove("opacity-70", "cursor-not-allowed");
      btn.textContent = original;
    }
  });
})();
