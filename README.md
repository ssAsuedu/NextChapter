# Next Chapter

Next Chapter is a sleek and modern web application designed for book lovers. It allows users to explore books, track their reading progress, and connect with a community of fellow readers. The application features user authentication powered by Amazon Cognito and stores user data securely in MongoDB Atlas.

---

## **Features**
- **Landing Page:** A visually impressive landing page with dynamic imagery and scrolling sections explaining the app's features.
- **User Authentication:** Sign up and login functionality integrated with Amazon Cognito.
- **Profile Management:** Users can manage their profiles and track their reading progress.
- **Community Interaction:** Connect with other book lovers and share thoughts.
- **Responsive Design:** Fully responsive layout for seamless use across devices.

---

## **Tech Stack**
### **Frontend**
- **React.js:** For building the user interface.
- **Vite:** For fast development and bundling.
- **Material-UI:** For modern and customizable UI components.
- **CSS:** Custom styling for the landing page and other components.

### **Backend**
- **Node.js:** For server-side logic.
- **Express.js:** For handling API routes.
- **Amazon Cognito:** For user authentication and management.
- **MongoDB Atlas:** For storing user data securely.

---

## **Project Structure**
### **Frontend**
```
client/
├── .env
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
├── public/
├── src/
│   ├── api.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   ├── components/
│   │   ├── BadgeNotification/
│   │   ├── ExplorePage/
│   │   ├── LandingPage/
│   │   ├── ProfilePage/
│   │   ├── SearchPage/
│   │   ├── BookRating.jsx
│   │   └── Stars.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── BookInfo.jsx
│   │   ├── ConfirmEmail.jsx
│   │   ├── Explore.jsx
│   │   ├── FriendProfile.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Messages.jsx
│   │   ├── MoodFinder.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Profile.jsx
│   │   ├── Search.jsx
│   │   ├── SignUp.jsx
│   │   └── ProfileSubPages/
│   │       ├── Account.jsx
│   │       ├── Friends.jsx
│   │       ├── Leaderboard.jsx
│   │       ├── Progress.jsx
│   │       └── Reviews.jsx
│   ├── styles/
│   │   ├── BookInfoPage/
│   │   ├── ExplorePage/
│   │   ├── LandingPage/
│   │   ├── LoginPage/
│   │   ├── ProfilePage/
│   │   ├── SearchPage/
│   │   ├── colors.css
│   │   └── Messages.css
│   └── utils/
│       └── apiCache.js
```

### **Backend**
```
server/
├── .env
├── package-lock.json
├── package.json
├── server.js
└── models/
   ├── User.js
   ├── FriendRequest.js
   ├── Message.js
   ├── Review.js
   ├── List.js
   └── featureRoutes.js
```

---

## **Setup Instructions**
### **Prerequisites**
- Node.js installed on your system.
- MongoDB Atlas account.
- AWS account with Cognito configured.

### **Environment Variables**
Create a `.env` file in the `server/` directory with the following variables:
```env
MONGO_URI=<your_mongodb_connection_string>
COGNITO_USER_POOL_ID=<your_cognito_user_pool_id>
COGNITO_APP_CLIENT_ID=<your_cognito_app_client_id>
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
VITE_GOOGLE_BOOKS_API=<your_google_books_api>

```
Create a `.env` file in the `client/` directory with the following variables:

```env
VITE_GOOGLE_BOOKS_API=<your_google_books_api> 
```

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/ssAsuedu/NextChapter.git
   cd NextChapter
   ```

2. Install dependencies for the backend:
   ```bash
   cd server
   npm install
   ```

3. Install dependencies for the frontend:
   ```bash
   cd ../client
   npm install
   ```

### **Run the Application**
1. Start the backend server:
   ```bash
   cd server
   node server.js
   ```

2. Start the frontend development server:
   ```bash
   cd ../client
   npm run dev
   ```

3. Open the application in your browser at `http://localhost:5173`.


To view the live, deployed site rather than manually run the project, visit: http://nextchapter-web.s3-website.us-east-2.amazonaws.com/ 
---

## **Usage**
- Navigate to the **Sign Up** page to create an account.
- Log in to access your profile and track your reading progress.
- Explore the community and connect with other book lovers.

---

## **Contributing**
Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

---

## **License**
This project is licensed under the MIT License.