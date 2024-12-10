document.addEventListener("DOMContentLoaded", () => {
    const allergenListData = [
        {
            name: "Menu Halloween Funko",
            composition: ["Palomitas", "Refresco", "Juguetes"],
            allergens: ["Gluten", "Soja"],
        },
        {
            name: "Menu Joker Funko",
            composition: ["Palomitas", "Refresco", "Juguetes"],
            allergens: ["Gluten", "Soja"],
        },
        {
            name: "Menu Haribo UP CH",
            composition: ["Palomitas", "Refresco", "Gominolas"],
            allergens: ["Sulfitos", "Soja"],
        },
        {
            name: "Menu Taylor Swift The Eras Tour",
            composition: ["Palomitas dulces", "Refresco"],
            allergens: ["Soja"],
        },
        {
            name: "Vaso Taylor Swift Bebida CH",
            composition: ["Refresco servido en vaso temático"],
            allergens: ["Ninguno"],
        },
        {
            name: "Refrescos 1L",
            composition: ["Coca-Cola", "Fanta", "Sprite"],
            allergens: ["Ninguno"],
        },
        {
            name: "Refrescos 75CL",
            composition: ["Coca-Cola", "Fanta", "Sprite"],
            allergens: ["Ninguno"],
        },
        {
            name: "Lata Cerveza",
            composition: ["Cerveza"],
            allergens: ["Gluten"],
        },
        {
            name: "Agua 75CL Stock",
            composition: ["Agua mineral"],
            allergens: ["Ninguno"],
        },
        {
            name: "Agua 1L Stock",
            composition: ["Agua mineral"],
            allergens: ["Ninguno"],
        },
    ];

    const allergenList = document.getElementById("allergen-list");

    // Renderizar los ítems de la lista
    allergenListData.forEach((item, index) => {
        const allergenItem = document.createElement("li");
        allergenItem.classList.add("allergen-item");

        const header = document.createElement("div");
        header.classList.add("allergen-header");
        header.innerHTML = `
            <span>${item.name}</span>
            <span class="allergen-toggle" data-index="${index}">+</span>
        `;

        const content = document.createElement("div");
        content.classList.add("allergen-content");
        content.innerHTML = `
            <p><strong>Composición:</strong></p>
            <ul>
                ${item.composition.map((comp) => `<li>${comp}</li>`).join("")}
            </ul>
            <p>${item.allergens}</p>
        `;

        allergenItem.appendChild(header);
        allergenItem.appendChild(content);
        allergenList.appendChild(allergenItem);

        header.addEventListener("click", () => {
            // Cerrar todos los demás
            document.querySelectorAll(".allergen-content").forEach((el, idx) => {
                if (idx !== index) {
                    el.classList.remove("visible");
                    el.previousElementSibling.querySelector(".allergen-toggle").textContent = "+";
                }
            });

            // Abrir/cerrar el actual
            const isVisible = content.classList.toggle("visible");
            header.querySelector(".allergen-toggle").textContent = isVisible ? "-" : "+";
        });
    });
});
