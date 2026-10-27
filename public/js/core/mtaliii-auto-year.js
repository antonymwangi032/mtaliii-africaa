(() => {
    function updateYear() {
        const year = new Date().getFullYear();
        document.querySelectorAll(".mtaliii-copyright-year")
            .forEach(element => {
                element.textContent = year;
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateYear);
    } else {
        updateYear();
    }

    // Refresh while the page remains open.
    setInterval(updateYear, 60 * 60 * 1000);
})();
