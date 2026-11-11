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
- `dist/assets/quantum-field.js`: interactive conceptual canvas artwork. Pointer movement tilts the field, dragging rotates it, and clicking sends a highlight through the rings. Arrow keys rotate, Home resets, and Space/Enter pulses.
- `dist/assets/decoding-flow.js`: animated quantum-wave and decoder-circuit illustrations. These are conceptual artwork, not quantum simulations or executable algorithm circuits. Both animations pause offscreen and respect reduced-motion preferences.
- `dist/assets/Inter-OFL.txt`: license for the bundled Inter font.
- `.openai/hosting.json`: private Sites project and static output directory.
- `.github/workflows/pages.yml`: GitHub Pages deployment on changes to `dist/` or the workflow on `main`, with a manual trigger also available.

Everything in `dist/` is deployable static content. There is no backend, analytics, tracking, API key, or email collection. The contact button opens a **public** GitHub issue and does not submit anything automatically.

## Research content

The seven linked publications were checked against primary arXiv records and publisher bibliographic metadata:

- [Quantum Locally Recoverable Codes With Intersecting Recovery Sets](https://ieeexplore.ieee.org/document/11684559), *IEEE Transactions on Information Theory* 72(11), 8561–8576 (2026), [doi:10.1109/TIT.2026.3732133](https://doi.org/10.1109/TIT.2026.3732133).
- [Multivariate Decoded Quantum Interferometry for Weighted Optimization](https://arxiv.org/abs/2605.10666), 2026 preprint.
- [Hamiltonian Decoded Quantum Interferometry for General Pauli Hamiltonians](https://arxiv.org/abs/2601.18773), 2026 preprint.
- [Decoded Quantum Interferometry Under Noise](https://arxiv.org/abs/2508.10725), *Quantum Science and Technology* 11, 025010 (2026).
- [Stabilizer Testing and Magic Entropy via Quantum Fourier Analysis](https://arxiv.org/abs/2306.09292), *Communications in Mathematical Physics* 406, 236 (2025).
- [Quantum Ruzsa Divergence to Quantify Magic](https://arxiv.org/abs/2401.14385), *IEEE Transactions on Information Theory* 71, 2726 (2025).
- [Magic Resource Can Enhance the Quantum Capacity of Channels](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.134.050202), *Physical Review Letters* 134, 050202 (2025), Kaifeng Bu and Arthur Jaffe.

The original design takes inspiration from the clear positioning and research emphasis of [Atomic Inference](https://atomicinference.ai) and [Magic State Labs](https://www.magicstatelabs.com/). Their branding, graphics, product claims, and benchmarks are not reproduced.

## Publish at quantumfourierlab.com

The project deploys to GitHub Pages. The custom domain is configured in repository settings, and DNS records are managed in Namecheap. A private Sites preview is managed separately.

When ready for the public launch:

1. In this repository's **Settings → Pages**, choose **GitHub Actions** as the source.
2. Push changes to `dist/` or the workflow on `main` to deploy automatically. To rerun without a source change, open the repository's top-level **Actions → Deploy to GitHub Pages → Run workflow** and select `main`. This is separate from **Settings → Actions**, which configures permissions.
3. In **Settings → Pages**, set the custom domain to `quantumfourierlab.com` before changing DNS.
4. At the domain's DNS provider, configure apex `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. If using `www`, point its `CNAME` to `ybzhang-nxu.github.io`.
5. Enable **Enforce HTTPS** after the domain check and certificate provisioning finish.
6. The `og:url` and `og:image` metadata in `dist/index.html` already use `https://quantumfourierlab.com`.

These steps follow the [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). With a custom Actions workflow, GitHub uses the domain in repository settings; a `CNAME` file is not required.

Before a public launch, replace the GitHub contact route if a dedicated collaboration email is available, and confirm the desired wording about the initiative and Kaifeng Bu.

## Editing

Edit files directly in `dist/`. Keep publication titles, author lists, and status labels consistent with their linked sources. Keep future research aims distinct from completed research and operational capabilities. All assets are local, so the page has no font or artwork dependency on third-party services.
