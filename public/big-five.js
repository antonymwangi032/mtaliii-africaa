
(() => {
    const animals = [
        {
            name: "African Lion",
            scientific: "Panthera leo",
            image: "/images/big-five/african-lion.webp",
            description: "The powerful big cat of Africa's savannahs."
        },
        {
            name: "African Leopard",
            scientific: "Panthera pardus",
            image: "/images/big-five/african-leopard.webp",
            description: "A remarkable spotted cat, famous for climbing trees."
        },
        {
            name: "African Elephant",
            scientific: "Loxodonta africana",
            image: "/images/big-five/african-elephant.webp",
            description: "Africa's largest land animal, living in family herds."
        },
        {
            name: "African Buffalo",
            scientific: "Syncerus caffer",
            image: "/images/big-five/african-buffalo.webp",
            description: "A strong wild bovine often found in large herds."
        },
        {
            name: "Rhinoceros",
            scientific: "Diceros bicornis",
            image: "/images/big-five/rhinoceros.webp",
            description: "The black rhinoceros, an iconic African conservation species."
        }
    ];

    const container = document.getElementById("bigfive");
    if (!container) return;

    container.innerHTML = animals.map(animal => `
    <article class="mt-bigfive-card">
      <div class="mt-bigfive-photo">
        <img
          src="${animal.image}"
          alt="${animal.name} in the wild"
          loading="lazy"
        >
      </div>
      <div class="mt-bigfive-content">
        <h3>${animal.name}</h3>
        <em>${animal.scientific}</em>
        <p>${animal.description}</p>
        <a href="#explore">Explore wildlife experiences ↗</a>
      </div>
    </article>
  `).join("");
})();
