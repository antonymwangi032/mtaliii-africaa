
(function () {
  "use strict";

  const photos = {"lake-mburo-national-park":"/images/attractions/uganda/parks/lake-mburo-national-park.webp","lake-bunyonyi":"/images/attractions/uganda/lakes/lake-bunyonyi.webp"};

  function slug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function apply() {
    document.querySelectorAll(".country-place").forEach(card => {
      const heading = card.querySelector("h2,h3,h4");
      if (!heading) return;

      const key = slug(heading.textContent);
      const url = photos[key];

      if (!url) return;

      const placeholder = [...card.querySelectorAll("*")]
        .find(el =>
          el.children.length === 0 &&
          /illustrative destination photo/i.test(
            el.textContent || ""
          )
        );

      let container = placeholder?.parentElement;

      if (!container) {
        const existing = card.querySelector("img");
        if (existing) {
          if (existing.getAttribute("src") !== url) {
            existing.src = url;
            existing.removeAttribute("srcset");
          }
        }
        return;
      }

      container.style.position = "relative";
      container.style.overflow = "hidden";

      let img = container.querySelector("img[data-uganda-two]");

      if (!img) {
        img = document.createElement("img");
        img.dataset.ugandaTwo = "true";
        img.alt = heading.textContent.trim();
        img.loading = "eager";

        Object.assign(img.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          zIndex: "10"
        });

        container.appendChild(img);
      }

      if (img.getAttribute("src") !== url) {
        img.src = url;
      }
    });
  }

  let pending = false;

  function schedule() {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      pending = false;
      apply();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  new MutationObserver(schedule).observe(
    document.documentElement,
    { childList: true, subtree: true }
  );
})();
