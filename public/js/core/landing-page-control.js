(() => {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  // Only reset navigation when the page is loaded or refreshed.
  // Normal clicks on navigation links are unaffected.
  function returnToLanding() {
    const cleanURL = window.location.pathname;

    if (window.location.hash || window.location.search) {
      history.replaceState(null, "", cleanURL);
    }

    window.scrollTo(0, 0);
  }

  // Run early so old section anchors do not control initial scrolling.
  returnToLanding();

  window.addEventListener("pageshow", returnToLanding);

  window.addEventListener("load", () => {
    returnToLanding();
  });
})();
