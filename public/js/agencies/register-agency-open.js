(() => {
  "use strict";

  function revealRegistration() {
    const section = document.getElementById("register");
    if (!section) {
      console.error("Mtaliii: #register not found");
      return;
    }

    section.removeAttribute("hidden");
    section.hidden = false;
    section.style.setProperty("display", "block", "important");
    section.style.setProperty("visibility", "visible", "important");

    const open = () => {
      const top = section.getBoundingClientRect().top
        + window.scrollY - 115;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "auto"
      });
    };

    requestAnimationFrame(open);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#register"]');
    if (!link) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    history.pushState(null, "", "#register");
    revealRegistration();
  }, true);

  window.addEventListener("hashchange", () => {
    if (location.hash === "#register") {
      revealRegistration();
    }
  });

  // Do not automatically open registration on homepage refresh.
})();
