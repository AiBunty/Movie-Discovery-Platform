# 🎬 Movie Discovery Platform

A modern, responsive movie discovery web application built with vanilla JavaScript, Tailwind CSS, and the TMDB API. Discover trending movies, search your favorites, filter by genre, and explore cinema at your fingertips.

## ✨ Features

- **🎯 Multiple Categories**: Browse Trending, Popular, and Top Rated movies
- **🔍 Smart Search**: Debounced search functionality for smooth user experience
- **🎭 Genre Filtering**: Filter movies by dynamically loaded genres from TMDB
- **📄 Pagination**: Navigate through thousands of movies with Previous/Next controls
- **⚡ Performance Optimized**:
  - Lazy loading images with `loading="lazy"`
  - Async image decoding with `decoding="async"`
  - Fallback posters for failed image loads
  - Skeleton loaders for better perceived performance
- **🎨 Modern Dark UI**:
  - Premium dark theme design
  - Smooth hover effects and transitions
  - Fully responsive grid (1-4 columns based on screen size)
  - Glassmorphism effects
- **🛡️ Robust Error Handling**:
  - API error handling with user-friendly messages
  - Empty state for no results
  - Loading states with skeleton UI
- **📱 Mobile Responsive**: Looks great on all devices

## 🛠️ Tech Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework (CDN version)
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **TMDB API**: The Movie Database API for movie data

## 🚀 Getting Started

### Prerequisites

1. A modern web browser (Chrome, Firefox, Safari, Edge)
2. TMDB API access token (Bearer token)

### Getting Your TMDB API Token

1. **Create a TMDB Account**:
   - Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
   - Sign up for a free account

2. **Request API Access**:
   - After logging in, go to your account settings
   - Navigate to **API** section in the left sidebar
   - Click on **"Request an API Key"`
   - Choose **"Developer"`
   - Fill out the required form (you can use dummy data for personal projects)
   - Accept the terms and conditions

3. **Get Your Bearer Token**:
   - Once approved (usually instant), you'll see your API Key and **Access Token (v4 auth)**
   - Copy the **"API Read Access Token"** (this is your Bearer token)
   - It should look like: `eyJhbGciOiJIUzI1NiJ9...` (very long string)

### Running Locally

1. **Clone or download this repository**:
   ```bash
   git clone <your-repo-url>
   cd movie-discovery
   ```

2. **Open `index.html` in your browser**

3. **Set your TMDB token**:
   - Open browser DevTools (F12)
   - In the Console tab, enter:
   ```javascript
   window.TMDB_TOKEN = 'your_bearer_token_here'
   ```
   - Refresh the page

**Alternative (Recommended for development)**:

Create a file `config.js` with the following content:
```javascript
window.TMDB_TOKEN = 'your_bearer_token_here';
```

Then add this script tag to `index.html` **before** the `app.js` script:
```html
<script src="config.js"></script>
<script src="app.js"></script>
```

**⚠️ Important**: Add `config.js` to `.gitignore` to avoid exposing your token!

## 🌐 Deploying to Netlify

Deploying this app to Netlify is quick and free!

### Method 1: Netlify Drop (Easiest)

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your `movie-discovery` folder
3. After deployment, go to **Site settings** → **Build & deploy** → **Environment**
4. Add environment variable:
   - **Key**: `TMDB_TOKEN`
   - **Value**: Your TMDB Bearer token
5. Create a `netlify.toml` file in your project root:
   ```toml
   [build]
     publish = "."
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-Content-Type-Options = "nosniff"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

6. Create `_headers` file to inject the token:
   ```
   /*
     X-TMDB-Token: YOUR_TOKEN_HERE
   ```

### Method 2: GitHub + Netlify (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Log in to [Netlify](https://app.netlify.com/)
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose GitHub and select your repository
   - Build settings:
     - **Build command**: (leave empty)
     - **Publish directory**: `.` or `/`

3. **Add Environment Variable**:
   - Go to **Site settings** → **Environment variables**
   - Click **"Add a variable"**
   - Add:
     - **Key**: `TMDB_TOKEN`
     - **Value**: Your TMDB Bearer token
   - Save

4. **Update your code** to read from environment variable:
   
   Add this at the top of `app.js`:
   ```javascript
   // Set token from environment variable (Netlify) or window object (local)
   if (!window.TMDB_TOKEN && typeof process !== 'undefined') {
       window.TMDB_TOKEN = process.env.TMDB_TOKEN;
   }
   ```

5. **Deploy**: Netlify will automatically deploy on every push to `main`

### Method 3: Netlify Functions (Most Secure)

For production, it's recommended to use Netlify Functions to keep your API token server-side:

1. Create `netlify/functions/movies.js`:
   ```javascript
   const fetch = require('node-fetch');

   exports.handler = async (event) => {
       const { endpoint, params } = JSON.parse(event.body);
       const queryString = new URLSearchParams(params).toString();
       const url = `https://api.themoviedb.org/3${endpoint}?${queryString}`;

       const response = await fetch(url, {
           headers: {
               'Authorization': `Bearer ${process.env.TMDB_TOKEN}`,
               'Content-Type': 'application/json',
           },
       });

       return {
           statusCode: response.status,
           body: await response.text(),
       };
   };
   ```

2. Update `fetchFromTMDB` in `app.js` to call the function instead.

## 📁 Project Structure

```
movie-discovery/
├── index.html          # Main HTML file with Tailwind CSS
├── app.js             # Application logic and API integration
├── README.md          # Project documentation
├── config.js          # (Optional) Local configuration file
└── .gitignore         # (Recommended) Git ignore file
```

## 🎮 Usage

1. **Browse Movies**: Select a category (Trending, Popular, Top Rated) from the dropdown
2. **Search**: Type in the search bar to find specific movies
3. **Filter by Genre**: Choose a genre from the genre dropdown
4. **Navigate**: Use Previous/Next buttons to explore more movies
5. **View Details**: Each card shows:
   - Movie poster (with lazy loading)
   - Title
   - Release year
   - Rating (color-coded: green ≥7.5, yellow ≥6, red <6)
   - Overview (truncated to 3 lines)

## 🔒 Security Notes

- Never commit your TMDB token to version control
- Add `config.js` to `.gitignore` if using local config
- For production apps, use environment variables or server-side proxies
- The current implementation is suitable for personal projects and learning

## 📝 Development Notes

### Code Structure

- **State Management**: Centralized state object for app state
- **Modular Functions**: Separated concerns (UI, data fetching, utilities)
- **Error Handling**: Try-catch blocks with user-friendly error messages
- **Performance**: Debounced search, lazy loading, skeleton loaders
- **Clean Code**: Well-commented, ES6+ syntax, consistent formatting

### Customization

You can easily customize:
- **Colors**: Modify Tailwind classes in `index.html`
- **Grid Layout**: Adjust grid columns in the movies grid section
- **Debounce Delay**: Change the delay in `debounce()` function
- **Movies Per Page**: Controlled by TMDB API (default: 20)
- **Image Sizes**: Change `w500` in `getPosterUrl()` to other sizes (w92, w154, w185, w342, w500, w780, original)

## 🐛 Troubleshooting

**"TMDB API token not configured"**
- Make sure you've set `window.TMDB_TOKEN` in the console or `config.js`

**Movies not loading**
- Check browser console for errors
- Verify your API token is correct and active
- Check your internet connection
- Ensure you're using the Access Token (Bearer), not the API Key

**Images not loading**
- Some movies may not have posters (fallback will show)
- Check TMDB image server status

## 📄 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

- **TMDB**: This product uses the TMDB API but is not endorsed or certified by TMDB
- **Tailwind CSS**: For the amazing utility-first CSS framework

## 🔗 Useful Links

- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

---

**Built with ❤️ using Vanilla JavaScript**
