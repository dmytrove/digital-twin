# Deployment Guide

## Quick Start

This guide will help you deploy the BIM Viewer Demo to GitHub Pages.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js 18+ and npm

## 🚀 Step-by-Step Deployment

### 1. Repository Setup

1. **Create a new repository** on GitHub named `bim-viewer-demo`
2. **Clone this project** to your local machine
3. **Update the repository URL** in package.json if needed

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **"GitHub Actions"**
5. Save the settings

### 3. Update Configuration

1. **Update `vite.config.ts`** - Change the base path to match your repository name:
   ```typescript
   base: '/your-repository-name/',
   ```

2. **Update README.md** - Replace `yourusername` with your actual GitHub username in the live demo link

### 4. Deploy

**Option A: Automatic Deployment**
1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Check the **Actions** tab to monitor deployment progress
4. Your site will be available at `https://yourusername.github.io/repository-name/`

**Option B: Manual Deployment**
```bash
npm run deploy
```

## 📁 Repository Structure for GitHub

```
your-repository/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/                        # Source code
├── public/                     # Static assets
├── dist/                       # Built files (auto-generated)
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
└── README.md                  # Project documentation
```

## 🔧 Troubleshooting

### Common Issues

**1. 404 Error after deployment**
- Check that the `base` path in `vite.config.ts` matches your repository name
- Ensure GitHub Pages is set to use GitHub Actions as source

**2. Build fails in GitHub Actions**
- Verify all dependencies are in `package.json`
- Check that TypeScript compilation passes: `npm run build`

**3. Map or 3D assets not loading**
- Ensure all assets are in the `public` folder
- Check browser console for CORS errors

### Debugging Steps

1. **Local Build Test**
   ```bash
   npm run build
   npm run preview
   ```

2. **Check GitHub Actions Logs**
   - Go to Actions tab in your repository
   - Click on the failed workflow
   - Review the build logs

3. **Verify Deployment**
   - Visit your GitHub Pages URL
   - Check browser developer tools for errors

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file** to the `public` folder:
   ```
   your-domain.com
   ```

2. **Configure DNS** with your domain provider
3. **Update GitHub Pages settings** with your custom domain

## 📊 Performance Tips

- **Enable source maps** for debugging (already configured)
- **Monitor bundle size** using build output
- **Optimize assets** in the public folder
- **Use CDN** for large assets if needed

## 🔒 Security

- No sensitive data should be in the repository
- All API endpoints should be publicly accessible
- Use environment variables for any external service keys

## 📈 Analytics (Optional)

To add Google Analytics:

1. **Add tracking code** to `index.html`
2. **Update privacy policy** if collecting user data
3. **Configure goals** in Google Analytics dashboard

## 🚀 Production Checklist

- [ ] Updated README with correct repository URL
- [ ] Configured GitHub Pages to use GitHub Actions
- [ ] Tested local build and preview
- [ ] Verified all assets load correctly
- [ ] Checked 3D viewer performance
- [ ] Tested map functionality
- [ ] Validated responsive design
- [ ] Confirmed all links work
- [ ] Added proper meta tags for SEO

---

**Need help?** Create an issue in the repository or check the main README for contact information.