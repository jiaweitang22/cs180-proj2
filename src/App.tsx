import { useEffect, useState } from 'react';
import { fourLoopCode, twoLoopCode } from './convolutions';
import Math from './Math';

type TocItem = {
  id: string;
  title: string;
  children?: TocItem[];
};

const toc: TocItem[] = [
  {
    id: 'fun-with-filters',
    title: 'Fun with Filters',
    children: [
      { id: 'convolutions-from-scratch', title: 'Convolutions from Scratch' },
      { id: 'finite-difference-operator', title: 'Finite Difference Operator' },
      { id: 'derivative-of-gaussian-dog-filter', title: 'Derivative of Gaussian (DoG) Filter' },
    ],
  },
  {
    id: 'fun-with-frequencies',
    title: 'Fun with Frequencies!',
    children: [
      {
        id: 'image-sharpening',
        title: 'Image “Sharpening”',
        children: [
          { id: 'example-1', title: 'Example 1' },
          { id: 'example-2', title: 'Example 2' },
          { id: 'example-3-blurring-sharpening', title: 'Example 3: Blurring → Sharpening' },
        ],
      },
      { id: 'hybrid-images', title: 'Hybrid Images' },
      { id: 'gaussian-and-laplacian-stacks', title: 'Gaussian and Laplacian Stacks' },
      { id: 'multiresolution-blending', title: 'Multiresolution Blending (a.k.a. the oraple!)' },
    ],
  },
  { id: 'lessons', title: 'Lessons' },
];

function flattenToc(items: TocItem[]): string[] {
  return items.flatMap((item) => [item.id, ...(item.children ? flattenToc(item.children) : [])]);
}

const headingIds = flattenToc(toc);

type Fig = [string, string];
const imageUrl = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;
const fullSizes: Record<string, [number, number]> = {
  'part1_2/threshold_sweep.png': [1736, 1166],
  'part1_3/finite_difference_vs_gaussian.png': [1257, 1328],
  'part2_3/figure_3_42.png': [1233, 1686],
  'part2_4/kaws_basketball_process.png': [1326, 1686],
};

function Gallery({ figures, columns = 3 }: { figures: Fig[]; columns?: 2 | 3 | 4 }) {
  return <div className={`figure-grid cols-${columns}`}>{figures.map(([file, label]) =>
    <figure key={file} className="figure-card">
      <a href={imageUrl(file)} target="_blank" rel="noreferrer" aria-label={`Open full-size figure: ${label}`}><img src={imageUrl(file)} alt={label} loading="lazy" /></a>
      <figcaption>{label}</figcaption>
    </figure>)}</div>;
}

function FullFigure({ file, label }: { file: string; label: string }) {
  const [width, height] = fullSizes[file];
  return <figure className="figure-full"><a href={imageUrl(file)} target="_blank" rel="noreferrer" aria-label={`Open full-size figure: ${label}`}><img src={imageUrl(file)} alt={label} width={width} height={height} loading="lazy" /></a><figcaption>{label} <span className="expand-hint">Click to enlarge.</span></figcaption></figure>;
}

function MontageColumns({ file, labels, width, height }: { file: string; labels: string[]; width: number; height: number }) {
  return <div className="montage-grid">{labels.map((label, index) =>
    <figure key={label} className="montage-card">
      <a href={imageUrl(file)} target="_blank" rel="noreferrer" aria-label={`Open full-size montage: ${label}`}>
        <div className="montage-viewport" style={{ aspectRatio: `${width / labels.length} / ${height}` }}>
          <img
            src={imageUrl(file)}
            alt={label}
            loading="lazy"
            style={{ width: `${labels.length * 100}%`, transform: `translateX(-${index / labels.length * 100}%)` }}
          />
        </div>
      </a>
      <figcaption>{label}</figcaption>
    </figure>)}</div>;
}

function CodeSlot({ label, source }: { label: string; source: string }) {
  return (
    <div className="source-code">
      <div className="code-title">{label}</div>
      <pre>
        <code>{source}</code>
      </pre>
    </div>
  );
}

function Finding({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="finding"><span className="finding-label">{label}</span><p>{children}</p></div>;
}

function TocList({ items, depth = 0, activeId }: { items: TocItem[]; depth?: number; activeId: string }) {
  return (
    <ul className={depth === 0 ? 'toc-list' : 'toc-sublist'}>
      {items.map((item) => (
        <li key={item.id}>
          <a className={item.id === activeId ? 'active' : undefined} href={`#${item.id}`}>
            {item.title}
          </a>
          {item.children ? <TocList items={item.children} depth={depth + 1} activeId={activeId} /> : null}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [activeId, setActiveId] = useState(headingIds[0]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('cs180-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cs180-theme', theme); } catch { /* Theme still works for this visit. */ }
  }, [theme]);

  useEffect(() => {
    const headings = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <a className="brand" href="#top">
            Jiawei Tang
          </a>
          <div className="navbar-links">
            <a className="nav-link active" href="#top">
              CS 180 Project 2
            </a>
          </div>
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span> {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </nav>

      <div className="page" id="top">
        <main className="content">
          <header className="title-block">
            <div className="title-kicker">CS 180 <span aria-hidden="true">/</span> Fall 2026 <span aria-hidden="true">/</span> Project 2</div>
            <h1 className="title">CS 180 Project 2: Fun with Filters and Frequencies!</h1>
            <p className="title-lede">From pixel loops to image blends, this project explores how filtering different frequencies changes what we see.</p>
            <div className="title-meta">
              <div>
                <div className="meta-heading">Author</div>
                <div className="meta-value">Jiawei Tang</div>
              </div>
              <div>
                <div className="meta-heading">Published</div>
                <div className="meta-value">September 18, 2026</div>
              </div>
            </div>
          </header>

          <section id="fun-with-filters">
            <h1>Fun with Filters</h1>
            <p>I used two finite-difference filters, whose orientations determine which changes they detect:</p>
            <Math display tex="D_x=\begin{bmatrix}1&0&-1\end{bmatrix},\qquad D_y=\begin{bmatrix}1\\0\\-1\end{bmatrix}" />
            <p>Dₓ highlights vertical edges; Dᵧ highlights horizontal edges. I applied both to a selfie and the cameraman.</p>

            <section id="convolutions-from-scratch">
              <h2>Convolutions from Scratch</h2>
              <p>Convolution multiplies a pixel’s neighborhood by a flipped filter and sums the products. My NumPy implementations use zero padding for <code>same</code> and <code>full</code> output: one loops over pixels and filter entries; the other loops over pixels and sums each patch with NumPy. Both snippets come from my notebook.</p>
              <CodeSlot label="Four-loop convolution" source={fourLoopCode} />
              <CodeSlot label="Two-loop convolution" source={twoLoopCode} />
              <p>Against <code>scipy.signal.convolve2d</code>, both modes had at most 8.88×10⁻¹⁶ error with an asymmetric 2×3 kernel, confirming the flip. On a seeded 128×128 image with a 9×9 box filter:</p>
              <div className="table-wrap"><table className="runtime-table"><caption>Convolution runtime on the same input and kernel</caption><thead><tr><th scope="col">Implementation</th><th scope="col">Time</th><th scope="col">Inner calculation</th></tr></thead><tbody><tr><th scope="row">Four loops</th><td>0.3285 s</td><td>Python kernel loops</td></tr><tr><th scope="row">Two loops</th><td>0.0308 s</td><td>NumPy patch sum</td></tr><tr><th scope="row">SciPy</th><td>0.00152 s</td><td>Compiled convolution</td></tr></tbody></table></div>
              <p>NumPy makes the two-loop version faster; SciPy is about 20× faster still. My zero padding matches SciPy’s <code>boundary="fill", fillvalue=0</code>. In <code>same</code> mode, unseen pixels act as black, darkening a box blur near the frame or creating false derivative edges. Later edge tests use symmetric boundaries.</p>
              <p>On my grayscale selfie, the 9×9 box filter smooths detail. The derivative displays use mid-gray for zero and light or dark tones for opposite directions of change.</p>
              <Gallery columns={4} figures={[
                ['part1_1/selfie.png','Original grayscale selfie'],['part1_1/selfie_box9.png','9×9 box-filtered selfie'],['part1_1/selfie_dx.png','Selfie convolved with Dₓ'],['part1_1/selfie_dy.png','Selfie convolved with Dᵧ'],
              ]} />
            </section>

            <section id="finite-difference-operator">
              <h2>Finite Difference Operator</h2>
              <p>Finite differences measure horizontal and vertical brightness changes. Their Euclidean magnitude gives one edge-strength map; thresholding keeps the stronger edges. I removed the cameraman’s uniform white matte and used symmetric boundaries to avoid false frame edges.</p>
              <Gallery figures={[
                ['part1_2/cameraman.png','Cameraman after removing the white matte'],['part1_2/Ix.png','Partial derivative Iₓ'],['part1_2/Iy.png','Partial derivative Iᵧ'],['part1_2/gradient_magnitude.png','Gradient magnitude (normalized for display)'],['part1_2/edges_threshold_0.24.png','Binarized edges, threshold 0.24'],
              ]} />
              <Finding label="Threshold experiment">I chose <strong>τ = 0.24</strong> on the raw magnitude. Lower values (0.16–0.20) retain distracting grass; higher ones (0.28–0.32) break camera, face, and tripod contours.</Finding>
              <FullFigure file="part1_2/threshold_sweep.png" label="Threshold sweep: 0.16, 0.20, 0.24, 0.28, and 0.32 on the raw gradient magnitude" />
            </section>

            <section id="derivative-of-gaussian-dog-filter">
              <h2>Derivative of Gaussian (DoG) Filter</h2>
              <p>Gaussian smoothing suppresses small intensity changes before differentiation. I built a normalized 9×9 Gaussian (σ = 1.5) from the outer product of <code>cv2.getGaussianKernel(9, 1.5)</code> with itself, then convolved it with Dₓ and Dᵧ to form the DoG filters.</p>
              <Gallery figures={[
                ['part1_3/gaussian_kernel.png','Gaussian kernel G, 9×9, σ = 1.5'],['part1_3/dog_dx.png','DoG kernel G ∗ Dₓ'],['part1_3/dog_dy.png','DoG kernel G ∗ Dᵧ'],
              ]} />
              <p>Blurring before finite differences quiets grass and clothing texture while making major contours smoother and slightly wider. I chose a <strong>0.10 raw-magnitude threshold</strong>: 0.08 kept more grass, while 0.10 retained the silhouette, camera, tripod, and dome. Smoothing reduces isolated gradient responses, so this threshold is lower than the unsmoothed 0.24.</p>
              <Gallery figures={[
                ['part1_3/cameraman_blurred.png','Gaussian-smoothed cameraman'],['part1_3/smoothed_Ix.png','Blur then Dₓ: Iₓ'],['part1_3/smoothed_Iy.png','Blur then Dᵧ: Iᵧ'],['part1_3/smoothed_gradient_magnitude.png','Two-step gradient magnitude'],['part1_3/smoothed_edges_threshold_0.10.png','Two-step binary edges, threshold 0.10'],
              ]} />
              <p>Applying each precomputed DoG filter takes one convolution and matches blur-then-differentiate.</p>
              <Finding label="Verification">With identical symmetric padding, the derivative results differed by less than 7.2×10⁻¹⁶. Smoothing, rather than the order of operations, improves the edges.</Finding>
              <Gallery columns={4} figures={[
                ['part1_3/dog_Ix.png','One-step DoG Iₓ'],['part1_3/dog_Iy.png','One-step DoG Iᵧ'],['part1_3/dog_gradient_magnitude.png','One-step DoG magnitude'],['part1_3/dog_edges_threshold_0.10.png','One-step DoG edges, threshold 0.10'],
              ]} />
              <FullFigure file="part1_3/finite_difference_vs_gaussian.png" label="Finite differences versus Gaussian-smoothed differences: independently normalized magnitude displays and binary edges" />
            </section>
          </section>

          <section id="fun-with-frequencies">
            <h1>Fun with Frequencies!</h1>
            <p>I used frequency bands to sharpen images, combine subjects, and soften seams.</p>

            <section id="image-sharpening">
              <h2>Image “Sharpening”</h2>
              <p>I blurred an image, subtracted the blur to isolate its high-frequency residual, and added a scaled copy of that residual back:</p>
              <Math display tex="f_{\mathrm{sharp}}=f+\alpha\,(f-f\ast g)" />
              <p>α sets the added detail. Combining the terms into one unsharp-mask filter takes one convolution per channel; its Taj result differed from the two-step version by at most 1.33×10⁻¹⁵. Sharpening boosts surviving contrast but cannot restore detail lost to blur.</p>
              <h3>Taj Mahal</h3><p>With a 9×9 Gaussian (σ = 1.5), α = 2 sharpens the facade and dome without the halos of larger values. In the signed high-frequency view, mid-gray is zero; light and dark show positive and negative detail.</p>
              <Gallery columns={4} figures={[
                ['part2_1/taj_original.png','Original Taj Mahal'],['part2_1/taj_blurred.png','Gaussian blur, σ = 1.5'],['part2_1/taj_high_frequency.png','High-frequency residual (signed display)'],['part2_1/taj_sharpened_alpha_2.png','Sharpened Taj, α = 2'],
              ]} />

              <section id="example-1">
                <h3>Example 1: Long-exposure waterfall</h3>
                <p>With a 13×13 Gaussian (σ = 2) and α = 2, rocks and grass gain texture. The long-exposure water changes less because much of its fine detail is already lost; a larger α made the ridge too harsh.</p>
                <Gallery columns={4} figures={[
                  ['part2_1/waterfall_original.png','Original long-exposure waterfall'],['part2_1/waterfall_blurred.png','Waterfall Gaussian blur, σ = 2'],['part2_1/waterfall_high_frequency.png','Waterfall high-frequency residual'],['part2_1/waterfall_sharpened.png','Sharpened waterfall, α = 2'],
                ]} />
              </section>

              <section id="example-2">
                <h3>Example 2: Amount sweep and skyline</h3>
                <p>With the Taj Gaussian fixed, α = 0 is the original, 2 gives controlled sharpening, and 5–10 adds clipping and strong halos.</p>
                <Gallery columns={4} figures={[
                  ['part2_1/taj_alpha_0.png','Taj α = 0'],['part2_1/taj_alpha_2.png','Taj α = 2'],['part2_1/taj_alpha_5.png','Taj α = 5'],['part2_1/taj_alpha_10.png','Taj α = 10'],
                ]} />
                <p>On the hazy Seattle skyline, a 13×13 Gaussian (σ = 2) with α = 5 sharpens windows and Space Needle supports. Broad, low-frequency haze remains.</p>
                <Gallery columns={2} figures={[
                  ['part2_1/seattle_original.png','Original Seattle skyline'],['part2_1/seattle_sharpened.png','Sharpened Seattle skyline, α = 5'],
                ]} />
              </section>

              <section id="example-3-blurring-sharpening">
                <h3>Example 3: Blurring → Sharpening</h3>
                <p>I blurred a sharp hawk photo with a 25×25 Gaussian (σ = 5), then sharpened it with α = 2. At α = 10, the surviving edges developed halos.</p>
                <Gallery figures={[
                  ['part2_1/evaluation_original.png','Original sharp roadside hawk'],['part2_1/evaluation_blurred.png','Blurred hawk, 25×25 Gaussian, σ = 5'],['part2_1/evaluation_recovered.png','Sharpened blurred hawk, α = 2'],
                ]} />
                <Finding label="Limit of recovery">The eye, beak, and breast bars regain contrast, but feathers and foliage remain softer than in the original. Lost detail cannot be recovered by sharpening.</Finding>
              </section>
            </section>

            <section id="hybrid-images">
              <h2>Hybrid Images</h2>
              <p>Low frequencies carry broad shapes and color; high frequencies carry edges and texture. Fine detail dominates nearby but fades with distance, revealing the smoother subject.</p>
              <p>I align corresponding features, add a Gaussian-blurred low-frequency image to the other image’s high-frequency residual (original minus its blur), then tune both σ values for a clear switch.</p>
              <h3>Derek + Nutmeg</h3><p>I aligned the eyes and used grayscale. Derek supplies low frequencies (σ = 14); Nutmeg supplies high frequencies (σ = 4). Grayscale keeps Derek’s colors from overpowering Nutmeg up close.</p>
              <Gallery figures={[
                ['part2_2/derek_original.png','Derek original'],['part2_2/nutmeg_original.png','Nutmeg original'],['part2_2/derek_nutmeg_hybrid.png','Derek + Nutmeg hybrid (low σ = 14; high σ = 4)'],
              ]} />
              <h3>Motorcycle + bicycle</h3><p>I aligned the wheel hubs. The motorcycle provides grayscale low frequencies (σ = 12) for the distant view; the bicycle adds high-frequency spokes and frame edges (σ = 4) up close.</p>
              <Gallery figures={[
                ['part2_2/motorbike_input.png','Motorcycle input'],['part2_2/bicycle_input.png','Bicycle input'],['part2_2/motorbike_bicycle_hybrid.png','Motorcycle + bicycle hybrid (low σ = 12; high σ = 4)'],
              ]} />
              <h3>Orca + Ioniq 6</h3><p>I aligned the orca’s snout and tail with the car’s bumpers. The color Ioniq supplies low frequencies (σ = 14); the grayscale orca adds eye, fin, and contour detail (σ = 5) without bringing in the water’s blue.</p>
              <Gallery figures={[
                ['part2_2/ioniq_input.png','Aligned Ioniq 6 input'],['part2_2/orca_input.png','Aligned orca input'],['part2_2/orca_ioniq_hybrid.png','Orca + Ioniq 6 hybrid (car low σ = 14; orca high σ = 5)'],
              ]} />
              <h3>Neytiri + Zoe Saldana: full process</h3><p>My favorite pair aligns the eyes and crops to a shared view. Neytiri’s color low frequencies (σ = 14) read from afar; Zoe’s high-frequency facial details (σ = 4) appear up close. A smaller low-pass σ left Neytiri’s stripes visible nearby, a larger high-pass σ added noise, and reversing the roles made a necklace halo.</p>
              <h4 className="process-step"><span>01</span> Original portraits</h4>
              <Gallery columns={2} figures={[
                ['part2_2/neytiri_original.png','Neytiri original'],['part2_2/zoe_original.png','Zoe Saldana original'],
              ]} />
              <h4 className="process-step"><span>02</span> Align and crop</h4>
              <Gallery columns={2} figures={[
                ['part2_2/neytiri_aligned.png','Neytiri aligned and cropped'],['part2_2/zoe_aligned.png','Zoe aligned and cropped'],
              ]} />
              <h4 className="process-step"><span>03</span> Filter and combine</h4>
              <Gallery figures={[
                ['part2_2/neytiri_low.png','Low-pass Neytiri, σ = 14'],['part2_2/zoe_high.png','High-pass Zoe, σ = 4 (signed display)'],['part2_2/neytiri_zoe_hybrid.png','Final Neytiri + Zoe hybrid'],
              ]} />
              <h4 className="process-step"><span>04</span> Inspect the frequency content</h4>
              <p>The centered log-magnitude Fourier plots use grayscale luminance from both aligned inputs, both filtered layers, and the hybrid. Low frequencies cluster at the center; the high-pass layer suppresses that center. The hybrid contains both. Each panel pairs an image with its spectrum.</p>
              <MontageColumns file="part2_2/neytiri_zoe_frequency_analysis.png" width={2215} height={888} labels={[
                'Aligned Neytiri and FFT', 'Aligned Zoe and FFT', 'Neytiri low-pass and FFT', 'Zoe high-pass and FFT', 'Hybrid and FFT',
              ]} />
            </section>

            <section id="gaussian-and-laplacian-stacks">
              <h2>Gaussian and Laplacian Stacks</h2>
              <p>A Gaussian stack repeatedly blurs an image; subtracting adjacent levels gives Laplacian detail bands, with the final Gaussian as the coarse residual. My six-level apple and orange stacks keep the original dimensions, start at σ = 4, and double the blur scale at later levels. Summing the Laplacian levels reconstructs the input with at most 1.11×10⁻¹⁶ error.</p>
              <p>Each panel shows apple above orange at one scale. Click to view the full stack.</p>
              <h3>Gaussian levels</h3>
              <MontageColumns file="part2_3/gaussian_stacks.png" width={2994} height={1004} labels={[
                'Apple and orange, G₀', 'Apple and orange, G₁', 'Apple and orange, G₂', 'Apple and orange, G₃', 'Apple and orange, G₄', 'Apple and orange, G₅',
              ]} />
              <h3>Laplacian levels</h3>
              <MontageColumns file="part2_3/laplacian_stacks.png" width={2994} height={1004} labels={[
                'Apple and orange, L₀', 'Apple and orange, L₁', 'Apple and orange, L₂', 'Apple and orange, L₃', 'Apple and orange, L₄', 'Apple and orange, L₅ (coarse residual)',
              ]} />
              <p>Figure 3.42 (a)–(l) uses a vertical apple/orange mask. The first three rows show masked apple, masked orange, and combined high, middle, and low bands. The last row shows each source’s collapsed contribution and the oraple. Signed bands use mid-gray for zero.</p>
              <FullFigure file="part2_3/figure_3_42.png" label="Recreation of Szeliski Figure 3.42 (a)–(l): apple and orange frequency contributions and reconstructed oraple" />
            </section>

            <section id="multiresolution-blending">
              <h2>Multiresolution Blending (a.k.a. the oraple!)</h2>
              <p>Multiresolution blending combines two Laplacian stacks using a Gaussian stack of the mask as weights, then sums the levels. Coarse levels spread the color transition widely; fine levels preserve texture near the seam.</p>
              <h3>Apple + orange</h3><p>A vertical step mask selects apple on the left and orange on the right. I compared a hard cut with a six-level blend starting at σ = 4.</p>
              <MontageColumns file="part2_4/oraple_comparison.png" width={2909} height={603} labels={[
                'Apple input', 'Orange input', 'Vertical mask', 'Hard cut with visible seam', 'Multiresolution oraple',
              ]} />
              <Finding label="What changed">The hard cut has a center seam; the multiresolution blend softens it while retaining fruit texture. Figure 3.42 shows the same reconstruction.</Finding>
              <h3>Custom blend 1: Lime + lemon</h3><p>I aligned both fruit on a 640×640 canvas and softened a vertical mask at σ = 28. Seven levels starting at σ = 8 blend the green and yellow pulp more smoothly than a hard cut.</p>
              <Gallery figures={[
                ['part2_4/lime.png','Aligned lime'],['part2_4/lemon.png','Aligned lemon'],['part2_4/lime_lemon_mask.png','Softened vertical mask'],['part2_4/lime_lemon_hard.png','Lime + lemon hard cut'],['part2_4/lime_lemon.png','Lime + lemon multiresolution blend'],
              ]} />
              <h3>Custom blend 2: Blue + red gummy bear</h3><p>I aligned the gummies by their bounding boxes. A horizontal mask softened at σ = 8 and five levels starting at σ = 4 blend blue into red without bleeding much color into the white background.</p>
              <Gallery figures={[
                ['part2_4/blue_gummy.png','Aligned blue gummy'],['part2_4/red_gummy.png','Aligned red gummy'],['part2_4/gummy_mask.png','Softened horizontal mask'],['part2_4/gummy_hard.png','Blue + red hard cut'],['part2_4/gummy.png','Blue + red multiresolution blend'],
              ]} />
              <h3>Custom blend 3: Oreo flavor packages</h3><p>I reduced the registered packages to a 900-pixel maximum side. A vertical mask softened at σ = 12 and six levels starting at σ = 5 preserve the logo while blending the yellow and brown backgrounds.</p>
              <Gallery columns={2} figures={[
                ['part2_4/oreo_banana.png','Banana Pudding Oreo input'],['part2_4/oreo_chicken.png','Chicken & Waffles Oreo input'],['part2_4/oreo_mask.png','Softened vertical mask'],['part2_4/oreo_hard.png','Oreo hard cut'],['part2_4/oreo.png','Multiresolution Oreo blend'],
              ]} />
              <h3>Custom blend 4: KAWS + basketball (irregular mask)</h3><p>I placed a basketball over KAWS’s sphere and selected it with a circular mask centered at (500, 426), radius 165. Six levels starting at σ = 4 soften the pasted rim while retaining the ball’s markings.</p>
              <Gallery figures={[
                ['part2_4/kaws_input.png','KAWS original'],['part2_4/basketball_placed.png','Basketball positioned over the sphere'],['part2_4/kaws_basketball_mask.png','Circular selection mask'],['part2_4/kaws_basketball_hard.png','Hard composite'],['part2_4/kaws_basketball.png','Multiresolution KAWS + basketball'],
              ]} />
              <p>The process figure shows masked contributions from both images, their combined high, middle, and low bands, and the final reconstruction.</p>
              <FullFigure file="part2_4/kaws_basketball_process.png" label="Favorite blend process: masked input contributions, combined Laplacian bands, and final KAWS + basketball result" />
              <Finding label="Why I kept this result">Compared with the hard composite, the ball’s rim blends more naturally into KAWS’s hands.</Finding>
              <h3>Custom blend 5: LeBron + GOAT (silhouette mask)</h3><p>I applied the same transform to the goat photo and its horn-to-muzzle silhouette (scale 0.58; center (434, 346)). A mask softened at σ = 4 and six levels starting at σ = 4 blend the head into LeBron’s dark background while preserving his jersey and arms.</p>
              <Gallery columns={2} figures={[
                ['part2_4/lebron.png','LeBron original'],['part2_4/goat_input.png','Goat source'],['part2_4/lebron_goat_mask.png','Irregular goat-head silhouette mask'],['part2_4/lebron_goat_hard.png','Aligned goat, hard silhouette composite'],['part2_4/lebron_goat.png','Multiresolution LeBron + GOAT blend'],
              ]} />
            </section>
          </section>

          <section id="lessons">
            <h1>Lessons</h1>
            <p>The most important thing I learned is that separating an image into fine detail and broad color makes complex effects manageable: sharpening boosts detail, hybrids assign it to different subjects, and blending joins those scales to soften a seam. The hard-cut comparisons made that last point clear. Each result still needed careful alignment and tuning, but building the filters myself showed me how much control code gives over the final image.</p>
          </section>
        </main>

        <aside className="toc" aria-label="On this page">
          <h2>On this page</h2>
          <nav>
            <TocList items={toc} activeId={activeId} />
          </nav>
        </aside>
      </div>
    </>
  );
}
