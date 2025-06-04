# Contributing to Product Search App

Thanks for your interest in contributing to the Product Search App! 🎉  
This project is a FlexSearch-powered product listing application built with Next.js, and your support is welcome—whether it’s reporting bugs, suggesting improvements, or submitting pull requests.

---

## 📌 Getting Started

### 1. Fork the Repository

Click the **Fork** button on the top right of the repo.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/product-search-app.git
cd product-search-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root:

```bash
cp .env.example .env.local
```

Update the variables with your values (e.g., `BLOB_BASE_URL`, `BLOB_READ_WRITE_TOKEN`, etc).

---

## 📦 Development

Start the dev server:

```bash
npm run dev
```

To rebuild the search index locally:

```bash
npm run build:index
```

To generate and deploy index before full build:

```bash
npm run build
```

---

## 🔧 Code Guidelines

- Use **TypeScript** if adding new components or utilities.
- Maintain consistency with existing code structure and formatting.
- Run `npm run lint` and `npm run format` before pushing.
- Add comments to complex logic, especially in `lib/products.js`.

---

## ✅ Submitting a Pull Request

1. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:

   ```bash
   git commit -m "Add: your message here"
   ```

3. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub.

---

## 🐞 Reporting Issues

If you discover a bug or have a feature request:

- Search [existing issues](https://github.com/your-username/product-search-app/issues)
- If not found, open a new issue with:
  - Clear title and description
  - Steps to reproduce (if bug)
  - Screenshots or logs if helpful

---

## 🤝 Code of Conduct

Please be respectful and considerate in your interactions. We aim to build a welcoming open-source community.

---

Happy contributing! 💪
