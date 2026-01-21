# Azure Static Web Apps Deployment Guide

## 🚨 Current Issue: Node.js Version Compatibility

Your deployment is failing because Azure Static Web Apps is using Node.js 18.20.8, but your project requires Node.js 20.19+ due to:

- **Vite 7 (rolldown-vite)**: Requires Node.js 20.19+
- **React Router 7**: Requires Node.js 20+
- **@vitejs/plugin-react 5**: Requires Node.js 20.19+

## 🛠️ Solutions (Choose One)

### Option 1: Force Node.js 20+ in Azure (Recommended)

I've already created the necessary files:

1. **`.nvmrc`** - Specifies Node.js 20.19.0
2. **`staticwebapp.config.json`** - Azure configuration with Node.js 20
3. **Updated `package.json`** - Added engines field

**Steps:**
1. Commit these new files to your repository
2. In your GitHub Actions workflow, ensure you're using:
   ```yaml
   - name: Build And Deploy
     uses: Azure/static-web-apps-deploy@v1
     with:
       azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
       repo_token: ${{ secrets.GITHUB_TOKEN }}
       action: "upload"
       app_location: "./Class-Pilot/frontend"
       output_location: "dist"
   ```

### Option 2: Use Compatible Dependencies (Backup)

If Azure still doesn't support Node.js 20, use the compatible package.json:

```bash
# In your frontend directory
cp package-azure-compatible.json package.json
npm install
```

This downgrades to:
- React 18 (instead of 19)
- React Router 6 (instead of 7)
- Vite 5 (instead of 7)
- Standard Tailwind CSS (instead of v4)

### Option 3: Update GitHub Actions Workflow

Create/update `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20.19.0'
          
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "./Class-Pilot/frontend"
          output_location: "dist"
          app_build_command: "npm run build"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

## 🔧 Additional Azure Configuration

### Environment Variables

In Azure Portal → Static Web Apps → Configuration, add:

```
VITE_API_URL=https://your-backend-url.com
```

### API Integration

If deploying the backend to Azure as well:

1. **Azure App Service** for the backend
2. **Azure Cosmos DB** or **MongoDB Atlas** for database
3. Update frontend API URL to point to production backend

### Build Configuration

The `staticwebapp.config.json` includes:
- **Platform**: Node.js 20 runtime
- **Navigation Fallback**: SPA routing support
- **Routes**: API route configuration
- **Response Overrides**: Redirect unauthorized users

## 🧪 Testing Deployment

1. **Local Build Test**:
   ```bash
   cd Class-Pilot/frontend
   npm run build
   npm run preview
   ```

2. **Check Build Output**:
   - Should create `dist/` folder
   - Should contain `index.html` and assets

3. **Verify Dependencies**:
   ```bash
   npm ls
   # Check for any peer dependency warnings
   ```

## 🚀 Deployment Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Fix Azure deployment compatibility"
   git push
   ```

2. **Monitor deployment** in Azure Portal

3. **Check build logs** for any remaining issues

## 🔍 Troubleshooting

### If deployment still fails:

1. **Check Node.js version** in build logs
2. **Try Option 2** (compatible dependencies)
3. **Clear npm cache** by adding to workflow:
   ```yaml
   - name: Clear npm cache
     run: npm cache clean --force
   ```

### Common Issues:

- **Module not found**: Usually dependency version mismatch
- **Build timeout**: Reduce bundle size or increase timeout
- **Memory issues**: Use `NODE_OPTIONS=--max-old-space-size=4096`

## 📝 Notes

- **Frontend only**: This deploys the React app as a static site
- **Backend separate**: You'll need to deploy the Node.js backend separately
- **Database**: Ensure MongoDB Atlas is accessible from Azure
- **CORS**: Update backend CORS settings for production domain

The `.nvmrc` and `staticwebapp.config.json` files should resolve the Node.js version issue. Try deploying again after committing these changes!