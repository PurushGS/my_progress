# Deployment Guide

## Free Hosting Options

### Option 1: Vercel (Recommended - Easiest)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

3. **Custom Domain** (Optional):
   - Vercel provides a free `.vercel.app` domain
   - You can add your own domain in project settings

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

### Option 3: GitHub Pages (Static Export)

If you want to use GitHub Pages, you'll need to configure Next.js for static export:

1. Update `next.config.js`:
   ```js
   const nextConfig = {
     output: 'export',
     images: { unoptimized: true }
   };
   ```

2. Deploy:
   - Push to GitHub
   - Go to repository Settings → Pages
   - Select source branch (usually `main`)
   - Your site will be at `https://<username>.github.io/<repo-name>`

## Environment Variables

Currently, the app uses local data. For production:
- Consider adding environment variables for API endpoints
- Add them in your hosting platform's environment settings

## Build Commands

- Development: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm start`

## Troubleshooting

### Build Fails
- Make sure all dependencies are in `package.json`
- Check Node.js version (should be 18+)
- Clear `.next` folder and rebuild

### PDF Generation Not Working
- Ensure `jspdf` and `jspdf-autotable` are installed
- Check browser console for errors
- Some browsers may block PDF downloads - check popup blockers

## Cost

All options above are **100% FREE** for:
- Personal projects
- Small teams
- Low to medium traffic

Vercel and Netlify offer generous free tiers that should be sufficient for most use cases.

