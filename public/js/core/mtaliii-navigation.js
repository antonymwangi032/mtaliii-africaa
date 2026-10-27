(() => {
    "use strict";

    function init() {
        // Remove previous navigation controls.
        document.querySelectorAll(
            "#mtaliiiNavigation, #mtaliiiTopButton, " +
            ".mtaliii-nav-actions, .mtaliii-top-btn"
        ).forEach(el => el.remove());

        const button = document.createElement("button");
        button.id = "mtaliiiTopButton";
        button.type = "button";
        button.setAttribute("aria-label", "Back to top");
        button.title = "Back to top";

        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24"
                 fill="none" stroke="white" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round"
                 aria-hidden="true">
                <path d="M12 19V5"/>
                <path d="M5 12l7-7 7 7"/>
            </svg>
        `;

        // Apply styles directly so missing CSS cannot break the button.
        Object.assign(button.style, {
            position: "fixed",
            left: "auto",
            right: "20px",
            right: "auto",
            top: "auto",
            bottom: "24px",
            width: "52px",
            height: "52px",
            minWidth: "52px",
            minHeight: "52px",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #398b68",
            borderRadius: "50%",
            background: "#146747",
            color: "#ffffff",
            boxShadow: "0 6px 20px rgba(0,0,0,.28)",
            cursor: "pointer",
            zIndex: "2147483000",
            visibility: "hidden",
            opacity: "0",
            transition: "opacity .2s ease"
        });

        document.body.appendChild(button);

        button.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches ? "instant" : "smooth"
            });
        });

        function update() {
            const mobile = window.innerWidth <= 600;
            const margin = mobile ? 14 : 20;
            const size = mobile ? 46 : 52;

            button.style.left = "auto";
            button.style.right = (window.innerWidth <= 600 ? 6 : 8) + "px";
            button.style.width = size + "px";
            button.style.height = size + "px";
            button.style.minWidth = size + "px";
            button.style.minHeight = size + "px";

            // Keep button above footer as footer enters viewport.
            const footer = document.querySelector("footer");
            let bottom = mobile ? 18 : 24;

            if (footer) {
                const rect = footer.getBoundingClientRect();
                const overlap = window.innerHeight - rect.top;

                if (overlap > 0 && rect.bottom > 0) {
                    bottom = Math.max(bottom, overlap + 16);
                }
            }

            button.style.bottom = bottom + "px";

            const show = window.scrollY > 300;
            button.style.visibility = show ? "visible" : "hidden";
            button.style.opacity = show ? "1" : "0";
            button.style.pointerEvents = show ? "auto" : "none";
        }

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
