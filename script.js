// script.js - fully self-contained, no syntax errors
document.addEventListener("DOMContentLoaded", function () {
  /* -------------------------
       Helper: safe query
       ------------------------- */
  function q(sel, parent) {
    return (parent || document).querySelector(sel);
  }
  function qa(sel, parent) {
    return Array.from((parent || document).querySelectorAll(sel));
  }

  /* -------------------------
       Navbar scroll effect
       ------------------------- */
  const header = q(".header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScrollHeader);
  onScrollHeader();

  /* -------------------------
       Smooth scroll for anchors (account header height)
       ------------------------- */
  qa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 80;
      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        8;
      window.scrollTo({ top, behavior: "smooth" });

      // update active nav link
      qa(".navbar-nav .nav-link").forEach((n) => n.classList.remove("active"));
      if (this.classList) this.classList.add("active");
    });
  });

  /* -------------------------
       Hero slider
       ------------------------- */
  const slides = qa(".slide");
  let currentSlide = 0;
  if (slides.length) {
    function showSlide(index) {
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
    }
    showSlide(0);
    setInterval(function () {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  /* -------------------------
       Service items: hover gradient & click show only selected detail
       ------------------------- */
  const featureItems = qa(".feature-item");
  const featureDetails = qa(".feature-detail");
  featureDetails.forEach((fd) => fd.classList.remove("active"));
  featureItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.classList.add("hovered");
    });
    item.addEventListener("mouseleave", function () {
      this.classList.remove("hovered");
    });
    item.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        this.click();
      }
    });
    item.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      if (!targetId) return;
      featureItems.forEach((fi) => fi.classList.remove("selected"));
      featureDetails.forEach((fd) => fd.classList.remove("active"));
      this.classList.add("selected");
      const detail = document.getElementById(targetId);
      if (detail) detail.classList.add("active");
      setTimeout(function () {
        const headerHeight = header ? header.offsetHeight : 80;
        const top =
          detail.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight -
          12;
        window.scrollTo({ top, behavior: "smooth" });
      }, 150);
    });
  });

  /* -------------------------
       Menu category filtering with smooth show/hide
       ------------------------- */
  const categoryButtons = qa(".category-btn");
  const menuItems = qa(".menu-item");
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const cat = this.getAttribute("data-category") || "all";
      categoryButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      menuItems.forEach((item) => {
        const itemCat = item.getAttribute("data-category") || "";
        if (cat === "all" || itemCat === cat) {
          item.style.display = "block";
          item.style.opacity = "0";
          item.style.transform = "translateY(6px)";
          setTimeout(() => {
            item.style.transition = "opacity 300ms ease, transform 300ms ease";
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, 40);
        } else {
          item.style.transition = "opacity 300ms ease, transform 300ms ease";
          item.style.opacity = "0";
          item.style.transform = "translateY(12px)";
          setTimeout(() => {
            item.style.display = "none";
          }, 320);
        }
      });
    });
  });

  /* -------------------------
       Menu card hover: visual upgrade
       ------------------------- */
  qa(".menu-card").forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-6px)";
      this.style.boxShadow = "0 18px 40px rgba(12,30,18,0.12)";
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
      this.style.boxShadow = "";
    });
  });

  /* -------------------------
       Cart functionality
       ------------------------- */
  const cart = {}; // id -> {id,name,price,img,qty,note}
  const cartCountEl = q("#cartCount");
  const cartSidebar = q("#cartSidebar");
  const floatingCart = q("#floatingCart");
  const cartItemsEl = q("#cartItems");
  const cartTotalEl = q("#cartTotal");
  let currentItem = null;

  function formatCurrency(v) {
    return "$" + Number(v).toFixed(2);
  }

  function updateCartUI() {
    const keys = Object.keys(cart);
    let total = 0,
      qty = 0;
    cartItemsEl.innerHTML = "";
    keys.forEach((id) => {
      const it = cart[id];
      const sub = it.price * it.qty;
      total += sub;
      qty += it.qty;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
                <img src="${it.img}" alt="${it.name}">
                <div class="meta">
                    <strong>${it.name}</strong>
                    <small>${formatCurrency(it.price)} x ${
        it.qty
      } = ${formatCurrency(sub)}</small>
                    ${it.note ? <small>Catatan: ${it.note}</small> : ""}
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                    <div class="qty-controls">
                        <button class="btn-decr" data-id="${id}">-</button>
                        <span style="min-width:28px; text-align:center;">${
                          it.qty
                        }</span>
                        <button class="btn-incr" data-id="${id}">+</button>
                    </div>
                    <button class="btn btn-sm btn-link text-danger remove-item" data-id="${id}">Remove</button>
                </div>
            `;
      cartItemsEl.appendChild(div);
    });
    let discountedTotal = total * (1 - discount);
    cartTotalEl.textContent = formatCurrency(discountedTotal);

    if (qty > 0) {
      cartCountEl.style.display = "flex";
      cartCountEl.textContent = qty;
    } else cartCountEl.style.display = "none";
    // bind buttons
    qa(".btn-decr").forEach(
      (b) =>
        (b.onclick = () => {
          changeQty(b.dataset.id, -1);
        })
    );
    qa(".btn-incr").forEach(
      (b) =>
        (b.onclick = () => {
          changeQty(b.dataset.id, +1);
        })
    );
    qa(".remove-item").forEach(
      (b) =>
        (b.onclick = () => {
          removeItem(b.dataset.id);
        })
    );
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty = Math.max(1, cart[id].qty + delta);
    updateCartUI();
  }

  function removeItem(id) {
    delete cart[id];
    updateCartUI();
  }

  function openCart() {
    cartSidebar.classList.add("open");
    cartSidebar.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    cartSidebar.classList.remove("open");
    cartSidebar.setAttribute("aria-hidden", "true");
  }

  floatingCart.addEventListener("click", openCart);
  q("#closeCart").addEventListener("click", closeCart);

  /* -------------------------
       Add-to-cart modal
       ------------------------- */
  const addModalEl = q("#addModal");
  const addModal = new bootstrap.Modal(addModalEl, {
    backdrop: "static",
    keyboard: true,
  });
  qa(".add-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const img = this.dataset.img;
      currentItem = { id, name, price, img };
      q("#addModalTitle").textContent = name;
      q("#addPreview").src = img;
      q("#addModalDesc").textContent =
        this.closest(".menu-content").querySelector(".menu-desc").textContent ||
        "";
      q("#modalPrice").textContent = formatCurrency(price);
      q("#qtyInput").value = 1;
      addModal.show();
    });
  });

  q("#qtyPlus").addEventListener("click", () => {
    q("#qtyInput").value = Number(q("#qtyInput").value || 1) + 1;
  });
  q("#qtyMinus").addEventListener("click", () => {
    q("#qtyInput").value = Math.max(1, Number(q("#qtyInput").value || 1) - 1);
  });

    // ==========================
  // Tambahan fitur baru 1b
  // ==========================
  let discount = 0; // nilai diskon

  // Terapkan promo kode
  q("#applyPromo").addEventListener("click", () => {
    const code = q("#promoCode").value.trim().toUpperCase();
    if (code === "PROMO10") {
      discount = 0.1; // 10% diskon
      alert("Promo berhasil! Diskon 10% diterapkan.");
    } else {
      discount = 0;
      alert("Kode promo tidak valid.");
    }
    updateCartUI();
  });

  // Tambah item ke cart dengan catatan
  q("#addToCartBtn").addEventListener("click", function () {
    const qty = Number(q("#qtyInput").value || 1);
    if (!currentItem) return;
    const note = q("#itemNote") ? q("#itemNote").value.trim() : "";
    const itemKey = currentItem.id + (note ? "-" + note : ""); // beda jika catatan berbeda
    if (cart[itemKey]) cart[itemKey].qty += qty;
    else cart[itemKey] = { ...currentItem, qty, note };
    addModal.hide();
    if (q("#itemNote")) q("#itemNote").value = ""; // reset catatan
    updateCartUI();
    if (typeof showNotification === "function")
      showNotification("Item added to cart", "success");
    else console.log("Added to cart:", currentItem.name, "x", qty);
  });

  // Checkout
  q("#checkoutBtn").addEventListener("click", function () {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      if (typeof showNotification === "function")
        showNotification("Keranjang kosong", "error");
      else alert("Keranjang kosong");
      return;
    }
    let summary = "Order Summary:\n";
    let total = 0;
    keys.forEach((k) => {
      const it = cart[k];
      summary += `${it.name} x ${it.qty} = ${formatCurrency(
        it.price * it.qty
      )}${it.note ? " (Catatan: " + it.note + ")" : ""}\n`;
      total += it.price * it.qty;
    });
    total *= 1 - discount;
    summary += "\nTotal: " + formatCurrency(total);
    if (confirm(summary + "\n\nKonfirmasi checkout?")) {
      if (typeof showNotification === "function")
        showNotification("Checkout sukses — terima kasih!", "success");
      else alert("Checkout sukses — terima kasih!");
      for (const k of Object.keys(cart)) delete cart[k];
      updateCartUI();
      closeCart();
    }
  });

  // Initial render
  updateCartUI();

  /* -------------------------
       Newsletter signup simple handling
       ------------------------- */
  const newsletterForm = q(".newsletter-form");
  if (newsletterForm) {
    const input = q(".newsletter-input", newsletterForm);
    const btn = q(".btn-signup", newsletterForm);
    if (btn && input) {
      btn.addEventListener("click", function () {
        const value = input.value.trim();
        if (!value || !isValidEmail(value)) {
          showNotification("Please enter a valid email address.", "error");
          return;
        }
        console.log("Newsletter signup:", value);
        showNotification("Thanks for subscribing!", "success");
        input.value = "";
      });
    }
  }

  /* -------------------------
       Utilities: notifications & email validation
       ------------------------- */
  function showNotification(message, type) {
    const colors = { success: "#2e7d32", error: "#c62828" };
    const bg = colors[type] || "#333";
    const el = document.createElement("div");
    el.className = "notification";
    el.style.position = "fixed";
    el.style.right = "20px";
    el.style.top = "90px";
    el.style.zIndex = "2000";
    el.style.minWidth = "280px";
    el.style.padding = "12px 16px";
    el.style.borderRadius = "8px";
    el.style.background = bg;
    el.style.color = "#fff";
    el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
    el.style.display = "flex";
    el.style.justifyContent = "space-between";
    el.style.alignItems = "center";
    el.style.gap = "12px";
    el.innerHTML = `<div style="flex:1; font-size:14px">${message}</div>
                        <button aria-label="close" style="background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer">×</button>`;
    const btn = el.querySelector("button");
    btn.addEventListener("click", function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 5000);
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /* -------------------------
       Footer current year
       ------------------------- */
  const y = new Date().getFullYear();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = y.toString();

  // mark body loaded
  window.addEventListener("load", function () {
    document.body.classList.add("loaded");
  });

  /* -------------------------
   Testimonials slider
------------------------- */
  const testimonialViewport = q(".testimonial-viewport");
  const testimonialTrack = q(".testimonial-track");
  const testimonialItems = qa(".testimonial-item");
  const prevBtn = q(".prev-btn");
  const nextBtn = q(".next-btn");

  let currentTestimonial = 0;

  function updateTestimonialPosition() {
    if (
      !testimonialTrack ||
      testimonialItems.length === 0 ||
      !testimonialViewport
    )
      return;
    const viewportWidth = testimonialViewport.clientWidth;
    const itemWidth =
      testimonialItems[0].offsetWidth +
      parseFloat(getComputedStyle(testimonialItems[0]).marginRight || 16);
    const maxIndex = Math.max(
      0,
      testimonialItems.length - Math.floor(viewportWidth / itemWidth)
    );
    if (currentTestimonial > maxIndex) currentTestimonial = maxIndex;
    testimonialTrack.style.transform = `translateX(-${
      currentTestimonial * itemWidth
    }px)`;
    testimonialTrack.style.transition = "transform 0.3s ease";
  }

  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      currentTestimonial = Math.max(0, currentTestimonial - 1);
      updateTestimonialPosition();
    });

  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      const maxIndex = Math.max(0, testimonialItems.length - 1);
      currentTestimonial = Math.min(maxIndex, currentTestimonial + 1);
      updateTestimonialPosition();
    });

  window.addEventListener("resize", updateTestimonialPosition);
  updateTestimonialPosition();
});

document.addEventListener("DOMContentLoaded", function () {
  // Basic helpers
  const q = (s, p = document) => p.querySelector(s);
  const qa = (s, p = document) =>
    Array.from((p || document).querySelectorAll(s));

  // Cart data
  const cart = {}; // id -> {id,name,price,img,qty}
  const cartCountEl = q("#cartCount");
  const cartSidebar = q("#cartSidebar");
  const floatingCart = q("#floatingCart");
  const cartItemsEl = q("#cartItems");
  const cartTotalEl = q("#cartTotal");

  function formatCurrency(v) {
    return "$" + Number(v).toFixed(2);
  }

  function updateCartUI() {
    const keys = Object.keys(cart);
    let total = 0;
    let qty = 0;
    cartItemsEl.innerHTML = "";
    keys.forEach((id) => {
      const it = cart[id];
      const sub = it.price * it.qty;
      total += sub;
      qty += it.qty;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
              <img src="${it.img}" alt="${it.name}">
              <div class="meta">
                <strong>${it.name}</strong>
                <small>${formatCurrency(it.price)} x ${
        it.qty
      } = ${formatCurrency(sub)}</small>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                <div class="qty-controls">
                  <button class="btn-decr" data-id="${id}">-</button>
                  <span style="min-width:28px; text-align:center;">${
                    it.qty
                  }</span>
                  <button class="btn-incr" data-id="${id}">+</button>
                </div>
                <button class="btn btn-sm btn-link text-danger remove-item" data-id="${id}">Remove</button>
              </div>
            `;
      cartItemsEl.appendChild(div);
    });
    cartTotalEl.textContent = formatCurrency(total);
    if (qty > 0) {
      cartCountEl.style.display = "flex";
      cartCountEl.textContent = qty;
    } else cartCountEl.style.display = "none";
    // bind buttons
    qa(".btn-decr").forEach(
      (b) =>
        (b.onclick = () => {
          changeQty(b.dataset.id, -1);
        })
    );
    qa(".btn-incr").forEach(
      (b) =>
        (b.onclick = () => {
          changeQty(b.dataset.id, +1);
        })
    );
    qa(".remove-item").forEach(
      (b) =>
        (b.onclick = () => {
          removeItem(b.dataset.id);
        })
    );
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty = Math.max(1, cart[id].qty + delta);
    updateCartUI();
  }
  function removeItem(id) {
    delete cart[id];
    updateCartUI();
  }

  // Open/close sidebar
  function openCart() {
    cartSidebar.classList.add("open");
    cartSidebar.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    cartSidebar.classList.remove("open");
    cartSidebar.setAttribute("aria-hidden", "true");
  }

  floatingCart.addEventListener("click", openCart);
  q("#closeCart").addEventListener("click", closeCart);

  // Add-to-cart modal logic
  const addModalEl = q("#addModal");
  const addModal = new bootstrap.Modal(addModalEl, {
    backdrop: "static",
    keyboard: true,
  });
  let currentItem = null;
  qa(".add-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const img = this.dataset.img;
      currentItem = { id, name, price, img };
      q("#addModalTitle").textContent = name;
      q("#addPreview").src = img;
      q("#addModalDesc").textContent =
        this.closest(".menu-content").querySelector(".menu-desc").textContent ||
        "";
      q("#modalPrice").textContent = formatCurrency(price);
      q("#qtyInput").value = 1;
      addModal.show();
    });
  });

  q("#qtyPlus").addEventListener("click", () => {
    q("#qtyInput").value = Number(q("#qtyInput").value || 1) + 1;
  });
  q("#qtyMinus").addEventListener("click", () => {
    q("#qtyInput").value = Math.max(1, Number(q("#qtyInput").value || 1) - 1);
  });

  q("#addToCartBtn").addEventListener("click", function () {
    const qty = Number(q("#qtyInput").value || 1);
    if (!currentItem) return;
    if (cart[currentItem.id]) cart[currentItem.id].qty += qty;
    else cart[currentItem.id] = { ...currentItem, qty };
    addModal.hide();
    updateCartUI();
    // show notification (reuse function if in your script.js, else simple alert)
    if (typeof showNotification === "function")
      showNotification("Item added to cart", "success");
    else console.log("Added to cart:", currentItem.name, "x", qty);
  });

  // Checkout simple flow
  q("#checkoutBtn").addEventListener("click", function () {
    const keys = Object.keys(cart);
    if (keys.length === 0) {
      if (typeof showNotification === "function")
        showNotification("Keranjang kosong", "error");
      else alert("Keranjang kosong");
      return;
    }
    // Build summary
    let summary = "Order Summary:\\n";
    let total = 0;
    keys.forEach((k) => {
      const it = cart[k];
      summary += `${it.name} x ${it.qty} = ${formatCurrency(
        it.price * it.qty
      )}\\n`;
      total += it.price * it.qty;
    });
    summary += "\\nTotal: " + formatCurrency(total);
    // For now just show prompt & clear cart on confirm (real app would send to backend)
    if (confirm(summary + "\\n\\nKonfirmasi checkout?")) {
      // simulate checkout success
      if (typeof showNotification === "function")
        showNotification("Checkout sukses — terima kasih!", "success");
      else alert("Checkout sukses — terima kasih!");
      // reset cart
      for (const k of Object.keys(cart)) delete cart[k];
      updateCartUI();
      closeCart();
    }
  });

  // Initial render
  updateCartUI();

  // Menu category filter (if your original script has this, this will complement it)
  qa(".category-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const cat = this.dataset.category || "all";
      qa(".category-btn").forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      qa(".menu-item").forEach((item) => {
        const icat = item.dataset.category || "";
        if (cat === "all" || icat === cat) {
          item.style.display = "block";
          item.style.opacity = "1";
        } else {
          item.style.display = "none";
          item.style.opacity = "0";
        }
      });
    });
  });

  // Accessibility: close sidebar on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeCart();
      if (addModal) addModal.hide();
    }
  });

  // If you have active nav script in script.js it will keep working

  
});

console.log("Testimonial page loaded");
