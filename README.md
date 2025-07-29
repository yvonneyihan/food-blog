# 🍽️ Food Blog Platform

A full-stack web application that allows users to create, edit, and share categorized food blog posts with image uploads. Built using Node.js, Express.js, MySQL, and EJS, with image cropping handled via Cropper.js and stored via Multer.

## 🚀 Features


-  CRUD functionality for blog posts (create, read, update, delete)
-  User authentication, supporting Google Sign-In via OAuth 2.0 for quick and secure login
-  Drag-and-drop image upload with client-side cropping (Cropper.js)
-  Categorized posts: Recipe, Cooking Tip, Restaurant Review
-  View count tracking and last-updated timestamps
-  Responsive UI using Bootstrap 5 and custom CSS
-  Image metadata and post content stored in MySQL

## 📚 Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Bootstrap 5, Cropper.js
- **Database:** MySQL
- **File Uploads:** Multer
- **Authentication:** Express-session, Google OAuth 2.0

## 🖼️ Image Handling

- Users can upload or drag-and-drop images
- Preview and crop images before submission
- Cropped images are resized server-side (300x300)
- Stored in `/public/uploads` (excluded from Git)

## Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/yvonneyihan/food-blog.git
cd food-blog
```


### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 4. Database Schema

The full database schema is available in [`schema/schema.sql`](./schema/schema.sql).  
To set up your MySQL database, run:

```bash
mysql -u your_mysql_user -p your_database_name < schema/schema.sql
```

### 5. Start the server
```bash
node app.js
```

### 6. Access locally
Visit: http://localhost:3000

## 📁 Folder Structure
````markdown
├── app.js  
├── db.js  
├── .gitignore  
├── config/  
├── controllers/  
├── routes/  
├── views/  
├── public/  
│   ├── styles/  
│   ├── js/  
│   └── uploads/  # Image uploads (gitignored)
````

## ✍️ Author

[Yvonne Huang](https://github.com/yvonneyihan)
