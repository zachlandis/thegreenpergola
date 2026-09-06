const siteConfig = {
  // Optional: paste a Jotform/Formspree/etc URL here later.
  // If set, the quote form will submit there instead of generating copy.
  quoteEndpoint: ""
};

const products = [
  {
    id: "planter-box",
    name: "Planter Boxes",
    category: "Garden",
    price: "From $250",
    imageClass: "planter",
    image: "images/planter-box.png",
    description: "Elevated solid-wood planter boxes built to make gardening easier and your outdoor space look better doing it.",
    tags: ["Built to order", "Custom sizes", "Elevated"]
  },
  {
    id: "raised-garden-bed",
    name: "Raised Garden Beds",
    category: "Garden",
    price: "Quote",
    imageClass: "garden-bed",
    image: "images/raised-garden-bed.png",
    description: "Square cedar garden beds built from three courses of 2×6 lumber — simple, sturdy, and made for years of growing.",
    tags: ["3 × 2×6 construction", "Cedar", "Custom sizes"]
  },
  {
    id: "tote-storage",
    name: "Tote Storage Systems",
    category: "Storage",
    price: "Quote",
    imageClass: "storage",
    // Add your real photo as images/tote-storage.png and uncomment the next line.
    // image: "images/tote-storage.png",
    description: "Purpose-built storage racks that turn stacks of plastic totes into clean, accessible organization.",
    tags: ["Custom capacity", "Garage storage", "Built to fit"]
  },
  {
    id: "bike-rack",
    name: "Wood Bike Rack",
    category: "Storage",
    price: "Quote",
    imageClass: "rack",
    // Add your real photo as images/bike-rack.png and uncomment the next line.
    // image: "images/bike-rack.png",
    description: "A clean, solid-wood way to keep bikes upright, organized, and out of the driveway pile.",
    tags: ["Multiple sizes", "Family-friendly", "Built to order"]
  },
  {
    id: "lemonade-stand",
    name: "Folding Lemonade Stand",
    category: "Family",
    price: "Quote",
    imageClass: "stand",
    description: "Folds down, sets up fast, and makes a neighborhood lemonade operation look suspiciously professional.",
    tags: ["Folding", "Portable", "Kid-approved"]
  },
  {
    id: "seasonal-decor",
    name: "Seasonal Wood Décor",
    category: "Seasonal",
    price: "Limited runs",
    imageClass: "decor",
    description: "Small-batch outdoor and porch pieces that make the season feel like the season.",
    tags: ["Small batch", "Handmade", "Seasonal"]
  },
  {
    id: "custom-build",
    name: "Custom Backyard Build",
    category: "Custom",
    price: "Let’s talk",
    imageClass: "custom",
    description: "Saw something you want? Drew something questionable on a napkin? Send it over. We’ll figure out whether it can become real.",
    tags: ["One-off", "Made for your space", "Your idea"]
  }
];

const productGrid = document.querySelector("#productGrid");
const filters = document.querySelector("#filters");
const quoteModal = document.querySelector("#quoteModal");
const quoteForm = document.querySelector("#quoteForm");
const quoteProduct = document.querySelector("#quoteProduct");
const formStep = document.querySelector("#formStep");
const successStep = document.querySelector("#successStep");
const requestPreview = document.querySelector("#requestPreview");

const categories = ["All", ...new Set(products.map(p => p.category))];

function renderFilters() {
  filters.innerHTML = categories.map((category, i) => `
    <button class="filter-btn ${i === 0 ? "active" : ""}" data-category="${category}">${category}</button>
  `).join("");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.category);
  });
}

function renderProducts(category = "All") {
  const visible = category === "All" ? products : products.filter(p => p.category === category);
  productGrid.innerHTML = visible.map(p => `
    <article class="product-card reveal visible">
      <div class="product-image ${p.imageClass} ${p.image ? "photo" : ""}" role="img" aria-label="${p.name}" ${p.image ? `style="background-image:url('${p.image}')"` : ""}></div>
      <div class="product-body">
        <div class="product-top"><h3>${p.name}</h3><span class="price">${p.price}</span></div>
        <p>${p.description}</p>
        <div class="product-meta">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
        <button class="product-link js-product-quote" data-product="${p.id}">Request this →</button>
      </div>
    </article>
  `).join("");
}

function populateProductSelect() {
  quoteProduct.innerHTML = `<option value="Custom / not sure yet">Custom / not sure yet</option>` + products.map(p => `<option value="${p.name}">${p.name}</option>`).join("");
}

function openQuote(productId) {
  const product = products.find(p => p.id === productId);
  formStep.classList.remove("hidden");
  successStep.classList.add("hidden");
  quoteForm.reset();
  populateProductSelect();
  if (product) quoteProduct.value = product.name;
  quoteModal.showModal();
  document.body.classList.add("modal-open");
}

function closeQuote() {
  quoteModal.close();
  document.body.classList.remove("modal-open");
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".js-open-quote")) openQuote();
  const productBtn = e.target.closest(".js-product-quote");
  if (productBtn) openQuote(productBtn.dataset.product);
});

document.querySelector("#closeModal").addEventListener("click", closeQuote);
quoteModal.addEventListener("click", (e) => {
  const rect = quoteModal.getBoundingClientRect();
  const outside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  if (outside) closeQuote();
});

quoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(quoteForm));

  if (siteConfig.quoteEndpoint) {
    const res = await fetch(siteConfig.quoteEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) return alert("Something went wrong sending the request. Please try again.");
  }

  const request = `GREEN PERGOLA QUOTE REQUEST\n\nName: ${data.name}\nEmail: ${data.email}\nProject: ${data.product}\n\nDetails:\n${data.details || "No extra details yet."}`;
  requestPreview.textContent = request;
  formStep.classList.add("hidden");
  successStep.classList.remove("hidden");
});

document.querySelector("#copyRequest").addEventListener("click", async (e) => {
  await navigator.clipboard.writeText(requestPreview.textContent);
  const old = e.currentTarget.textContent;
  e.currentTarget.textContent = "Copied ✓";
  setTimeout(() => e.currentTarget.textContent = old, 1600);
});

document.querySelector("#startOver").addEventListener("click", () => openQuote());
document.querySelector("#year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

renderFilters();
renderProducts();
populateProductSelect();
