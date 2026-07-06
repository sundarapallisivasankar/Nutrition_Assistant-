# Nutrition Assistant 🍎

Nutrition Assistant is a premium, full-stack production-ready web application designed for comprehensive lifestyle, diet, and water tracking. Built with modern glassmorphic aesthetics inspired by Apple Health and Google Fit, this application provides users with exact physical calculators, structured meal planners, database searching, and an AI Nutrition Chatbot.

This repository serves as a CS College Major Project and contains clean, modular, MVC-layered code, and solid rate limit protections.

---

## 🏗️ Architecture Diagram

```
                 [ React 19 + Vite Frontend (Client) ]
                                  │
                                  ▼ (JWT Authorized / Axios API Client)
                           [ REST API Router ]
                                  │
                                  ▼
                [ Node.js + Express Controller Layer ]
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
[ Mongoose Models / MongoDB Atlas ]        [ External Services (Gemini AI / Cloudinary) ]
```

---

## 📁 Repository Folder Structure

```
nutrition-assistant/
├── client/                     # React 19 Frontend (Vite)
│   ├── public/                 # Static assets & icons
│   └── src/
│       ├── assets/             # Animations & styling variables
│       ├── components/         # Protected routes & UI widgets
│       ├── contexts/           # AuthContext, ThemeContext, Notifications
│       ├── layouts/            # Navbar, Sidebar, Footer, AppLayout
│       ├── pages/              # 22 Core Pages (Dashboard, Profiles, Trackers...)
│       ├── services/           # Axios API configuration
│       ├── utils/              # Calculation helpers (BMI, TDEE)
│       ├── App.jsx             # Main Router routing
│       └── main.jsx            # React root mount script
├── server/                     # Node.js + Express API
│   ├── config/                 # MongoDB Mongoose & Cloudinary credentials
│   ├── controllers/            # Controller routers (Auth, Trackers, Admin)
│   ├── middleware/             # Role, Auth JWT, File Uploads, central Errors
│   ├── models/                 # Mongoose schemas (User, Food, Recipes...)
│   ├── routes/                 # REST Route parameters mapped to controllers
│   ├── services/               # Gemini AI & Cloudinary upload triggers
│   ├── utils/                  # Seeding utility scripts
│   ├── validators/             # Zod input verification schemas
│   └── index.js                # Express App server entry point
├── tests/                      # Testing Suite
│   ├── calculations.test.js    # BMR/TDEE/BMI units validation tests
│   └── api.test.js             # API route lookups integration tests
├── package.json                # Root automation script shortcuts
├── start.bat                   # Windows interactive starter shortcut
└── README.md                   # Comprehensive documentation guide
```

---

## 🗃️ Database Schemas & Collection Relationships (ER Mapping)

```
 [Users] 1 ──── 1 [Settings]
    │
    ├─ 1 ─── N [NutritionLogs] (Logged food lists)
    ├─ 1 ─── N [WaterLogs]     (Daily fluid lists)
    ├─ 1 ─── N [Meals]         (Planned meal presets)
    ├─ 1 ─── N [Favorites] ───── N [Recipes]
```

### Collection Definitions

1. **Users**: Credentials (hashed password), demographics (age, weight, height), goal selections, medical conditions lists, and allergies array.
2. **Settings**: Dark mode toggles, notification indicators, unit standard choice (metric/imperial), and water reminder interval.
3. **Foods**: Nutrition facts for standard items (protein, carbs, fat, fiber per 100g). System items have `creator: null`.
4. **Recipes**: Title, description, ingredient lists (amount/unit), steps arrays, prep time, image, and nutrition summaries.
5. **NutritionLogs**: Date key (`YYYY-MM-DD`), items list of logged food with serving size counters, and daily macro aggregates.
6. **WaterLogs**: Date key (`YYYY-MM-DD`), cumulative log amount (ml), target goal, and array of timestamped logs.
7. **Meals**: Scheduled meal template items in the planner.
8. **Favorites**: Connects users to recipes they bookmark.

---

## 🔌 API Route Specifications

All endpoints are prefixed with `/api`.

### 🔑 Authentication (`/auth`)
* `POST /auth/register` - Create user profile and settings. Returns JWT.
* `POST /auth/login` - Validate credentials. Returns JWT.
* `POST /auth/refresh` - Rotate refresh token and fetch new access token.
* `POST /auth/logout` - Clear refresh tokens. (Private)
* `GET /auth/me` - Get profile statistics. (Private)
* `PUT /auth/profile` - Update demographics & upload avatar photo. (Private)
* `POST /auth/forgotpassword` - Request password reset token. (Returns token)
* `POST /auth/resetpassword/:token` - Update password.

### 💧 Hydration & Food Tracker (`/tracker`)
* `GET /tracker/dashboard` - Retrieve daily summaries, weekly trend points, and AI suggestions. (Private)
* `POST /tracker/water` - Log water consumption. (Private)
* `GET /tracker/water/:date?` - Read water log entries for a date. (Private)
* `DELETE /tracker/water/entry/:logId/:entryId` - Delete logged water cup. (Private)
* `POST /tracker/food` - Log food items consumed under a meal slot. (Private)
* `GET /tracker/food/:date?` - Fetch logged food details. (Private)
* `DELETE /tracker/food/:logId/:mealId` - Delete logged food item. (Private)

### 🥑 Food & Recipe catalog (`/foods`, `/recipes`, `/meals`)
* `GET /foods?search=...` - Search database food items. (Private)
* `POST /foods` - Submit user custom food item. (Private)
* `GET /recipes` - Paginated recipe list with searches & filters. (Public)
* `GET /recipes/:id` - Read recipe checklist details. (Public)
* `POST /recipes` - Add a custom recipe (or system recipe if Admin). (Private)
* `POST /recipes/favorite/:id` - Bookmark/favorite recipe toggle. (Private)
* `GET /recipes/my/favorites` - Retrieve favorited recipes. (Private)
* `GET /meals` - Get planned meal structures. (Private)
* `POST /meals` - Save planned meal templates. (Private)
* `DELETE /meals/:id` - Delete planned meal preset. (Private)

### 🤖 AI Nutritionist (`/ai`)
* `POST /ai/chat` - Query chatbot. Expects message and conversation history. (Private)

### ⚙️ System Settings (`/settings`)
* `GET /settings` - Fetch settings object. (Private)
* `PUT /settings` - Modify darkMode/metric system preferences. (Private)

### 🛡️ Admin Panel Operations (`/admin`)
* `GET /admin/stats` - Total count analytics. (Private/Admin)
* `GET /admin/users` - Registered users list. (Private/Admin)
* `DELETE /admin/users/:id` - Cascade delete users profiles and logs. (Private/Admin)
* `POST /admin/foods` - Curate standard system foods. (Private/Admin)

---

## 🛠️ Step-by-Step Installation & Running Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Atlas account or local installation running on port 27017)

### 1. Setup Server Configurations
Create `server/.env` inside the server directory using the example templates:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=super_secret_jwt_access_token_key_123!
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_456!
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Auto-Install Dependencies
Run the installation automation script from the root workspace directory:
```bash
npm run install-all
```
This installs packages for both the server backend and the React frontend in one go.

### 3. Seed Database catalog
Wipe existing tables and populate admin/user credentials, macro foods, and healthy recipes:
```bash
npm run seed
```
**Default Logins seeded:**
* **Admin**: `admin@assistant.com` / `admin123`
* **Regular User**: `user@assistant.com` / `user123`

### 4. Run Development Servers
* Launch the backend API server (runs on `http://localhost:5000`):
  ```bash
  npm run dev-server
  ```
* Launch the Vite React frontend client (runs on `http://localhost:5173`):
  ```bash
  npm run dev-client
  ```

---

## 🧪 Running Tests

* **Unit Tests**: Test calculation logic in Bmi/Calorie modules:
  ```bash
  npm run test-units
  ```
* **API Integration Tests**: Verify API response parameters (Requires the server running on port 5000):
  ```bash
  npm run test-apis
  ```

---

## 📝 Contributors & License
Developed for Computer Science Major Major Project Submissions. Licensed under the MIT License.
