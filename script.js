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

})