(() => {
    "use strict";

    /*
    ==================================================
    MTALIII AFRICA — CLEAN WEBSITE NAVIGATION
    ==================================================

    - No long animated scrolling between sections
    - Plan My Visit opens without moving the page
    - Normal manual scrolling remains available
    - Browser Back and Forward navigation still works
    - External links remain unchanged
    ==================================================
    */

    function getSection(hash) {
        if (!hash || hash === "#") return null;

        try {
            return document.getElementById(
                decodeURIComponent(hash.slice(1))
            );
        } catch {
            return null;
        }
    }

    function navigateToSection(hash, updateHistory = true) {
        const section = getSection(hash);

        if (!section) return false;

        if (updateHistory) {
            history.pushState(
                null,
                "",
                window.location.pathname +
                window.location.search +
                hash
            );
        }

        section.scrollIntoView({
            behavior: "instant",
            block: "start"
        });

        return true;
    }

    function handleNavigation(event) {
        const link = event.target.closest("a[href]");

        if (!link) return;

        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            link.hasAttribute("download") ||
            (
                link.target &&
                link.target !== "_self"
            )
        ) {
            return;
        }

        let url;

        try {
            url = new URL(link.href, location.href);
        } catch {
            return;
        }

        if (
            url.origin !== location.origin ||
            url.pathname !== location.pathname ||
            url.search !== location.search ||
            !url.hash
        ) {
            return;
        }

        /*
        PLAN MY VISIT:
        Open the popup without scrolling.
        */

        if (url.hash === "#plan") {
            if (
                typeof window.mtaliiiOpenJourneyPlanner ===
                "function"
            ) {
                event.preventDefault();
                event.stopImmediatePropagation();

                window.mtaliiiOpenJourneyPlanner();
            }

            return;
        }

        /*
        ALL OTHER SECTIONS:
        Move directly to the destination without
        showing the long scrolling animation.
        */

        if (getSection(url.hash)) {
            event.preventDefault();
            event.stopImmediatePropagation();

            navigateToSection(url.hash);
        }
    }

    /*
    Capture navigation before older click handlers.
    */

    document.addEventListener(
        "click",
        handleNavigation,
        true
    );

    /*
    Support browser Back and Forward buttons.
    */

    window.addEventListener("popstate", () => {
        if (location.hash === "#plan") {
            return;
        }

        if (location.hash) {
            navigateToSection(location.hash, false);
        }
    });

    /*
    Handle navigation from an existing URL hash.
    */

    window.addEventListener("load", () => {
        if (
            location.hash &&
            location.hash !== "#plan"
        ) {
            navigateToSection(location.hash, false);
        }
    });

})();