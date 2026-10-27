
(function () {
  "use strict";

  const imageUrl = "/images/attractions/rwanda/heritage/kings-palace-museum-nyanza.webp";

  function fix() {
    document.querySelectorAll(".country-place").forEach(card => {
      const heading = card.querySelector("h2,h3,h4");
      if (!heading) return;

      const title = heading.textContent
        .toLowerCase()
        .replace(/[\u2018\u2019']/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

      if (title !== "kings palace museum nyanza") return;
      if (!/rwanda/i.test(card.textContent)) return;

      const existing = card.querySelector("img");

      if (existing) {
        if (existing.getAttribute("src") !== imageUrl) {
          existing.src = imageUrl;
          existing.removeAttribute("srcset");
          existing.removeAttribute("sizes");
        }
        return;
      }

      const placeholder = [...card.querySelectorAll("*")].find(el =>
        el.children.length === 0 &&
        /illustrative destination photo/i.test(el.textContent || "")
      );

      if (!placeholder) return;

      const container = placeholder.parentElement;
      if (!container) return;

      container.style.position = "relative";
      container.style.overflow = "hidden";

      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "King's Palace Museum Nyanza";
      img.loading = "eager";

      Object.assign(img.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        zIndex: "30"
      });

      container.appendChild(img);
    });
  }

  let pending = false;

  function schedule() {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      pending = false;
      fix();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
