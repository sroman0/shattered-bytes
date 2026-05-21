# Live Demo Deployment

This project is ready to be deployed as a static GitHub Pages demo.

## Expected Demo URL

If the repository stays under:

```text
https://github.com/sroman0/Serious_game_CFCA
```

the GitHub Pages demo URL will be:

```text
https://sroman0.github.io/Serious_game_CFCA/
```

## Deployment Method

The repository includes a GitHub Actions workflow:

```text
.github/workflows/deploy.yml
```

The workflow runs on pushes to `main` or `master`, builds the Vite project, uploads the `dist/` folder, and deploys it to GitHub Pages.

## GitHub Pages Setup

In the GitHub repository:

1. open **Settings**;
2. open **Pages**;
3. set **Build and deployment** to **GitHub Actions**;
4. push the final commit to `main` or `master`;
5. wait for the workflow named **Deploy GitHub Pages Demo** to finish.

After the workflow succeeds, GitHub will show the public demo URL in the Pages settings and in the workflow summary.

## Local Verification Before Push

Run:

```bash
npm run lint
npm run build
npm run preview
```

Then check that the app loads locally and that the intro video, level JSON files, evidence images, and generated assets are visible.

## Why Relative Paths Are Used

GitHub Pages serves project sites from a subpath such as:

```text
/Serious_game_CFCA/
```

For that reason, the Vite config uses:

```js
base: './'
```

Public assets are referenced through `import.meta.env.BASE_URL`, so the same build works both locally and on GitHub Pages.
