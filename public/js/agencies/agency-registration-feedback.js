(() => {
  "use strict";

  function initializeRegistration() {
    const form = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");

    if (!form || !message || form.dataset.registrationReady === "true") {
      return;
    }

    form.dataset.registrationReady = "true";

    // Prevent the browser from submitting sensitive details in the URL.
    form.setAttribute("method", "post");
    form.setAttribute("action", "/api/register");

    form.addEventListener("submit", async event => {
      event.preventDefault();

      if (form.dataset.submitting === "true") return;

      const button = form.querySelector('button.submit');
      const fields = Object.fromEntries(new FormData(form));

      fields.email = String(fields.email || "").trim().toLowerCase();

      form.dataset.submitting = "true";

      message.hidden = false;
      message.dataset.status = "loading";
      message.textContent = "Submitting your agency application...";

      if (button) button.disabled = true;

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(fields)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Registration failed.");
        }

        message.dataset.status = "success";
        message.textContent =
          "✓ Application submitted successfully. Your agency is awaiting administrator approval.";

        form.reset();

      } catch (error) {
        const duplicate = /already registered/i.test(error.message || "");

        message.dataset.status = "error";
        message.textContent = duplicate
          ? "This email is already registered. Please use your existing account."
          : "Registration unsuccessful: " +
            (error.message || "Please try again.");

      } finally {
        form.dataset.submitting = "false";
        if (button) button.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeRegistration);
  } else {
    initializeRegistration();
  }
})();
