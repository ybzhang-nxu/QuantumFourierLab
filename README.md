# Quantum Fourier Lab

An English-first research website for **AI for quantum algorithms**, drawing on Kaifeng Bu's work in quantum Fourier analysis, decoding-driven algorithms, and quantum resources.

The site describes an emerging initiative and a future research agenda. It does not claim that a commercial product, an AI research engine, or a production quantum decoder already exists.

## Run locally

No package installation or build step is required.

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173`. Use an HTTP server rather than opening the HTML as a file, because the animation is an ES module.

## Files

- `dist/index.html`: English copy, navigation, research directions, publications, and contact links.
- `dist/styles.css`: responsive design and locally hosted Inter font.
- `dist/app.js`: mobile navigation, accessible research tabs, and publication filters.
- `dist/assets/quantum-field.js`: conceptual canvas artwork; not a quantum simulation.
- `dist/assets/Inter-OFL.txt`: license for the bundled Inter font.
- `.openai/hosting.json`: private Sites project and static output directory.
- `.github/workflows/pages.yml`: manually triggered GitHub Pages deployment.

Everything in `dist/` is deployable static content. There is no backend, analytics, tracking, API key, or email collection. The contact button opens a **public** GitHub issue and does not submit anything automatically.

## Research content

The five linked publications were checked against primary arXiv records:

- [Multivariate Decoded Quantum Interferometry for Weighted Optimization](https://arxiv.org/abs/2605.10666), 2026 preprint.
- [Hamiltonian Decoded Quantum Interferometry for General Pauli Hamiltonians](https://arxiv.org/abs/2601.18773), 2026 preprint.
- [Decoded Quantum Interferometry Under Noise](https://arxiv.org/abs/2508.10725), *Quantum Science and Technology* 11, 025010 (2026).
- [Stabilizer Testing and Magic Entropy via Quantum Fourier Analysis](https://arxiv.org/abs/2306.09292), *Communications in Mathematical Physics* 406, 236 (2025).
- [Quantum Ruzsa Divergence to Quantify Magic](https://arxiv.org/abs/2401.14385), *IEEE Transactions on Information Theory* 71, 2726 (2025).

The original design takes inspiration from the clear positioning and research emphasis of [Atomic Inference](https://atomicinference.ai) and [Magic State Labs](https://www.magicstatelabs.com/). Their branding, graphics, product claims, and benchmarks are not reproduced.

## Publish at quantumfourierlab.com

The project is prepared for GitHub Pages; the domain and repository Pages settings have not been changed. A private Sites preview is managed separately.

When ready for the public launch:

1. In this repository's **Settings → Pages**, choose **GitHub Actions** as the source.
2. Run **Actions → Deploy to GitHub Pages → Run workflow**. The included workflow is manual, so a source push does not publish the website.
3. In **Settings → Pages**, set the custom domain to `quantumfourierlab.com` before changing DNS.
4. At the domain's DNS provider, configure apex `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. If using `www`, point its `CNAME` to `ybzhang-nxu.github.io`.
5. Enable **Enforce HTTPS** after the domain check and certificate provisioning finish.
6. Update `og:url` and `og:image` in `dist/index.html` from the private preview origin to `https://quantumfourierlab.com`, then deploy again.

These steps follow the [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). With a custom Actions workflow, GitHub uses the domain in repository settings; a `CNAME` file is not required.

Before a public launch, replace the GitHub contact route if a dedicated collaboration email is available, and confirm the desired wording about the initiative and Kaifeng Bu.

## Editing

Edit files directly in `dist/`. Keep publication titles, author lists, and status labels consistent with their linked sources. Keep future research aims distinct from completed research and operational capabilities. All assets are local, so the page has no font or artwork dependency on third-party services.
