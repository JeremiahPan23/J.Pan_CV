# CV Webpage Deployment Guide

This guide will help you deploy your CV webpage to GitHub Pages so you can share it with others.

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and log in to your account.
2. Click on the "+" icon in the top right corner and select "New repository".
3. Enter a repository name (e.g., "cv-webpage" or "personal-cv").
4. Choose "Public" visibility so others can access it.
5. Do NOT initialize the repository with a README, .gitignore, or license.
6. Click "Create repository".

## Step 2: Connect Local Repository to GitHub

After creating the repository, you'll see instructions on how to push an existing repository. Follow these steps:

1. In your GitHub repository page, copy the HTTPS URL (it should look like `https://github.com/your-username/your-repo-name.git`).

2. Open a terminal in your CV Webpage folder and run:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   ```
   Replace `your-username` and `your-repo-name` with your actual GitHub username and repository name.

3. Push your local commits to GitHub:
   ```bash
   git push -u origin master
   ```

## Step 3: Enable GitHub Pages

1. Go to your GitHub repository page.
2. Click on "Settings" (tab near the top).
3. Scroll down to the "Pages" section.
4. Under "Source", select "Deploy from a branch".
5. From the "Branch" dropdown, select "master" (or "main" if that's your default branch).
6. Leave the folder as "/ (root)".
7. Click "Save".

## Step 4: Access Your Deployed CV

After enabling GitHub Pages, your CV will be available at:
```
https://your-username.github.io/your-repo-name/
```

It may take a few minutes for your page to be published. You can check the status in the "Pages" section of your repository settings.

## Step 5: Update Your CV

When you make changes to your CV and want to update the deployed version:

1. Commit your changes locally:
   ```bash
   git add .
   git commit -m "Update CV content"
   ```

2. Push to GitHub:
   ```bash
   git push
   ```

Your changes will be automatically deployed to GitHub Pages within a few minutes.

## Troubleshooting

- If your page doesn't show up, make sure you have an `index.html` file in the root of your repository.
- Check the GitHub Pages settings to ensure you selected the correct branch.
- Wait a few minutes and refresh the page, as deployment can take time.
- If you see a 404 error, double-check the URL structure: `https://username.github.io/repository-name/`