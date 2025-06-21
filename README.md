# 🛍️ Product Search App (Next.js + Typesense)

A fast, scalable product search web app built with **Next.js** and **Typesense**. Product data is stored in **PostgreSQL** using **Prisma**.

---

## 🚀 Features

- Full-text search on product fields (title, vendor, tags, etc.)
- High-performance search powered by **Typesense**
- Manage products via a simple admin panel with a PostgreSQL backend using Prisma
- Public search API: `/api/search?q=...`
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

This will also install **DaisyUI**, load your `.env` file and run `prisma generate` to build the Prisma client.

During postinstall your environment variables are read automatically so the database and Prisma client are ready without additional steps.

3. **Configure environment variables**

`npm install` will copy `.env.example` to `.env` if it does not exist. Edit this file and set `DATABASE_URL` to point to your local PostgreSQL instance.

Next.js runtime variables go in `.env.local`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=random-secret
```

4. **Initialize the database**

```bash
npm run migrate
```

5. **Run Typesense**

```bash
docker run -d \
  -p 8108:8108 \
  -v/tmp/typesense-data:/data \
  typesense/typesense:0.25.1 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

Ensure `.env` contains:

```env
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

Visit [http://localhost:8108/health](http://localhost:8108/health) to verify the server is running.

6. **Place your product data**

Either put your `products.csv` inside the `/data/` directory **or** specify a
remote file via the `PRODUCTS_URL` environment variable.

7. **Run the project**

```bash
npm run dev
```

Navigate to `http://localhost:3000` to access the UI.

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

3. **Set environment variables** in the Vercel dashboard, then deploy.

4. **Deploy**

Vercel will auto-deploy.

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
│   └── migrate.ts
├── pages/
│   ├── index.tsx
│   └── api/
│       └── search.ts
├── .env.local
└── package.json
```

## 🧩 Form Field Components

Reusable form elements live in `/components/form-fields` and accept common props like `label`, `value` and `onChange`.

Available components: `TextInput`, `EmailInput`, `PasswordInput`, `Textarea`, `SelectDropdown`, `Checkbox`, `RadioGroup`, `DatePicker` and `FileUpload`.

```tsx
import { TextInput, PasswordInput } from "@/components/form-fields";

<TextInput label="First Name" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
<PasswordInput label="Password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
```

`SelectDropdown` uses **react-select** and supports searchable single or multi selects.

```tsx
import { SelectDropdown } from '@/components/form-fields';

const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
];

<SelectDropdown
  label="Pick one"
  name="choice"
  options={options}
  value={options[0]}
  onChange={(val) => console.log(val)}
  isSearchable
/>;
```
## 📊 Database ER Diagram

Run `npm run generate:erd` to generate `docs/ERD.png` from the Prisma schema.

![ERD](docs/ERD.png)


## 👨‍💻 Author

**Junaid Aziz**  
📧 junaidaziz8@gmail.com  
📞 +92 333 0433797  
🧠 Skype: junaidaziz8  
🌍 Based in Lahore, Pakistan

---

## 📝 License

MIT – Feel free to use and modify.
