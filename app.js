(function () {
    "use strict";

    document.documentElement.classList.add("js");

    const DATA = window.FoodLoopData || {};
    const products = Array.isArray(DATA.products) ? DATA.products : [];
    const farmers = Array.isArray(DATA.farmers) ? DATA.farmers : [];
    const recipients = Array.isArray(DATA.recipients) ? DATA.recipients : [];
    const seedDonations = Array.isArray(DATA.seedDonations) ? DATA.seedDonations : [];
    const impact = Array.isArray(DATA.impact) ? DATA.impact : [];
    const activity = DATA.activity || {};
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const numberFormat = new Intl.NumberFormat("en-IN");
    const moneyFormat = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });

    const CART_KEY = "foodloopCart";
    const DONATIONS_KEY = "foodloopDonations";
    const ORDERS_KEY = "foodloopOrders";

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
    }

    function formatCount(element, value) {
        element.textContent = (element.dataset.prefix || "") + numberFormat.format(value);
    }

    function setPluralLabel(counter, value) {
        const label = counter.parentElement && counter.parentElement.querySelector("[data-singular]");
        if (label) label.textContent = value === 1 ? label.dataset.singular : label.dataset.plural;
    }

    const storage = {
        get(key, fallback) {
            try {
                const value = window.localStorage.getItem(key);
                return value === null ? fallback : JSON.parse(value);
            } catch (error) {
                return fallback;
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                return false;
            }
            return true;
        },
        remove(key) {
            try {
                window.localStorage.removeItem(key);
            } catch (error) {
                return false;
            }
            return true;
        }
    };

    let toastTimer;
    function showToast(message) {
        let toast = document.querySelector(".toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toast.classList.remove("is-visible");
        }, 3200);
    }
    window.showToast = showToast;

    function initNav() {
        const toggle = document.querySelector(".nav-toggle");
        const menu = document.getElementById("primary-menu");
        if (!toggle || !menu) return;

        function setMenu(open) {
            menu.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }

        toggle.addEventListener("click", function () {
            setMenu(toggle.getAttribute("aria-expanded") !== "true");
        });

        menu.addEventListener("click", function (event) {
            if (event.target.closest("a")) setMenu(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                setMenu(false);
                toggle.focus();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 760) setMenu(false);
        });
    }

    function productFor(name) {
        return products.find(function (item) { return item.name === name; }) || null;
    }

    function priceFor(name) {
        const product = productFor(name);
        return product ? Number(product.price) || 0 : 0;
    }

    function readCart() {
        const stored = storage.get(CART_KEY, []);
        const items = Array.isArray(stored) ? stored : [];
        return items
            .map(function (item) {
                const name = typeof item === "number" ? String(item) : String(item.name || "");
                const product = productFor(name);
                return {
                    name: name,
                    qty: Math.max(1, Number(item.qty) || 1),
                    price: Number(item.price) || (product ? Number(product.price) || 0 : 0),
                    id: item.id || (product ? product.id : ""),
                    image: item.image || (product ? product.image : "")
                };
            })
            .filter(function (item) { return item.name.length > 0; });
    }

    function saveCart(items) {
        storage.set(CART_KEY, items);
        updateCart();
    }

    function cartTotal(items) {
        return items.reduce(function (sum, item) { return sum + item.qty; }, 0);
    }

    function cartValue(items) {
        return items.reduce(function (sum, item) { return sum + item.qty * item.price; }, 0);
    }

    function updateCart() {
        const count = cartTotal(readCart());
        document.querySelectorAll("[data-cart-count]").forEach(function (node) {
            node.textContent = String(count);
        });
        const badge = document.getElementById("cart-button") || document.querySelector(".cart-badge");
        if (badge) {
            badge.setAttribute("aria-label", "Open cart: " + count + (count === 1 ? " item" : " items"));
        }
    }

    function addToCart(name, price) {
        const items = readCart();
        const product = productFor(name);
        const unitPrice = Number(price) || (product ? Number(product.price) || 0 : 0);
        const existing = items.find(function (item) { return item.name === name; });
        if (existing) {
            existing.qty += 1;
            existing.price = unitPrice || existing.price;
            existing.id = product ? product.id : existing.id;
            existing.image = product ? product.image : existing.image;
        } else {
            items.push({
                name: name,
                qty: 1,
                price: unitPrice,
                id: product ? product.id : "",
                image: product ? product.image : ""
            });
        }
        saveCart(items);
        showToast(name + " added to your cart.");
    }
    window.addToCart = addToCart;

    function orderId() {
        const now = new Date();
        const stamp = String(now.getFullYear()) +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0");
        return "FL-" + stamp + "-" + String(Math.floor(1000 + Math.random() * 9000));
    }

    function readOrders() {
        const orders = storage.get(ORDERS_KEY, []);
        return Array.isArray(orders) ? orders : [];
    }

    function renderOrderList(container) {
        if (!container) return;
        const orders = readOrders().slice(-5).reverse();
        container.textContent = "";
        if (!orders.length) {
            container.appendChild(el("p", "history-empty", "No demo orders yet."));
            return;
        }
        orders.forEach(function (order) {
            const li = el("li");
            li.appendChild(el("strong", null, order.id + " — " + order.customer));
            li.appendChild(el("span", null, order.summary + " • " + moneyFormat.format(order.total) + " • " + order.status));
            container.appendChild(li);
        });
    }

    function initOrders() {
        renderOrderList(document.getElementById("order-list"));
        const empty = document.getElementById("order-empty");
        if (empty) empty.hidden = readOrders().length > 0;
    }

    function initCart() {
        const button = document.getElementById("cart-button");
        if (!button) return;

        const dialog = document.createElement("dialog");
        dialog.id = "cart-dialog";
        dialog.className = "cart-dialog";
        dialog.setAttribute("aria-labelledby", "cart-title");
        dialog.innerHTML =
            '<div class="cart-shell">' +
            '<header class="cart-header">' +
            '<div><p class="cart-kicker">FOODLOOP DEMO</p><h2 id="cart-title">Your basket</h2>' +
            '<p class="cart-subtitle">Review your picks before placing a demo order.</p></div>' +
            '<button class="cart-close-icon" id="cart-close" type="button" aria-label="Close cart">&times;</button>' +
            '</header>' +
            '<div class="cart-tabs" role="tablist" aria-label="Cart sections">' +
            '<button class="cart-tab is-active" id="cart-tab-cart" type="button" role="tab" aria-selected="true">Basket <span id="cart-tab-count">0</span></button>' +
            '<button class="cart-tab" id="cart-orders" type="button" role="tab" aria-selected="false">Demo orders</button>' +
            '</div>' +
            '<section id="cart-panel-cart" class="cart-panel" role="tabpanel">' +
            '<p id="cart-empty" class="cart-empty">Your basket is empty. <a href="market.html">Browse the marketplace</a>.</p>' +
            '<ul id="cart-items" class="cart-items"></ul>' +
            '<div class="cart-summary"><div><span>Items</span><strong id="cart-total-count">0</strong></div>' +
            '<div><span>Subtotal</span><strong id="cart-total-value">₹0</strong></div></div>' +
            '<p class="cart-note">Demo prices only — no payment is taken.</p>' +
            '<form id="checkout-form" class="checkout-form">' +
            '<h3>Delivery details</h3>' +
            '<label>Name<input id="checkout-name" name="checkout-name" autocomplete="name" required></label>' +
            '<label>Contact number<input id="checkout-phone" name="checkout-phone" type="tel" inputmode="tel" autocomplete="tel" required></label>' +
            '<label>Email (optional)<input id="checkout-email" name="checkout-email" type="email" autocomplete="email"></label>' +
            '<label>Delivery or pickup address<textarea id="checkout-address" name="checkout-address" rows="2" required></textarea></label>' +
            '<button class="btn" type="submit">Place demo order</button>' +
            '</form>' +
            '<div id="order-confirmation" class="order-confirmation" hidden></div>' +
            '<div class="cart-actions" id="cart-actions">' +
            '<button class="btn" id="cart-checkout" type="button">Go to checkout</button>' +
            '<button class="btn btn-secondary" id="cart-clear" type="button">Clear basket</button>' +
            '</div>' +
            '</section>' +
            '<section id="cart-panel-orders" class="cart-panel" role="tabpanel" hidden>' +
            '<h3>Demo orders</h3>' +
            '<p class="demo-note">Orders are saved only in this browser.</p>' +
            '<div id="cart-order-list" class="order-list"></div>' +
            '</section>' +
            '</div>';
        document.body.appendChild(dialog);

        const list = dialog.querySelector("#cart-items");
        const empty = dialog.querySelector("#cart-empty");
        const total = dialog.querySelector("#cart-total-count");
        const value = dialog.querySelector("#cart-total-value");
        const tabCount = dialog.querySelector("#cart-tab-count");
        const cartPanel = dialog.querySelector("#cart-panel-cart");
        const ordersPanel = dialog.querySelector("#cart-panel-orders");
        const cartTab = dialog.querySelector("#cart-tab-cart");
        const ordersTab = dialog.querySelector("#cart-orders");
        const checkoutForm = dialog.querySelector("#checkout-form");
        const confirmation = dialog.querySelector("#order-confirmation");
        const orderList = dialog.querySelector("#cart-order-list");

        function setTab(tab) {
            const showCart = tab === "cart";
            cartPanel.hidden = !showCart;
            ordersPanel.hidden = showCart;
            cartTab.classList.toggle("is-active", showCart);
            ordersTab.classList.toggle("is-active", !showCart);
            cartTab.setAttribute("aria-selected", String(showCart));
            ordersTab.setAttribute("aria-selected", String(!showCart));
            if (!showCart) renderOrderList(orderList);
        }

        function render() {
            const items = readCart();
            const actions = dialog.querySelector("#cart-actions");
            if (items.length && !confirmation.hidden) {
                confirmation.hidden = true;
                checkoutForm.hidden = false;
                if (actions) actions.hidden = false;
            }
            list.textContent = "";
            empty.hidden = items.length > 0;
            total.textContent = String(cartTotal(items));
            value.textContent = moneyFormat.format(cartValue(items));
            tabCount.textContent = String(cartTotal(items));
            items.forEach(function (item) {
                const row = el("li", "cart-row");
                const thumb = el("div", "cart-item-thumb");
                if (item.image) {
                    const image = document.createElement("img");
                    image.src = item.image;
                    image.alt = "";
                    image.loading = "lazy";
                    thumb.appendChild(image);
                } else {
                    thumb.textContent = item.name.charAt(0);
                }

                const info = el("div", "cart-item-info");
                info.appendChild(el("span", "cart-item-name", item.name));
                info.appendChild(el("span", "cart-item-price", moneyFormat.format(item.price) + " each"));

                const stepper = el("div", "qty-stepper");
                const minus = el("button", "qty-step", "−");
                minus.type = "button";
                minus.dataset.cartStep = "-1";
                minus.dataset.cartName = item.name;
                minus.setAttribute("aria-label", "Decrease quantity of " + item.name);
                const qty = el("span", "qty-value", String(item.qty));
                const plus = el("button", "qty-step", "+");
                plus.type = "button";
                plus.dataset.cartStep = "1";
                plus.dataset.cartName = item.name;
                plus.setAttribute("aria-label", "Increase quantity of " + item.name);
                stepper.appendChild(minus);
                stepper.appendChild(qty);
                stepper.appendChild(plus);

                const remove = el("button", "cart-remove", "×");
                remove.type = "button";
                remove.dataset.cartRemove = item.name;
                remove.setAttribute("aria-label", "Remove " + item.name + " from cart");

                row.appendChild(thumb);
                row.appendChild(info);
                row.appendChild(stepper);
                row.appendChild(remove);
                list.appendChild(row);
            });
        }

        button.addEventListener("click", function () {
            render();
            setTab("cart");
            if (typeof dialog.showModal === "function") dialog.showModal();
            else showToast("Your cart is saved locally.");
        });

        list.addEventListener("click", function (event) {
            const step = event.target.closest("[data-cart-step]");
            if (step) {
                const items = readCart();
                const found = items.find(function (item) { return item.name === step.dataset.cartName; });
                if (found) {
                    found.qty += Number(step.dataset.cartStep);
                    if (found.qty < 1) {
                        saveCart(items.filter(function (item) { return item.name !== found.name; }));
                        showToast(found.name + " removed from your basket.");
                    } else {
                        saveCart(items);
                    }
                    render();
                }
                return;
            }
            const remove = event.target.closest("[data-cart-remove]");
            if (!remove) return;
            const items = readCart().filter(function (item) { return item.name !== remove.dataset.cartRemove; });
            saveCart(items);
            render();
            showToast(remove.dataset.cartRemove + " removed from your basket.");
        });

        dialog.querySelector("#cart-clear").addEventListener("click", function () {
            saveCart([]);
            render();
            showToast("Basket cleared.");
        });

        dialog.querySelector("#cart-checkout").addEventListener("click", function () {
            setTab("cart");
            const first = dialog.querySelector("#checkout-name");
            if (first) first.focus();
        });

        cartTab.addEventListener("click", function () { setTab("cart"); });
        ordersTab.addEventListener("click", function () { setTab("orders"); });
        dialog.querySelector("#cart-close").addEventListener("click", function () { dialog.close(); });
        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) dialog.close();
        });

        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const items = readCart();
            if (!items.length) {
                showToast("Add an item before placing a demo order.");
                return;
            }
            if (!checkoutForm.reportValidity()) return;

            const order = {
                id: orderId(),
                customer: dialog.querySelector("#checkout-name").value.trim(),
                phone: dialog.querySelector("#checkout-phone").value.trim(),
                email: dialog.querySelector("#checkout-email").value.trim(),
                address: dialog.querySelector("#checkout-address").value.trim(),
                items: items,
                total: cartValue(items),
                status: "Demo order placed",
                placedAt: new Date().toISOString()
            };
            const summary = items.map(function (item) { return item.name + " × " + item.qty; }).join(", ");
            order.summary = summary;
            const orders = readOrders();
            orders.push(order);
            storage.set(ORDERS_KEY, orders.slice(-20));

            saveCart([]);
            render();
            checkoutForm.reset();
            checkoutForm.hidden = true;
            const actions = dialog.querySelector("#cart-actions");
            if (actions) actions.hidden = true;
            confirmation.innerHTML =
                '<span class="confirmation-icon" aria-hidden="true">✓</span>' +
                '<h3>Demo order placed</h3>' +
                '<p>Order <strong>' + order.id + '</strong> is saved in this browser. No payment was taken.</p>' +
                '<p class="confirmation-summary">' + summary + ' · ' + moneyFormat.format(order.total) + '</p>' +
                '<div class="confirmation-actions">' +
                    '<button class="btn" id="confirmation-orders" type="button">View demo orders</button>' +
                    '<button class="btn btn-secondary" id="confirmation-again" type="button">Place another order</button>' +
                '</div>';
            confirmation.hidden = false;
            confirmation.querySelector("#confirmation-orders").addEventListener("click", function () { setTab("orders"); });
            confirmation.querySelector("#confirmation-again").addEventListener("click", function () {
                confirmation.hidden = true;
                checkoutForm.hidden = false;
                if (actions) actions.hidden = false;
                checkoutForm.reset();
                const first = checkoutForm.querySelector("#checkout-name");
                if (first) first.focus();
            });
            renderOrderList(document.getElementById("order-list"));
            const emptyOrders = document.getElementById("order-empty");
            if (emptyOrders) emptyOrders.hidden = true;
            renderOrderList(orderList);
            showToast("Demo order " + order.id + " saved.");
        });
    }

    function initReveal() {
        const items = document.querySelectorAll(".reveal");
        if (!items.length) return;
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (item) { item.classList.add("is-visible"); });
            return;
        }
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
        items.forEach(function (item) { observer.observe(item); });
    }

    function countTo(element, target) {
        if (prefersReducedMotion) {
            formatCount(element, target);
            return;
        }
        const duration = 1200;
        const start = performance.now();
        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            formatCount(element, Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    function initCounters() {
        const counters = document.querySelectorAll("[data-count]");
        if (!counters.length) return;
        counters.forEach(function (counter) {
            formatCount(counter, 0);
            setPluralLabel(counter, Number(counter.dataset.count) || 0);
        });
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            counters.forEach(function (counter) {
                formatCount(counter, Number(counter.dataset.count) || 0);
            });
            return;
        }
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    countTo(entry.target, Number(entry.target.dataset.count) || 0);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        counters.forEach(function (counter) { observer.observe(counter); });
    }

    function renderImpactGraph() {
        const graph = document.getElementById("impact-graph");
        if (graph && !graph.children.length) {
            impact.forEach(function (item, index) {
                const bar = el("div", "bar");
                bar.dataset.value = String(item.value);
                const value = el("span", "bar-value", (item.prefix || "") + numberFormat.format(item.value));
                value.dataset.count = String(item.value);
                if (item.prefix) value.dataset.prefix = item.prefix;
                bar.appendChild(value);
                bar.appendChild(el("div", "bar-track")).appendChild(el("div", "bar-fill"));
                bar.appendChild(el("span", "bar-label", item.label));
                bar.style.setProperty("--delay", String(index * 120) + "ms");
                graph.appendChild(bar);
            });
        }
        const callout = document.getElementById("waste-saved");
        if (callout) callout.dataset.count = String(DATA.calloutValue || 0);
    }

    function initImpactBars() {
        const graph = document.querySelector(".graph");
        if (!graph) return;
        const bars = Array.prototype.slice.call(graph.querySelectorAll(".bar"));
        const values = bars.map(function (bar) { return Number(bar.dataset.value) || 0; });
        const max = Math.max.apply(null, values.concat([1]));
        bars.forEach(function (bar) {
            const fill = bar.querySelector(".bar-fill");
            if (!fill) return;
            const target = Math.max(6, Math.sqrt((Number(bar.dataset.value) || 0) / max) * 100);
            if (prefersReducedMotion || !("IntersectionObserver" in window)) {
                fill.style.height = target + "%";
                return;
            }
            const observer = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    fill.style.height = target + "%";
                    observer.disconnect();
                }
            }, { threshold: 0.3 });
            observer.observe(graph);
        });
    }

    function productCard(product) {
        const card = el("article", "product-card reveal");
        card.dataset.category = product.category;
        card.dataset.product = product.id;
        card.style.setProperty("--delay", "60ms");

        const media = el("div", "card-media");
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.alt;
        image.width = product.width;
        image.height = product.height;
        image.loading = "lazy";
        image.decoding = "async";
        media.appendChild(image);
        media.appendChild(el("span", "badge card-badge", product.badge));

        const body = el("div", "card-body");
        body.appendChild(el("h3", null, product.name));
        body.appendChild(el("p", null, product.description));
        body.appendChild(el("span", "price-tag", moneyFormat.format(product.price)));

        const actions = el("div", "card-button-row");
        const buy = el("button", "btn", "Buy Now");
        buy.type = "button";
        buy.dataset.buy = product.name;
        const details = el("button", "btn btn-secondary", "Details");
        details.type = "button";
        details.dataset.productDetails = product.id;
        actions.appendChild(buy);
        actions.appendChild(details);
        body.appendChild(actions);

        card.appendChild(media);
        card.appendChild(body);
        return card;
    }

    function renderProducts() {
        const grid = document.getElementById("product-grid");
        if (!grid) return;
        products.forEach(function (product) { grid.appendChild(productCard(product)); });
    }

    function renderFeaturedProducts() {
        const grid = document.getElementById("featured-product-grid");
        if (!grid) return;
        products.slice(0, 4).forEach(function (product) { grid.appendChild(productCard(product)); });
    }

    function renderFarmerPreview() {
        const grid = document.getElementById("farmer-preview-grid");
        if (!grid) return;
        const previews = [
            {
                title: "Transparent prices",
                text: "See farm and market rates side by side before you buy."
            },
            {
                title: "Harvest details",
                text: "Each listing shows when the produce was picked and where it came from."
            },
            {
                title: "Farmer profiles",
                text: "Meet the growers and send a demo enquiry from their listings."
            }
        ];
        previews.forEach(function (preview, index) {
            const card = el("article", "feature-card reveal");
            card.style.setProperty("--delay", String(index * 120) + "ms");
            card.appendChild(el("span", "feature-icon", String(index + 1)));
            card.appendChild(el("h3", null, preview.title));
            card.appendChild(el("p", null, preview.text));
            const link = el("a", "btn btn-secondary", "Visit Farmer's Market");
            link.href = "farmer.html";
            card.appendChild(link);
            grid.appendChild(card);
        });
    }

    function initMarketplace() {
        document.addEventListener("click", function (event) {
            const buy = event.target.closest("[data-buy]");
            if (buy) addToCart(buy.dataset.buy, priceFor(buy.dataset.buy));
        });

        const chips = document.querySelectorAll(".filter-row .chip[data-filter]");
        if (!chips.length) return;
        const cards = Array.prototype.slice.call(document.querySelectorAll("#product-grid .product-card[data-category]"));
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                const category = chip.dataset.filter;
                chips.forEach(function (other) {
                    other.setAttribute("aria-pressed", String(other === chip));
                });
                cards.forEach(function (card) {
                    const categories = card.dataset.category.split(/\s+/);
                    card.hidden = category !== "all" && categories.indexOf(category) === -1;
                });
            });
        });
    }

    function initProductDialog() {
        const dialog = document.createElement("dialog");
        dialog.id = "product-dialog";
        dialog.setAttribute("aria-labelledby", "product-dialog-title");
        dialog.innerHTML =
            '<div class="dialog-body">' +
            '<h2 id="product-dialog-title"></h2>' +
            '<p id="product-dialog-detail"></p>' +
            '<p id="product-dialog-meta" class="dialog-meta"></p>' +
            '<p id="product-dialog-price" class="dialog-price"></p>' +
            '<p class="demo-note">Demo product — details and prices are illustrative.</p>' +
            '<button class="btn" id="product-dialog-add" type="button">Add to cart</button>' +
            '<button class="btn btn-secondary" id="product-dialog-close" type="button">Close</button>' +
            '</div>';
        document.body.appendChild(dialog);

        const title = dialog.querySelector("#product-dialog-title");
        const detail = dialog.querySelector("#product-dialog-detail");
        const meta = dialog.querySelector("#product-dialog-meta");
        const price = dialog.querySelector("#product-dialog-price");
        let current = null;

        document.addEventListener("click", function (event) {
            const button = event.target.closest("[data-product-details]");
            if (!button) return;
            current = products.find(function (product) { return product.id === button.dataset.productDetails; });
            if (!current) return;
            title.textContent = current.name;
            detail.textContent = current.details;
            meta.textContent = current.material + " • " + current.origin + " • " + current.badge;
            price.textContent = moneyFormat.format(current.price);
            if (typeof dialog.showModal === "function") dialog.showModal();
        });

        dialog.querySelector("#product-dialog-add").addEventListener("click", function () {
            if (!current) return;
            addToCart(current.name, current.price);
            dialog.close();
        });
        dialog.querySelector("#product-dialog-close").addEventListener("click", function () { dialog.close(); });
        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) dialog.close();
        });
    }

    function farmerCard(farmer) {
        const saved = Math.round((1 - farmer.farmPrice / farmer.marketPrice) * 100);
        const card = el("article", "product-card reveal");
        card.dataset.name = farmer.name;
        card.dataset.category = farmer.categories.join(" ");
        card.dataset.farm = String(farmer.farmPrice);
        card.dataset.market = String(farmer.marketPrice);

        const media = el("div", "card-media");
        const image = document.createElement("img");
        image.src = farmer.image;
        image.alt = farmer.alt;
        image.width = farmer.width;
        image.height = farmer.height;
        image.loading = "lazy";
        image.decoding = "async";
        media.appendChild(image);
        media.appendChild(el("span", "badge card-badge", saved + "% saved"));

        const body = el("div", "card-body");
        body.appendChild(el("h3", null, farmer.name));
        const priceRow = el("div", "price-row");
        const farmPrice = el("span", "farm-price", moneyFormat.format(farmer.farmPrice) + "/kg ");
        farmPrice.appendChild(el("small", null, "Farm price"));
        priceRow.appendChild(farmPrice);
        priceRow.appendChild(el("span", "market-price", "Market " + moneyFormat.format(farmer.marketPrice) + "/kg"));
        body.appendChild(priceRow);
        body.appendChild(el("p", "quantity", "Quantity available: " + farmer.quantity));
        body.appendChild(el("p", "quantity", "Farmer: " + farmer.farmer + " • Harvested " + farmer.harvestDate));
        body.appendChild(el("span", "stock-badge" + (farmer.low ? " is-low" : ""), farmer.stock));

        const actions = el("div", "card-button-row");
        const profile = el("button", "btn btn-secondary", "Farmer profile");
        profile.type = "button";
        profile.dataset.farmerProfile = farmer.id;
        const contact = el("button", "btn", "Contact farmer");
        contact.type = "button";
        contact.dataset.farmerProduct = farmer.id;
        actions.appendChild(profile);
        actions.appendChild(contact);
        body.appendChild(actions);

        card.appendChild(media);
        card.appendChild(body);
        return card;
    }

    function initFarmer() {
        const grid = document.getElementById("farmer-produce");
        const search = document.getElementById("search");
        const category = document.getElementById("category");
        const maxPrice = document.getElementById("maxprice");
        const empty = document.getElementById("no-results");

        if (grid) farmers.forEach(function (farmer) { grid.appendChild(farmerCard(farmer)); });

        function applyFilters() {
            if (!search || !category || !maxPrice) return;
            const query = search.value.trim().toLowerCase();
            const chosen = category.value;
            const limit = maxPrice.value === "" ? Infinity : Number(maxPrice.value);
            let visible = 0;
            const cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".product-card")) : [];
            cards.forEach(function (card) {
                const name = (card.dataset.name || "").toLowerCase();
                const categories = (card.dataset.category || "").split(/\s+/);
                const price = Number(card.dataset.farm);
                const matchesQuery = !query || name.indexOf(query) !== -1 || categories.indexOf(query) !== -1;
                const matchesCategory = !chosen || categories.indexOf(chosen) !== -1;
                const matchesPrice = !Number.isFinite(limit) || price <= limit;
                const show = matchesQuery && matchesCategory && matchesPrice;
                card.hidden = !show;
                if (show) visible += 1;
            });
            if (empty) empty.hidden = visible !== 0;
        }

        window.filterVegetables = applyFilters;
        [search, category, maxPrice].forEach(function (control) {
            if (!control) return;
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });
        const apply = document.getElementById("apply-filters");
        if (apply) apply.addEventListener("click", applyFilters);

        const contactDialog = document.getElementById("farmer-dialog");
        const contactMessage = document.getElementById("farmer-dialog-message");
        const profileDialog = document.getElementById("farmer-profile-dialog");
        const profileTitle = document.getElementById("farmer-profile-title");
        const profileDetails = document.getElementById("farmer-profile-details");

        document.addEventListener("click", function (event) {
            const profileButton = event.target.closest("[data-farmer-profile]");
            if (profileButton) {
                const farmer = farmers.find(function (item) { return item.id === profileButton.dataset.farmerProfile; });
                if (!farmer) return;
                if (profileTitle) profileTitle.textContent = farmer.farmer;
                if (profileDetails) {
                    profileDetails.textContent = farmer.location + " • " + farmer.farmSize + " farm • " +
                        farmer.name + " harvested " + farmer.harvestDate + ". " + farmer.note;
                }
                if (profileDialog && typeof profileDialog.showModal === "function") profileDialog.showModal();
                return;
            }

            const contactButton = event.target.closest("[data-farmer-product]");
            if (contactButton) {
                const id = contactButton.dataset.farmerProduct;
                const farmer = farmers.find(function (item) { return item.id === id || item.name === id; });
                const label = farmer ? farmer.name : id;
                if (contactMessage) {
                    contactMessage.textContent = "Demo enquiry for " + label +
                        ": the farmer would be notified here. " +
                        (farmer ? "Harvested " + farmer.harvestDate + " in " + farmer.location + "." : "No real message was sent.");
                }
                if (contactDialog && typeof contactDialog.showModal === "function") contactDialog.showModal();
                else showToast("Demo enquiry recorded — no real message was sent.");
            }
        });

        const closeContact = document.getElementById("farmer-dialog-close");
        if (closeContact && contactDialog) closeContact.addEventListener("click", function () { contactDialog.close(); });
        const closeProfile = document.getElementById("farmer-profile-close");
        if (closeProfile && profileDialog) closeProfile.addEventListener("click", function () { profileDialog.close(); });
        [contactDialog, profileDialog].forEach(function (dialog) {
            if (!dialog) return;
            dialog.addEventListener("click", function (event) {
                if (event.target === dialog) dialog.close();
            });
        });
    }

    function initRecipients() {
        const list = document.getElementById("recipient-list");
        const search = document.getElementById("recipient-search");
        const empty = document.getElementById("recipient-empty");
        const dialog = document.getElementById("recipient-dialog");
        const mapElement = document.getElementById("map");
        const categoryMeta = {
            ngo: { color: "--type-ngo" },
            shelter: { color: "--type-shelter" },
            kitchen: { color: "--type-kitchen" },
            volunteer: { color: "--type-volunteer" }
        };
        const stats = {
            "ngos-count": activity.ngos,
            "restaurants-count": activity.restaurants,
            "volunteers-count": activity.volunteers,
            "meals-saved": activity.meals
        };

        Object.keys(stats).forEach(function (id) {
            const node = document.getElementById(id);
            if (node && stats[id] !== undefined) node.dataset.count = String(stats[id]);
        });

        let activeType = "all";
        let current = null;
        let map = null;
        let markerLayer = null;
        const markers = {};
        const items = {};

        function color(name) {
            return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        }

        recipients.forEach(function (recipient) {
            const meta = categoryMeta[recipient.category] || categoryMeta.ngo;
            const pinColor = color(meta.color);

            if (list) {
                const li = el("li", "recipient-item");
                li.dataset.category = recipient.category;
                const button = el("button");
                button.type = "button";
                button.dataset.recipient = String(recipient.id);
                button.appendChild(el("span", "recipient-name", recipient.name));
                const type = el("span", "recipient-type");
                const dot = el("span", "type-dot");
                dot.style.setProperty("--dot", pinColor);
                type.appendChild(dot);
                type.appendChild(document.createTextNode("Type: " + recipient.type));
                button.appendChild(type);
                button.appendChild(el("span", "recipient-area", recipient.area));
                li.appendChild(button);
                list.appendChild(li);
                items[recipient.id] = li;
            }

            if (mapElement && typeof window.L !== "undefined") {
                const icon = window.L.divIcon({
                    className: "recipient-marker",
                    html: '<span class="marker-pin" style="--pin:' + pinColor + '"></span>',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28],
                    popupAnchor: [0, -26]
                });
                markers[recipient.id] = window.L.marker(recipient.location, { icon: icon });
                markers[recipient.id].bindPopup("<strong>" + recipient.name + "</strong><br>" + recipient.area + "<br>Type: " + recipient.type);
            }
        });

        if (mapElement && typeof window.L !== "undefined") {
            map = window.L.map(mapElement, { scrollWheelZoom: false }).setView([17.4122, 78.4482], 12);
            window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            markerLayer = window.L.layerGroup().addTo(map);
            Object.keys(markers).forEach(function (key) {
                markers[key].addTo(markerLayer);
                markers[key].on("click", function () { select(Number(key), false); });
            });
            window.setTimeout(function () { map.invalidateSize(); }, 150);
        }

        function isVisible(recipient) {
            const query = search ? search.value.trim().toLowerCase() : "";
            const searchable = [recipient.name, recipient.type, recipient.area, recipient.needs].join(" ").toLowerCase();
            const matchesType = activeType === "all" || recipient.category === activeType ||
                (activeType === "ngo" && recipient.type === "NGO");
            return matchesType && (!query || searchable.indexOf(query) !== -1);
        }

        function applyFilters() {
            let visible = 0;
            recipients.forEach(function (recipient) {
                const show = isVisible(recipient);
                if (show) visible += 1;
                if (items[recipient.id]) items[recipient.id].hidden = !show;
                if (!markers[recipient.id] || !markerLayer) return;
                if (show) markerLayer.addLayer(markers[recipient.id]);
                else markerLayer.removeLayer(markers[recipient.id]);
            });
            if (empty) empty.hidden = visible !== 0;
        }

        function select(id, pan) {
            const recipient = recipients.find(function (item) { return item.id === id; });
            if (!recipient) return;
            Object.keys(items).forEach(function (key) {
                items[key].classList.toggle("is-active", Number(key) === id);
            });
            if (pan && map) map.setView(recipient.location, 15, { animate: !prefersReducedMotion });
            if (markers[id]) markers[id].openPopup();
            if (!pan && items[id]) {
                items[id].scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
            }
        }

        if (list) {
            list.addEventListener("click", function (event) {
                const button = event.target.closest("[data-recipient]");
                if (!button) return;
                const id = Number(button.dataset.recipient);
                current = recipients.find(function (item) { return item.id === id; });
                select(id, false);
                if (!dialog || !current) return;
                document.getElementById("recipient-dialog-name").textContent = current.name;
                document.getElementById("recipient-dialog-type").textContent = current.type + " • " + current.area;
                document.getElementById("recipient-dialog-needs").textContent = current.needs;
                document.getElementById("recipient-dialog-hours").textContent = current.hours;
                document.getElementById("recipient-dialog-capacity").textContent = current.capacity;
                document.getElementById("recipient-dialog-description").textContent = current.description;
                if (typeof dialog.showModal === "function") dialog.showModal();
            });
        }

        if (search) search.addEventListener("input", applyFilters);
        document.querySelectorAll(".filter-chips .chip[data-type-filter]").forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeType = chip.dataset.typeFilter;
                document.querySelectorAll(".filter-chips .chip[data-type-filter]").forEach(function (other) {
                    other.setAttribute("aria-pressed", String(other === chip));
                });
                applyFilters();
            });
        });

        if (dialog) {
            document.getElementById("recipient-contact").addEventListener("click", function () {
                if (!current) return;
                const link = document.getElementById("recipient-contact-link");
                if (link) link.href = "mailto:" + current.contact;
                showToast("Demo contact only — no real message was sent.");
            });
            document.getElementById("recipient-map").addEventListener("click", function () {
                if (!current) return;
                dialog.close();
                select(current.id, true);
                if (!map) showToast("Map preview is unavailable offline.");
            });
            document.getElementById("recipient-close").addEventListener("click", function () { dialog.close(); });
            dialog.addEventListener("click", function (event) {
                if (event.target === dialog) dialog.close();
            });
        }

        applyFilters();
    }

    function getDonations() {
        const stored = storage.get(DONATIONS_KEY, null);
        if (Array.isArray(stored)) return stored;
        const seeded = seedDonations.slice();
        storage.set(DONATIONS_KEY, seeded);
        return seeded;
    }

    function initDonation() {
        const form = document.getElementById("foodDonationform");
        if (!form) return;

        const fieldIds = [
            "name", "contactNumber", "email", "foodCategory", "foodType", "quantity", "unit",
            "location", "expiry", "expiryTime", "pickupDate", "pickupTime", "consent"
        ];
        const fields = {};
        fieldIds.forEach(function (id) { fields[id] = document.getElementById(id); });

        const requiredLabels = {
            name: "Please enter your name.",
            contactNumber: "Add a contact number so we can confirm the demo pickup.",
            email: "Enter a valid email address.",
            foodCategory: "Choose a food category.",
            foodType: "Tell us what food you are donating, e.g. fruits, bread.",
            quantity: "Enter how much food you are donating.",
            unit: "Choose a quantity unit.",
            location: "Add a drop-off location, e.g. Delhi or Hyderabad.",
            expiry: "Choose an expiry date.",
            pickupDate: "Choose a pickup date.",
            pickupTime: "Choose a pickup time.",
            consent: "Please confirm this is a demo donation."
        };

        function todayLocal() {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        function validDate(value) {
            const parts = value.split("-").map(Number);
            if (parts.length !== 3) return null;
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        function validate(key) {
            const input = fields[key];
            if (!input) return true;
            const error = document.getElementById(key + "-error");
            const value = input.value.trim();
            let message = "";

            if (key === "consent") {
                if (!input.checked) message = requiredLabels[key];
            } else if ((key === "email" || key === "expiryTime") && !value) {
                message = "";
            } else if (!value) {
                message = requiredLabels[key];
            } else if (key === "name" && value.length < 2) {
                message = "Please use at least 2 characters for your name.";
            } else if (key === "foodType" && value.length < 2) {
                message = "Please describe the food in at least 2 characters.";
            } else if (key === "location" && value.length < 2) {
                message = "Please add a more specific location.";
            } else if (key === "contactNumber") {
                const digits = value.replace(/[\s-]/g, "");
                if (!/^\+?\d{7,15}$/.test(digits)) message = "Use 7 to 15 digits. Spaces and dashes are allowed.";
            } else if (key === "email") {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Enter a valid email address.";
            } else if (key === "quantity") {
                const amount = Number(value);
                if (!Number.isFinite(amount) || amount <= 0) message = "Quantity must be a number greater than 0.";
            } else if (key === "expiry" || key === "pickupDate") {
                const date = validDate(value);
                if (!date) message = "Enter a valid date in the format YYYY-MM-DD.";
                else if (date < todayLocal()) message = "That date has passed. Please choose today or a future date.";
            } else if ((key === "pickupTime" || key === "expiryTime") && !/^\d{2}:\d{2}$/.test(value)) {
                message = key === "pickupTime" ? "Choose a pickup time." : "Choose a valid expiry time.";
            }

            input.setAttribute("aria-invalid", String(Boolean(message)));
            if (error) error.textContent = message;
            return !message;
        }

        fieldIds.forEach(function (key) {
            const input = fields[key];
            if (!input) return;
            input.addEventListener("blur", function () { validate(key); });
            input.addEventListener("input", function () {
                if (input.getAttribute("aria-invalid") === "true") validate(key);
            });
            input.addEventListener("change", function () { validate(key); });
        });

        function renderHistory() {
            const list = document.getElementById("donation-history");
            const empty = document.getElementById("history-empty");
            if (!list) return;
            const donations = getDonations().slice(-5).reverse();
            list.textContent = "";
            if (empty) empty.hidden = donations.length > 0;
            donations.forEach(function (donation) {
                const li = el("li");
                li.appendChild(el("strong", null, donation.name + " — " + donation.foodType));
                const expiryLabel = "expires " + donation.expiry + (donation.expiryTime ? " at " + donation.expiryTime : "");
                li.appendChild(el("span", null,
                    donation.quantity + " " + (donation.unit || "kg") + " • " + donation.location +
                    " • " + expiryLabel + " • " + (donation.status || "Pending demo match")
                ));
                list.appendChild(li);
            });
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            let valid = true;
            fieldIds.forEach(function (key) {
                if (!validate(key)) valid = false;
            });
            if (!valid) {
                const firstInvalid = form.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            const donation = {
                name: fields.name.value.trim(),
                contact: fields.contactNumber.value.trim(),
                email: fields.email.value.trim(),
                foodCategory: fields.foodCategory.value,
                foodType: fields.foodType.value.trim(),
                quantity: Number(fields.quantity.value),
                unit: fields.unit.value,
                location: fields.location.value.trim(),
                expiry: fields.expiry.value,
                expiryTime: fields.expiryTime.value,
                pickupDate: fields.pickupDate.value,
                pickupTime: fields.pickupTime.value,
                instructions: document.getElementById("instructions").value.trim(),
                status: "Pending demo match",
                submittedAt: new Date().toISOString()
            };
            const donations = getDonations();
            donations.push(donation);
            storage.set(DONATIONS_KEY, donations.slice(-20));
            renderHistory();

            const thankYou = document.getElementById("thank-you");
            const donor = document.getElementById("thank-you-name");
            const status = document.getElementById("thank-you-status");
            if (donor) donor.textContent = donation.name;
            if (status) status.textContent = donation.status;
            form.hidden = true;
            if (thankYou) thankYou.hidden = false;
            showToast("Thank you, " + donation.name + "! Your demo donation is recorded.");
            if (thankYou) thankYou.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
        });

        const again = document.getElementById("donate-again");
        if (again) {
            again.addEventListener("click", function () {
                form.reset();
                fieldIds.forEach(function (key) {
                    if (fields[key]) fields[key].setAttribute("aria-invalid", "false");
                });
                form.querySelectorAll(".field-error").forEach(function (node) { node.textContent = ""; });
                form.hidden = false;
                if (document.getElementById("thank-you")) document.getElementById("thank-you").hidden = true;
                fields.name.focus();
            });
        }

        renderHistory();
    }

    function renderFooter() {
        if (document.querySelector(".site-footer")) return;
        const footer = document.createElement("footer");
        footer.className = "site-footer";
        footer.innerHTML =
            '<div class="container footer-inner">' +
                '<nav class="footer-nav" aria-label="Footer navigation">' +
                    '<h2>Explore FoodLoop</h2>' +
                    '<ul>' +
                        '<li><a href="index.html#home">Home</a></li>' +
                        '<li><a href="donate.html">Donate</a></li>' +
                        '<li><a href="market.html">Marketplace</a></li>' +
                        '<li><a href="farmer.html">Farmer\'s Market</a></li>' +
                        '<li><a href="recipients.html">Find Recipients</a></li>' +
                    '</ul>' +
                '</nav>' +
                '<div class="footer-grid">' +
                    '<section class="footer-about">' +
                        '<a class="logo" href="index.html"><img src="foodloop-logo.svg" alt="FoodLoop" width="150" height="36"></a>' +
                        '<p>Turning surplus food into value for people and the planet.</p>' +
                    '</section>' +
                    '<nav class="footer-links" aria-label="More information">' +
                        '<h2>More</h2>' +
                        '<ul>' +
                            '<li><a href="index.html#mission">Our mission</a></li>' +
                            '<li><a href="index.html#how-it-works">How it works</a></li>' +
                            '<li><a href="index.html#impact">Demo impact</a></li>' +
                            '<li><a href="index.html#featured-products">Featured products</a></li>' +
                            '<li><a href="market.html#order-history">Order history</a></li>' +
                        '</ul>' +
                    '</nav>' +
                    '<div class="footer-contact">' +
                        '<h2>Contact</h2>' +
                        '<p><a href="mailto:hello@foodloop.demo">hello@foodloop.demo</a></p>' +
                        '<p>Demo enquiries only</p>' +
                        '<p class="footer-credit">Built by Triovators</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="container footer-bottom-row">' +
                '<p class="footer-bottom">&copy; 2026 FoodLoop. Static demo — no real transactions.</p>' +
                '<button class="footer-reset" id="reset-demo-data" type="button">Reset demo data</button>' +
            '</div>';
        document.body.appendChild(footer);
    }

    function initResetDemo() {
        const reset = document.getElementById("reset-demo-data");
        if (!reset) return;
        reset.addEventListener("click", function () {
            if (!window.confirm("Reset all FoodLoop demo data? This clears your cart, donations and demo orders.")) return;
            [CART_KEY, DONATIONS_KEY, ORDERS_KEY].forEach(storage.remove);
            window.location.reload();
        });
    }

    renderFooter();
    initNav();
    renderImpactGraph();
    renderFeaturedProducts();
    renderFarmerPreview();
    renderProducts();
    initMarketplace();
    initProductDialog();
    initFarmer();
    initRecipients();
    initDonation();
    initOrders();
    initCart();
    initResetDemo();
    initCounters();
    initImpactBars();
    initReveal();
    updateCart();
}());
