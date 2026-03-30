# 🍽️ Food Blog Platform

A full-stack food blogging web application that allows users to create, edit, and share categorized food posts with image uploads and AI-assisted content generation. Built with Node.js, Express.js, TypeScript, MySQL, and EJS, the platform supports secure authentication, image cropping, and dynamic draft generation using Google Gemini API.

## 🚀 Features

- CRUD functionality for blog posts (create, read, update, delete)
- User authentication with email/password and Google Sign-In via OAuth 2.0
- AI-assisted post draft generation based on user-input title using Google Gemini API
- Client-side image upload and cropping with Cropper.js
- Categorized posts: Recipe, Cooking Tip, Restaurant Review
- View count tracking and updated timestamps
- Responsive UI using Bootstrap 5 and custom CSS
- MySQL-backed storage for users, posts, and metadata

## 📚 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Frontend:** EJS, Bootstrap 5, JavaScript
- **Database:** MySQL
- **Authentication:** Express-session, Passport.js, Google OAuth 2.0
- **File Uploads:** Multer
- **Image Cropping:** Cropper.js
- **AI Integration:** Google Gemini API

## 🖼️ Image Handling

- Users can upload images during post creation
- Images can be previewed and cropped before submission
- Uploaded images are stored in `/public/uploads`
- Upload folder is preserved with `.gitkeep` and ignored for actual image files in Git

## 🤖 AI Content Generation

- Users can click **"Generate Content with AI"** on the compose page
- The app sends the post title to a backend API endpoint
- Google Gemini generates a draft post body
- Generated content is inserted into the content textarea for user review and editing

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/yvonneyihan/food-blog.git
cd food-blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Copy the example environment file and update it with your own credentials:

```bash
cp .env.example .env
```
Then open .env and fill in the required values.

### 4. Set up the database

The full schema is available in [`schema/schema.sql`](./schema/schema.sql).

Create your MySQL database first, then run:

```bash
mysql -u your_mysql_user -p food_blog < schema/schema.sql
```

### 5. Start the development server

```bash
npm run dev
```

### 6. Build the TypeScript project

```bash
npm run build
```

### 7. Start the production build

```bash
npm start
```

### 8. Access locally

Visit:

```text
http://localhost:3000
```

## 📁 Folder Structure

```text
├── app.ts
├── db.ts
├── .gitignore
├── .env.example
├── tsconfig.json
├── config/
├── controllers/
├── routes/
├── types/
├── views/
├── public/
│   ├── styles/
│   ├── js/
│   └── uploads/   # image uploads (gitignored except .gitkeep)
├── schema/
└── dist/          # compiled TypeScript output
```

## 🔐 Authentication

- Local authentication with email and password
- Google OAuth 2.0 login via Passport.js
- Session-based authentication using `express-session`

## 🧪 Development Notes

- TypeScript is used for the backend application logic
- EJS templates and client-side JavaScript remain lightweight for rendering and UI interactions
- Environment variables are required for database connection, session management, OAuth, and Gemini API access

## ✍️ Author

[Yvonne Huang](https://github.com/yvonneyihan)
