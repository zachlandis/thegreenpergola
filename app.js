const siteConfig = {
  // Green Pergola's on-site quote form uses Web3Forms as the email delivery
  // backend because GitHub Pages is static and cannot send email itself.
  // Paste the Web3Forms access key for info@thegreenpergola.com below.
  quoteEndpoint: "https://api.web3forms.com/submit",
  web3FormsAccessKey: "193f2c54-a5e3-4716-a194-4d6ffacd7c14",
  requestTimeoutMs: 12000
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
    seoUrl: "planter-boxes-colorado.html",
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
    seoUrl: "raised-garden-beds-colorado.html",
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
    seoUrl: "garage-tote-storage-colorado.html",
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
    image: "images/lemonade-stand-main.png",
    imageFit: "contain",
    description: "A handcrafted stand made for lemonade, markets, play, parties, and whatever else kids can dream up. Designed to pack down into two pieces for easier storage and customizable to make it your own.",
    tags: ["Folding", "Custom colors", "Built to order"]
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
const formStatus = document.querySelector("#formStatus");
const quoteSubmit = document.querySelector("#quoteSubmit");

const productModal = document.querySelector("#productModal");
const productModalImage = document.querySelector("#productModalImage");
const productModalThumbs = document.querySelector("#productModalThumbs");
const productModalName = document.querySelector("#productModalName");
const productModalPrice = document.querySelector("#productModalPrice");
const productModalDescription = document.querySelector("#productModalDescription");
const productModalTags = document.querySelector("#productModalTags");
const productModalQuote = document.querySelector("#productModalQuote");
const productModalLearn = document.querySelector("#productModalLearn");
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
  if (formStatus) formStatus.textContent = "";
  if (quoteSubmit) {
    quoteSubmit.disabled = false;
    quoteSubmit.textContent = "Send quote request";
  }
  populateProductSelect();
  if (product) quoteProduct.value = product.name;
  quoteModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeQuote() {
  quoteModal.classList.add("hidden");
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

  if (product.seoUrl) {
    productModalLearn.href = product.seoUrl;
    productModalLearn.hidden = false;
  } else {
    productModalLearn.hidden = true;
    productModalLearn.removeAttribute("href");
  }

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
  galleryPrev.style.display = showControls ? "" : "none";
  galleryNext.style.display = showControls ? "" : "none";
  productModalThumbs.style.display = showControls ? "" : "none";

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
  if (e.target === quoteModal) closeQuote();
});

document.querySelector("#closeProductModal").addEventListener("click", closeProduct);
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) closeProduct();
});

galleryPrev.addEventListener("click", () => setGalleryImage(activeImageIndex - 1));
galleryNext.addEventListener("click", () => setGalleryImage(activeImageIndex + 1));
productModalQuote.addEventListener("click", () => openQuote(productModalQuote.dataset.product));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !quoteModal.classList.contains("hidden")) {
    closeQuote();
    return;
  }

  if (!productModal.open || getProductImages(activeProduct || {}).length < 2) return;
  if (e.key === "ArrowLeft") setGalleryImage(activeImageIndex - 1);
  if (e.key === "ArrowRight") setGalleryImage(activeImageIndex + 1);
});

quoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!siteConfig.web3FormsAccessKey || siteConfig.web3FormsAccessKey.includes("PASTE_YOUR")) {
    formStatus.textContent = "This form is temporarily unavailable. Please email info@thegreenpergola.com.";
    return;
  }

  const formData = new FormData(quoteForm);
  const data = Object.fromEntries(formData);
  const captchaToken = formData.get("h-captcha-response");

  if (!captchaToken) {
    formStatus.textContent = "Please complete the security check before sending your request.";
    return;
  }

  quoteSubmit.disabled = true;
  quoteSubmit.textContent = "Sending…";
  formStatus.textContent = "";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), siteConfig.requestTimeoutMs);

  try {
    const payload = {
      access_key: siteConfig.web3FormsAccessKey,
      subject: `New Green Pergola quote request — ${data.product}`,
      from_name: "Green Pergola Website",
      name: data.name,
      email: data.email,
      phone: data.phone || "Not provided",
      location: data.location || "Not provided",
      product: data.product,
      message: data.details,
      "h-captcha-response": captchaToken
    };

    const res = await fetch(siteConfig.quoteEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok || result.success !== true) {
      throw new Error(result.message || `Form submission failed with status ${res.status}`);
    }

    requestPreview.textContent = `Thanks, ${data.name}. Your request for ${data.product} is on its way. We’ll follow up at ${data.email}.`;
    formStep.classList.add("hidden");
    successStep.classList.remove("hidden");
    quoteForm.reset();

    if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
      window.hcaptcha.reset();
    }
  } catch (err) {
    console.error("Green Pergola quote form error:", err);

    if (err.name === "AbortError") {
      formStatus.textContent = "This is taking longer than expected. Please try again, or email info@thegreenpergola.com.";
    } else {
      formStatus.textContent = "We couldn’t send your request. Please try again, or email info@thegreenpergola.com.";
    }

    if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
      window.hcaptcha.reset();
    }
  } finally {
    clearTimeout(timeout);
    quoteSubmit.disabled = false;
    quoteSubmit.textContent = "Send quote request";
  }
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
/* =========================================================
   ROTATING HERO
========================================================= */
(() => {
  const slides = [...document.querySelectorAll("[data-hero-slide]")];
  const dots = [...document.querySelectorAll("[data-hero-dot]")];
  const label = document.querySelector("#heroCarouselLabel");

  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const intervalMs = 5200;

  function showHeroSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
      slide.setAttribute("aria-hidden", i === current ? "false" : "true");
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
      dot.setAttribute("aria-current", i === current ? "true" : "false");
    });

    if (label) {
      label.textContent = slides[current].dataset.label || "Featured build";
    }
  }

  function restartHeroTimer() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => showHeroSlide(current + 1), intervalMs);
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      showHeroSlide(Number(dot.dataset.heroDot));
      restartHeroTimer();
    });
  });

  slides.forEach((slide, i) => {
    slide.addEventListener("error", () => {
      if (i === current) showHeroSlide(current + 1);
    }, true);
  });

  showHeroSlide(0);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    restartHeroTimer();
  }
})();
