# 🛍️ Product Search App (Next.js + FlexSearch)

A fast, scalable product search web app built with **Next.js**, **FlexSearch**, and **Vercel Blob Storage**. It loads product data from a CSV file, builds an efficient in-memory search index, and exposes an API endpoint for frontend consumption or integrations.

---

## 🚀 Features

- Full-text search on product fields (title, vendor, tags, etc.)
- Extremely fast indexing via **FlexSearch.Document**
- Parses large CSV datasets efficiently
- Public search API: `/api/search?q=...`
- Caches search index using **Vercel Blob Storage**
- Optional `SKIP_INDEX_BUILD` flag to avoid rebuilding during deployment
- Fully deployable on **Vercel** with CI/CD

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

3. **Create `.env.local`**

```env
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
BLOB_BASE_URL=https://your-vercel-blob-url
SKIP_INDEX_BUILD=false
```

4. **Place your product data**

Either put your `products.csv` inside the `/data/` directory **or** specify a
remote file via the `PRODUCTS_URL` environment variable.

5. **Run the project**

```bash
npm run dev
```

Navigate to `http://localhost:3000` to access the UI.

---

## ⚙️ Manual Index Generation (Before Production Deploy)

Only needed once (or if your CSV changes):

```bash
npm run generate-index
```

This script will:

- Load product data from your CSV file or `PRODUCTS_URL`
- Build a FlexSearch index
- Upload the index to Vercel Blob with the exact filename

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

| Key                   | Value                                |
|------------------------|----------------------------------------|
| `BLOB_READ_WRITE_TOKEN` | your blob RW token                    |
| `BLOB_BASE_URL`         | https://your-vercel-blob-url          |
| `SKIP_INDEX_BUILD`      | `true` (to skip rebuild at deploy)    |

4. **Deploy**

Vercel will auto-deploy. The frontend will fetch the search index from the uploaded blob.

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
- The index is serialized and uploaded as `flexsearch_index.json` to Blob
- On next load, the app fetches and deserializes the pre-built index for faster boot

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
