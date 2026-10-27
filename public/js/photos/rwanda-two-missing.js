
(function () {
  const photos = {"kings-palace-museum-nyanza":"/images/attractions/rwanda/heritage/kings-palace-museum-nyanza.webp","musanze-caves":"/images/attractions/rwanda/heritage/musanze-caves.webp"};

  function slug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function update() {
    document.querySelectorAll(".country-place").forEach(card => {
      if (!/rwanda/i.test(card.textContent)) return;

      const heading = card.querySelector("h2,h3,h4");
      if (!heading) return;

      const url = photos[slug(heading.textContent)];
      if (!url) return;

      const image = card.querySelector("img");

      if (image) {
        if (image.getAttribute("src") !== url) {
          image.src = url;
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
        }
        return;
      }

      const placeholder = [...card.querySelectorAll("*")]
        .find(el =>
          el.children.length === 0 &&
          /illustrative destination photo/i.test(el.textContent || "")
        );

      if (!placeholder) return;

      const container = placeholder.parentElement;
      container.style.position = "relative";
      container.style.overflow = "hidden";

      const img = document.createElement("img");
      img.src = url;
      img.alt = heading.textContent.trim();
      img.loading = "eager";

      Object.assign(img.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: "20"
      });

      container.appendChild(img);
    });
  }

  let queued = false;

  function schedule() {
    if (queued) return;
    queued = true;

    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", schedule);
  else schedule();

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
