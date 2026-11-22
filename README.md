# FoodLoop

FoodLoop is a static, multi-page website that turns surplus food into value. It connects people who have excess food with people who need it, showcases upcycled products, links buyers to farmers, and maps nearby recipients.

## Features

- **Shared demo data** — one `data.js` source for products, farmers, recipients, impact figures and seeded donations, rendered into the pages by `app.js`.
- **Home** — gradient hero with `#FOODSAVE` tag, Our Mission, "What we do", a four-step How FoodLoop Works section, Explore Services, featured products, farmer preview, labelled demo impact bars, and a closing CTA.
- **Donate** — expanded demo form with contact details, category, unit, expiry date and optional expiry time, pickup date/time, instructions and consent, inline validation, seeded and browser-saved donation history with demo statuses, and a thank-you card.
- **Marketplace** — 12 non-produce upcycled products in evenly sized cards, with category filters, product detail dialog, waste-saved badges and prices. The shared basket has thumbnails, quantity steppers, tabs for demo orders, checkout and local order history.
- **Farmer's Market** — live search, category and max-price filters that work together, an empty state, farm-vs-market pricing with savings percentages, stock badges, farmer profile dialogs and demo enquiry dialogs.
- **Find Recipients** — recipient search, type filters, Leaflet map with custom coloured markers, linked side list, detail dialogs with demo contact and "View on map", plus animated activity counters.
- **Demo controls** — localStorage-backed cart, donations and orders; a shared footer reset button clears all demo data and reseeds examples.
- **Shared UI** — sticky responsive navigation with mobile menu and cart badge, single-row footer navigation, contact and credit block, skip link, focus states, demo notes and reduced-motion support.

## Tech stack

Plain HTML, CSS and vanilla JavaScript with `data.js` for static demo datasets and `app.js` for shared behaviour. No framework, build step, backend, database, auth or payment gateway. Google Fonts (Bricolage Grotesque and Figtree) and Leaflet (CDN) are the only external dependencies. Local images are committed in the repository.

## Screenshots

Placeholder — add screenshots here, for example:

```markdown
![Home page](docs/screenshots/home.png)
![Marketplace](docs/screenshots/marketplace.png)
```

## Live demo

Placeholder — replace with the deployed Vercel URL, for example `https://your-project.vercel.app`.

## Local development

Serve the folder over HTTP so `localStorage` and Leaflet work as expected:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.
