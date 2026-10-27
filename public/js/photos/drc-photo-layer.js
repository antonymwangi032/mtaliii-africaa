
(function () {
  "use strict";

  const photos = {
  "Mount Stanley": "mountains-forests/mount-stanley.webp",
  "Congo River": "lakes-rivers-waterfalls/congo-river.webp",
  "Boyoma Falls": "lakes-rivers-waterfalls/boyoma-falls.webp",
  "Lake Edward": "lakes-rivers-waterfalls/lake-edward.webp",
  "Lake Tumba": "lakes-rivers-waterfalls/lake-tumba.webp",
  "Tumba-Lediima Nature Reserve": "wildlife/tumba-lediima-nature-reserve.webp",
  "Matupi Caves": "nature/matupi-caves.webp",
  "National Museum of the Democratic Republic of the Congo": "heritage/national-museum-of-the-democratic-republic-of-the-congo.webp",
  "National Museum of Lubumbashi": "heritage/national-museum-of-lubumbashi.webp",
  "National Museum of Gungu": "heritage/national-museum-of-gungu.webp"
};

  const normalize = value => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const lookup = new Map(
    Object.entries(photos).map(([name, file]) => [
      normalize(name),
      "/images/attractions/drc/" + file
    ])
  );

  function applyPhotos() {
    document.querySelectorAll(
      "article, .destination-card, .attraction-card, .spotlight-card"
    ).forEach(card => {
      const heading = card.querySelector("h2,h3,h4");
      if (!heading) return;

      const url = lookup.get(normalize(heading.textContent));
      if (!url) return;

      let image = card.querySelector("img");

      if (image) {
        if (image.getAttribute("src") !== url) {
          image.src = url;
          image.removeAttribute("srcset");
        }
        return;
      }

      const placeholder = [...card.querySelectorAll("*")]
        .find(element =>
          element.children.length === 0 &&
          /illustrative destination photo/i.test(
            element.textContent || ""
          )
        );

      let container = placeholder?.parentElement;

      if (!container) {
        container = [...card.querySelectorAll("div")]
          .find(element => {
            const style = getComputedStyle(element);
            return (
              element.getBoundingClientRect().height > 120 &&
              element.getBoundingClientRect().width > 150 &&
              style.backgroundImage !== "none"
            );
          });
      }

      if (!container) return;

      container.style.position = "relative";
      container.style.overflow = "hidden";

      const img = document.createElement("img");
      img.src = url;
      img.alt = heading.textContent.trim();
      img.loading = "eager";
      img.decoding = "async";

      Object.assign(img.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        zIndex: "2"
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
      applyPhotos();
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
