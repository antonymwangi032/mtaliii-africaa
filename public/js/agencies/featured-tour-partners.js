(() => {
  "use strict";

  const partners = [
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

  function renderPartners() {
    const section = document.getElementById("agencies");
    const agencyList = document.getElementById("agencyList");

    if (!section || !agencyList) return;

    let container = document.getElementById("featuredTourPartners");

    if (!container) {
      container = document.createElement("div");
      container.id = "featuredTourPartners";
      container.className = "mtaliii-featured-partners";
      agencyList.parentNode.insertBefore(container, agencyList);
    }

    container.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Our Tours and Travels Partners";
    container.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "mtaliii-featured-grid";

    partners.forEach((name, index) => {
      const card = document.createElement("article");
      card.className = "mtaliii-featured-card";

      const number = document.createElement("span");
      number.className = "mtaliii-partner-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("h4");
      title.textContent = name;

      const description = document.createElement("p");
      description.textContent = "Mtaliii Africa Tour Partner";

      
      const avatar = document.createElement("img");
      avatar.className = "mtaliii-partner-avatar";
      avatar.src = "https://images.unsplash.com/" +
        ["photo-1516026672322-bc52d61a55d5","photo-1533105079780-92b9be482077","photo-1500534623283-312aade485b7","photo-1470770841072-f978cf4d019e","photo-1464822759023-fed622ff2c3b","photo-1501785888041-af3ef285b470","photo-1441974231531-c6227db76b6e","photo-1511497584788-876760111969","photo-1469474968028-56623f02e42e","photo-1470252649378-9c29740c9fa8","photo-1500530855697-b586d89ba3ee","photo-1426604966848-d7adac402bff","photo-1473448912268-2022ce9509d8","photo-1433086966358-54859d0ed716","photo-1516026672322-bc52d61a55d5"][index] +
        "?auto=format&fit=crop&w=180&h=180&q=80";
      avatar.alt = "African travel scenery";
      avatar.loading = "eager";
      avatar.width = 76;
      avatar.height = 76;

      card.append(number, avatar, title, description);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPartners);
  } else {
    renderPartners();
  }
})();
