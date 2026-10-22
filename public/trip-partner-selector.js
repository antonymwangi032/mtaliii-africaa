(() => {
  "use strict";

  const partners = [
    "Mtaliii Africa",
    "AfriVoya",
    "Savanna Trails Africa",
    "Ubuntu Journeys",
    "Zuri Africa Travels",
    "Asili Africa Expeditions",
    "RoamAfrica",
    "Tembea Africa",
    "Acacia Crown Travel",
    "Jua Africa Adventures",
    "WildRoot Africa",
    "Horizon Africa Travel",
    "Nyota Trails Africa",
    "Kifaru Expeditions",
    "AfriQuest Travels",
    "Mwangaza Africa Travels"
  ];

  let selectedPartner = "Mtaliii Africa";

  function install() {
    const modal = document.getElementById("mtJourneyModal");
    if (!modal || modal.querySelector("#mtPartnerSelector")) return;

    const form = modal.querySelector("form");
    if (!form) return;

    const section = document.createElement("div");
    section.id = "mtPartnerSelector";
    section.className = "mt-partner-selector";

    const heading = document.createElement("h3");
    heading.textContent = "Preferred Tour Partner";

    const description = document.createElement("p");
    description.textContent =
      "Choose a travel agency to include in your trip plan.";

    const select = document.createElement("select");
    select.id = "mtPreferredPartner";
    select.name = "preferredPartner";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a Tour Partner";
    placeholder.disabled = true;
    select.appendChild(placeholder);

    partners.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    select.value = selectedPartner;

    const controls = document.createElement("div");
    controls.className = "mt-partner-controls";

    const add = document.createElement("button");
    add.type = "button";
    add.textContent = "Add Partner";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove Partner";
    remove.disabled = true;

    const status = document.createElement("p");
    status.className = "mt-partner-status";
    status.setAttribute("role", "status");

    add.addEventListener("click", () => {
      if (!select.value) {
        status.textContent = "Please select a partner first.";
        return;
      }

      selectedPartner = select.value;
      add.textContent = "Change Partner";
      remove.disabled = false;
      status.textContent = "Added: " + selectedPartner;
    });

    remove.addEventListener("click", () => {
      selectedPartner = "Mtaliii Africa";
      select.value = "Mtaliii Africa";
      add.textContent = "Change Partner";
      remove.disabled = true;
      status.textContent = "Default partner: Mtaliii Africa";
    });

    controls.append(add, remove);
    status.textContent = "Default partner: Mtaliii Africa";
    add.textContent = "Change Partner";
    section.append(heading, description, select, controls, status);

    const submit = form.querySelector(
      '#mtJourneySubmit'
    );

    if (submit) {
      submit.before(section);
    } else {
      form.appendChild(section);
    }
  }

  const observer = new MutationObserver(install);

  function start() {
    install();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.mtaliiiPreferredTourPartner = () => selectedPartner;
})();
