# 🛍️ Product Search App (Next.js + FlexSearch)

A fast, scalable product search web app built with **Next.js** and **FlexSearch**. Product information is stored in a lightweight **SQLite** database and indexed for fast searching.

---

## 🚀 Features

- Full-text search on product fields (title, vendor, tags, etc.)
- Extremely fast indexing via **FlexSearch.Document**
- Manage products via a simple admin panel with a SQLite backend
- Public search API: `/api/search?q=...`
- Optional `SKIP_INDEX_BUILD` flag to avoid rebuilding during deployment
- Fully deployable on **Vercel** with CI/CD
- Modern responsive UI built with **Tailwind CSS** and **DaisyUI**
- User-selectable light or dark mode with automatic theme persistence

---

## 🛠️ Setup (Local Development)

1. **Clone the project**

```bash
git clone https://github.com/your-username/product-search-app.git
cd product-search-app
```

2. **Install dependencies**

```bash
npm install
```

This will also install **DaisyUI**, a Tailwind CSS component library used throughout the app, and run `prisma generate` to build the Prisma client.

3. **Create `.env.local`**

```env
SKIP_INDEX_BUILD=false
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=random-secret
```

4. **Initialize the database**

```bash
npm run migrate
```

6. **Place your product data**

Either put your `products.csv` inside the `/data/` directory **or** specify a
remote file via the `PRODUCTS_URL` environment variable.

7. **Run the project**

```bash
npm run dev
```

Navigate to `http://localhost:3000` to access the UI.

---

## ⚙️ Manual Index Generation (Before Production Deploy)

Only needed once (or if your product data changes):

```bash
npm run generate-index
```

This script will:

- Load product data from the SQLite database
- Build a FlexSearch index
- Save the index to `public/index.json`

---

## 🚀 Deploy to Vercel

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/product-search-app.git
git push -u origin main
```

2. **Import project in Vercel**

Go to [https://vercel.com/import](https://vercel.com/import)  
Link your GitHub project.

3. **Set environment variables**

In the Vercel dashboard:

| Key                     | Value                              |
| ----------------------- | ---------------------------------- |
| `SKIP_INDEX_BUILD`      | `true` (to skip rebuild at deploy) |

4. **Deploy**

Vercel will auto-deploy. The frontend will fetch the search index from the generated index file.

---

## 🌐 API Usage

**GET** `/api/search?q=vitamin`

Returns matching products in enriched format.

---

## 📂 Project Structure

```
├── data/                # optional if using PRODUCTS_URL
│   └── products.csv
├── lib/
│   └── products.js
├── scripts/
│   └── generate-search-index.mjs
├── pages/
│   ├── index.tsx
│   └── api/
│       └── search.ts
├── .env.local
└── package.json
```

---

## 🔎 FlexSearch Notes

- `FlexSearch.Document` is used for field-based indexing
- Indexed fields include:  
  `TITLE`, `VENDOR`, `TAGS`, `DESCRIPTION_TEXT`, `BODY_HTML_TEXT`, `PRODUCT_TYPE`, `METAFIELDS.my_fields_ingredients.value`
- Search supports partial and case-insensitive queries
- During CSV load:
  - HTML is stripped from body and description using `jsdom`
  - JSON fields are parsed safely
- The index is serialized to `public/index.json`
- on next load, the app reads and deserializes the pre-built index for faster boot

---

## 👨‍💻 Author

**Junaid Aziz**  
📧 junaidaziz8@gmail.com  
📞 +92 333 0433797  
🧠 Skype: junaidaziz8  
🌍 Based in Lahore, Pakistan

---

## 📝 License

MIT – Feel free to use and modify.
