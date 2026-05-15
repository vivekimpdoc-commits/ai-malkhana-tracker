<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/56f33be7-ab09-46fa-ab18-9ab8b628ab7c

## GitHub Deployment

This project is configured for **GitHub Pages**. To deploy:

1. Push this code to a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Go to **Settings > Secrets and variables > Actions** and add a new repository secret named `GEMINI_API_KEY` with your Gemini API key.
5. The deployment will start automatically on every push to `main`.

**Note:** The app uses a mock backend (`localStorage`) when deployed to GitHub Pages, so your data will persist in your browser.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key.
3. Run the app:
   `npm run dev` (Runs both frontend and backend)

