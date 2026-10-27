
        document.addEventListener("DOMContentLoaded", function () {

            const countrySelect = document.getElementById("county");

            if (!countrySelect) return;

            const countries = [
                "Kenya",
                "Tanzania",
                "Uganda",
                "Rwanda",
                "Burundi",
                "Democratic Republic of the Congo",
                "South Sudan",
                "Somalia",
                "Ethiopia",
                "Djibouti",
                "Eritrea",
                "Seychelles",
                "Comoros",
                "Mauritius",
                "Madagascar"
            ];

            const existingValues = new Set(
                Array.from(countrySelect.options).map(option => option.value)
            );

            countrySelect.options[0].textContent = "All 15 countries";

            countries.forEach(country => {
                if (existingValues.has(country)) return;

                const option = document.createElement("option");
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });

        });
    
