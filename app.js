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
    imageFit: "cover",
    description: "Custom-built elevated planter boxes designed to bring your garden up to a more comfortable working height. Built from real wood and tailored to fit your space, style, and growing plans.",
    tags: ["Built to order", "Custom sizes", "Elevated"]
  },
  {
    id: "raised-garden-bed",
    name: "Raised Garden Beds",
    category: "Garden",
    price: "Quote",
    imageClass: "garden-bed",
    image: "images/raised-garden-bed.png",
    imageFit: "cover",
    description: "Built-to-order garden beds made for years of growing. Choose the size, height, and layout that works for your space, and we’ll build a solid wood bed around the way you actually garden.",
    tags: ["Built to order", "Solid wood", "Custom sizes"]
  },
  {
    id: "tote-storage",
    name: "Tote Storage Systems",
    category: "Storage",
    price: "Quote",
    imageClass: "storage",
    image: "images/tote-storage.png",
    imageFit: "contain",
    cardImageFit: "contain",
    cardImagePosition: "center",
    description: "Turn stacks of plastic totes into organized, easy-access storage. Each system is built around your totes and your space, whether it’s going in a garage, basement, workshop, or utility room.",
    tags: ["Custom capacity", "Built to fit", "Easy access"]
  },
  {
    id: "bike-rack",
    name: "Kid's Bike Rack",
    category: "Storage",
    price: "Quote",
    imageClass: "rack",
    images: [
      "images/bike-rack-blue.png",
      "images/bike-rack-black.png"
    ],
    imageFit: "contain",
    cardImageFit: "contain",
    cardImagePosition: "center",
    description: "A simple, sturdy way to get bikes organized and off the floor pile. Custom-built to fit your bikes, available space, and the number of riders in your household.",
    tags: ["Built to order", "Custom capacity", "Family-friendly"]
  },
  {
    id: "lemonade-stand",
    name: "Folding Lemonade Stand",
    category: "Family",
    price: "Quote",
    imageClass: "stand",
    image: "images/lemonade-stand-main.jpg",
    imageFit: "cover",
    description: "A handcrafted stand made for lemonade, markets, play, parties, and whatever else kids can dream up. Designed to pack down into two pieces for easier storage and customizable to make it your own.",
    tags: ["Folding", "Custom colors", "Built to order"]
  },
  {
    id: "custom-build",
    name: "Custom Backyard Build",
    category: "Custom",
    price: "Let’s talk",
    imageClass: "custom",
    description: "Have an idea you don’t see here? That’s kind of the point. Tell us what you need, show us the space, or send us the idea you’ve been saving—we’ll figure out how to build it.",
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

const productModal = document.querySelector("#productModal");
const productModalImage = document.querySelector("#productModalImage");
const productModalThumbs = document.querySelector("#productModalThumbs");
const productModalName = document.querySelector("#productModalName");
const productModalPrice = document.querySelector("#productModalPrice");
const productModalDescription = document.querySelector("#productModalDescription");
const productModalTags = document.querySelector("#productModalTags");
const productModalQuote = document.querySelector("#productModalQuote");
const galleryPrev = document.querySelector("#galleryPrev");
const galleryNext = document.querySelector("#galleryNext");

let activeProduct = null;
let activeImageIndex = 0;

const categories = ["All", ...new Set(products.map(p => p.category))];

function getProductImages(product) {
  if (Array.isArray(product.images) && product.images.length) return product.images;
  return product.image ? [product.image] : [];
}

function getPrimaryImage(product) {
  return getProductImages(product)[0] || "";
}

function getImageFit(product) {
  return product.imageFit || "cover";
}

function getCardImageFit(product) {
  return product.cardImageFit || getImageFit(product);
}

function getCardImagePosition(product) {
  return product.cardImagePosition || "center";
}

function imageCandidates(src) {
  if (!src) return [];
  const match = src.match(/^(.*?)(\.[a-zA-Z0-9]+)?$/);
  const base = match ? match[1] : src;
  const originalExt = match && match[2] ? match[2].toLowerCase() : "";
  const exts = [originalExt, ".png", ".jpg", ".jpeg", ".webp"].filter(Boolean);
  return [...new Set(exts.map(ext => `${base}${ext}`))];
}

function allProductImageCandidates(product) {
  return [...new Set(getProductImages(product).flatMap(imageCandidates))];
}

function handleCardImageError(img, productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const candidates = allProductImageCandidates(product);
  const tried = (img.dataset.tried || "").split("|").filter(Boolean);
  if (img.currentSrc) tried.push(img.currentSrc);
  if (img.src) tried.push(img.src);

  const next = candidates.find(src => !tried.some(t => t.endsWith(src)));
  img.dataset.tried = [...new Set(tried)].join("|");

  if (next) {
    img.src = next;
    return;
  }

  img.style.display = "none";
  img.parentElement.classList.add("image-error");
}

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

  productGrid.innerHTML = visible.map(p => {
    const primaryImage = getPrimaryImage(p);
    const imageCount = getProductImages(p).length;
    const imageFit = getImageFit(p);

    return `
      <article class="product-card reveal visible">
        <button class="product-image-button js-product-open" data-product="${p.id}" aria-label="View ${p.name}">
          <div class="product-image ${p.imageClass || ""} ${primaryImage ? "photo" : ""}">
            ${primaryImage ? `
              <img
                src="${primaryImage}"
                alt="${p.name}"
                class="product-photo"
                style="object-fit:${getCardImageFit(p)};object-position:${getCardImagePosition(p)};"
                loading="lazy"
                onerror="handleCardImageError(this, '${p.id}')"
              >
            ` : `
              <div class="product-image-placeholder"><span>${p.name}</span></div>
            `}
          </div>
          ${imageCount > 1 ? `<span class="photo-count">${imageCount} photos</span>` : ""}
        </button>

        <div class="product-body">
          <div class="product-top"><h3>${p.name}</h3><span class="price">${p.price}</span></div>
          <p>${p.description}</p>
          <div class="product-meta">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
          <div class="product-actions">
            <button class="product-link js-product-open" data-product="${p.id}">View details →</button>
            <button class="product-link secondary js-product-quote" data-product="${p.id}">Request this</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function populateProductSelect() {
  quoteProduct.innerHTML = `<option value="Custom / not sure yet">Custom / not sure yet</option>` + products.map(p => `<option value="${p.name}">${p.name}</option>`).join("");
}

function openQuote(productId) {
  const product = products.find(p => p.id === productId);
  if (productModal.open) productModal.close();
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

function setGalleryImage(index) {
  if (!activeProduct) return;
  const images = getProductImages(activeProduct);
  if (!images.length) return;
  activeImageIndex = (index + images.length) % images.length;
  productModalImage.src = images[activeImageIndex];
  productModalImage.alt = `${activeProduct.name} photo ${activeImageIndex + 1} of ${images.length}`;
  productModalImage.style.objectFit = getImageFit(activeProduct);
  productModalThumbs.querySelectorAll("button").forEach((btn, i) => {
    btn.classList.toggle("active", i === activeImageIndex);
    btn.setAttribute("aria-current", i === activeImageIndex ? "true" : "false");
  });
}

function openProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  activeProduct = product;
  activeImageIndex = 0;
  const images = getProductImages(product);

  productModalName.textContent = product.name;
  productModalPrice.textContent = product.price;
  productModalDescription.textContent = product.description;
  productModalTags.innerHTML = product.tags.map(t => `<span>${t}</span>`).join("");
  productModalQuote.dataset.product = product.id;

  const hasImages = images.length > 0;
  productModalImage.hidden = !hasImages;
  document.querySelector("#productModalPlaceholder").hidden = hasImages;

  if (hasImages) {
    productModalThumbs.innerHTML = images.length > 1 ? images.map((src, i) => `
      <button class="gallery-thumb ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="Show photo ${i + 1}" aria-current="${i === 0 ? "true" : "false"}">
        <img src="${src}" alt="${product.name} thumbnail ${i + 1}">
      </button>
    `).join("") : "";
    setGalleryImage(0);
  } else {
    productModalThumbs.innerHTML = "";
  }

  const showControls = images.length > 1;
  galleryPrev.hidden = !showControls;
  galleryNext.hidden = !showControls;
  productModalThumbs.hidden = !showControls;

  productModal.showModal();
  document.body.classList.add("modal-open");
}

function closeProduct() {
  productModal.close();
  document.body.classList.remove("modal-open");
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".js-open-quote")) openQuote();

  const productBtn = e.target.closest(".js-product-quote");
  if (productBtn) openQuote(productBtn.dataset.product);

  const productOpen = e.target.closest(".js-product-open");
  if (productOpen) openProduct(productOpen.dataset.product);

  const thumb = e.target.closest(".gallery-thumb");
  if (thumb) setGalleryImage(Number(thumb.dataset.index));
});

document.querySelector("#closeModal").addEventListener("click", closeQuote);
quoteModal.addEventListener("click", (e) => {
  const rect = quoteModal.getBoundingClientRect();
  const outside = e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  if (outside) closeQuote();
});

document.querySelector("#closeProductModal").addEventListener("click", closeProduct);
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) closeProduct();
});

galleryPrev.addEventListener("click", () => setGalleryImage(activeImageIndex - 1));
galleryNext.addEventListener("click", () => setGalleryImage(activeImageIndex + 1));
productModalQuote.addEventListener("click", () => openQuote(productModalQuote.dataset.product));

document.addEventListener("keydown", (e) => {
  if (!productModal.open || getProductImages(activeProduct || {}).length < 2) return;
  if (e.key === "ArrowLeft") setGalleryImage(activeImageIndex - 1);
  if (e.key === "ArrowRight") setGalleryImage(activeImageIndex + 1);
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
