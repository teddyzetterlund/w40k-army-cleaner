# Deployment Guide

This guide explains how the 40K Army Cleaner app is deployed to GitHub Pages.

## Overview

The application uses GitHub Actions to automatically deploy to GitHub Pages whenever changes are pushed to the `main` branch.

## Deployment Process

### Automatic Deployment

1. **Push to Main**: Any push to the `main` branch triggers the deployment workflow
2. **Quality Gates**: The workflow runs tests and linting before deployment
3. **Build & Deploy**: If all checks pass, the app is deployed to the `gh-pages` branch
4. **Live Site**: GitHub Pages serves the site from the `gh-pages` branch

### Manual Deployment

If you need to deploy manually:

```bash
# Ensure all tests pass
npm test

# Ensure linting passes
npm run lint

# Push to main branch (triggers automatic deployment)
git push origin main
```

## Live Site

🌐 **Live Application**: [https://teddyzetterlund.github.io/w40k-army-cleaner/](https://teddyzetterlund.github.io/w40k-army-cleaner/)

## Configuration Files

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy.yml`
- **Purpose**: Defines the deployment process
- **Triggers**: Push to main branch, pull requests

### PWA Configuration
- **File**: `manifest.json`
- **Purpose**: Defines PWA behavior and metadata
- **Key Setting**: `start_url: "./"` (relative path for GitHub Pages)

### Service Worker
- **File**: `sw.js`
- **Purpose**: Handles caching and offline functionality
- **Key Setting**: Relative paths for cached assets

### Jekyll Configuration
- **File**: `.nojekyll`
- **Purpose**: Tells GitHub Pages not to process with Jekyll
- **Effect**: Ensures all files are served correctly

## Troubleshooting

### Deployment Fails

1. **Check GitHub Actions**: Go to your repository → Actions tab
2. **Review Logs**: Look for specific error messages
3. **Common Issues**:
   - Test failures (run `npm test` locally)
   - Linting errors (run `npm run lint` locally)
   - Missing dependencies

### Site Not Updating

1. **Check gh-pages Branch**: Ensure the `gh-pages` branch exists and has content
2. **GitHub Pages Settings**: Go to repository Settings → Pages
3. **Source Branch**: Should be set to `gh-pages` branch
4. **Custom Domain**: If using custom domain, check DNS settings

### PWA Issues

1. **Service Worker**: Check browser dev tools → Application → Service Workers
2. **Manifest**: Verify manifest.json is accessible
3. **HTTPS**: GitHub Pages provides HTTPS by default
4. **Cache**: Clear browser cache and reload

### Local Testing

Test the deployment locally before pushing:

```bash
# Start local server
npm run dev

# Test PWA functionality
npm run dev:https  # For HTTPS testing
```

## Custom Domain Setup

To use a custom domain:

1. **Update Workflow**: Add your domain to `cname` field in `.github/workflows/deploy.yml`
2. **DNS Configuration**: Point your domain to `teddyzetterlund.github.io`
3. **GitHub Settings**: Add custom domain in repository Settings → Pages
4. **SSL Certificate**: GitHub automatically provides SSL for custom domains

## Monitoring

### GitHub Actions
- **Location**: Repository → Actions tab
- **Purpose**: Monitor deployment status and logs
- **Alerts**: Configure notifications for failed deployments

## Security Considerations

- **No Sensitive Data**: Never commit API keys or secrets
- **Dependencies**: Regularly update dependencies for security patches
- **HTTPS**: GitHub Pages provides HTTPS by default
- **Content Security Policy**: Consider adding CSP headers for additional security

## Performance Optimization

- **Service Worker**: Caches static assets for offline use
- **CDN**: Uses Tailwind CSS CDN for faster loading
- **Minification**: Consider minifying CSS/JS for production
- **Image Optimization**: Icons are optimized using Sharp

## Support

If you encounter deployment issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Check the repository issues for known problems
4. Create a new issue with detailed error information 