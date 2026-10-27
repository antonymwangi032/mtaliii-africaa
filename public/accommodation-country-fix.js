
(() => {
  "use strict";

  const countries = [
    "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi",
    "Ethiopia", "Somalia", "South Sudan", "Djibouti",
    "Eritrea", "Democratic Republic of the Congo",
    "Seychelles", "Comoros", "Mauritius", "Madagascar"
  ];

  const normalize = value =>
    String(value || "").trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, " ");

  const countryNames = new Map(
    countries.map(c => [normalize(c), c])
  );

  function selectedCountry(select) {
    const value = normalize(select.value);
    const label = normalize(
      select.options[select.selectedIndex]?.textContent
    );

    if (!value || /^(all|all countries|any country)$/.test(value))
      return "";

    return countryNames.get(value) ||
      countryNames.get(label) || "";
  }

  function countrySelects() {
    return [...document.querySelectorAll("select")].filter(select => {
      const text = normalize(
        [...select.options].map(o => o.textContent).join(" ")
      );

      return countries.filter(c =>
        text.includes(normalize(c))
      ).length >= 3;
    });
  }

  function accommodationContainers() {
    return [...document.querySelectorAll(
      "[id], [class]"
    )].filter(el =>
      /accommodation|luxury|stays|lodging|hotels/i.test(
        String(el.id || "") + " " +
        String(el.className || "")
      )
    );
  }

  function filter() {
    const selects = countrySelects();
    const accommodation = accommodationContainers();

    for (const select of selects) {
      const country = selectedCountry(select);
      const root = select.closest("section, main, article") ||
        select.parentElement?.parentElement;

      if (!root) continue;

      const related = accommodation.filter(el =>
        root.contains(el) ||
        (root.parentElement && root.parentElement.contains(el))
      );

      if (!related.length) continue;

      const cards = [...root.querySelectorAll(
        "article, .card, [class*='stay-card'], [class*='hotel-card'], [class*='accommodation-card']"
      )].filter(el =>
        !el.querySelector("select") &&
        el.textContent.trim().length > 10
      );

      for (const card of cards) {
        const explicit = card.dataset.country ||
          card.getAttribute("data-location-country") ||
          "";

        const text = normalize(
          explicit + " " + card.textContent
        );

        const matches = !country ||
          text.includes(normalize(country));

        card.hidden = !matches;
        card.style.setProperty(
          "display",
          matches ? "" : "none",
          matches ? "" : "important"
        );
      }
    }
  }

  let scheduled = false;

  function schedule() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      filter();
    });
  }

  document.addEventListener("change", schedule);
  document.addEventListener("input", schedule);

  const observer = new MutationObserver(schedule);

  function start() {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    schedule();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start);
  else
    start();
})();
