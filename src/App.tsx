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
            <p className="title-lede">I followed a single idea from pixel loops to image blends: changing which frequencies survive changes what we see. These experiments show the results, the choices behind them, and where the methods reach their limits.</p>
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
            <p>I began with two short finite-difference filters. Their orientations determine which changes they detect; convolution flips each kernel before sliding it across the image.</p>
            <Math display tex="D_x=\begin{bmatrix}1&0&-1\end{bmatrix},\qquad D_y=\begin{bmatrix}1\\0\\-1\end{bmatrix}" />
            <p>The horizontal filter responds to changes across columns and highlights vertical edges; the vertical filter highlights horizontal edges. I used these same operators first on a selfie, then on the cameraman.</p>

            <section id="convolutions-from-scratch">
              <h2>Convolutions from Scratch</h2>
              <p>I implemented convolution twice using NumPy alone. Both versions flip the kernel and explicitly zero-pad the image for <code>same</code> or <code>full</code> output. The first uses four loops over output pixels and kernel entries; the second keeps only the output loops and lets NumPy multiply and sum each patch. These are the exact Part 1.1 implementations from my notebook.</p>
              <CodeSlot label="Four-loop convolution" source={fourLoopCode} />
              <CodeSlot label="Two-loop convolution" source={twoLoopCode} />
              <p>I checked both modes against <code>scipy.signal.convolve2d</code> using a nonsymmetric 2×3 kernel. The maximum error was 8.88×10⁻¹⁶ in both modes, which also verifies the kernel flip. For a seeded 128×128 image with a 9×9 box kernel, I measured:</p>
              <div className="table-wrap"><table className="runtime-table"><caption>Convolution runtime on the same input and kernel</caption><thead><tr><th scope="col">Implementation</th><th scope="col">Time</th><th scope="col">Inner calculation</th></tr></thead><tbody><tr><th scope="row">Four loops</th><td>0.3285 s</td><td>Python kernel loops</td></tr><tr><th scope="row">Two loops</th><td>0.0308 s</td><td>NumPy patch sum</td></tr><tr><th scope="row">SciPy</th><td>0.00152 s</td><td>Compiled convolution</td></tr></tbody></table></div>
              <p>NumPy speeds up the inner calculation; SciPy was about 20 times faster than even the two-loop version.</p>
              <p>My zero padding matches SciPy’s <code>boundary="fill", fillvalue=0</code>. It keeps the image dimensions in <code>same</code> mode but treats unseen pixels as black: a box blur darkens near the frame, and a derivative may detect the frame itself. SciPy also offers symmetric and wrap boundaries; I use symmetric extension in later edge experiments to avoid that artificial response.</p>
              <p>I read my selfie in grayscale, applied a 9×9 box filter, then tried both derivatives. Every position in the box has equal weight:</p>
              <Math display tex="B_{9\times9}=\frac{1}{81}\mathbf{1}_{9\times9}" />
              <p>The box smooths small details. Mid-gray means zero in the signed derivative displays; bright and dark show opposite directions of change.</p>
              <Gallery columns={4} figures={[
                ['part1_1/selfie.png','Original grayscale selfie'],['part1_1/selfie_box9.png','9×9 box-filtered selfie'],['part1_1/selfie_dx.png','Selfie convolved with Dₓ'],['part1_1/selfie_dy.png','Selfie convolved with Dᵧ'],
              ]} />
            </section>

            <section id="finite-difference-operator">
              <h2>Finite Difference Operator</h2>
              <p>On the cameraman, I wanted a single map of edge strength rather than two signed derivative views. I combined the horizontal and vertical responses by their Euclidean magnitude, then thresholded that magnitude:</p>
              <Math display tex="\begin{aligned}I_x&=I\ast D_x,\qquad I_y=I\ast D_y\\M&=\sqrt{I_x^2+I_y^2}\\E_\tau&=\mathbf{1}[M>\tau]\end{aligned}" />
              <p>I cropped the supplied image’s uniform white matte and used symmetric boundary extension so the matte and a zero-filled frame would not become false edges.</p>
              <Gallery figures={[
                ['part1_2/cameraman.png','Cameraman after removing the white matte'],['part1_2/Ix.png','Partial derivative Iₓ'],['part1_2/Iy.png','Partial derivative Iᵧ'],['part1_2/gradient_magnitude.png','Gradient magnitude (normalized for display)'],['part1_2/edges_threshold_0.24.png','Binarized edges, threshold 0.24'],
              ]} />
              <Finding label="Threshold experiment">I tried 0.16–0.32 on the raw magnitude. At 0.16–0.20, grass and background texture become distracting edges; at 0.28–0.32, camera, face, and tripod contours begin to break. I chose <strong>τ = 0.24</strong> to keep the main silhouette and horizon while suppressing most isolated responses.</Finding>
              <FullFigure file="part1_2/threshold_sweep.png" label="Threshold sweep: 0.16, 0.20, 0.24, 0.28, and 0.32 on the raw gradient magnitude" />
            </section>

            <section id="derivative-of-gaussian-dog-filter">
              <h2>Derivative of Gaussian (DoG) Filter</h2>
              <p>The finite differences still respond to grass and clothing texture. I tested whether smoothing before differentiation would quiet those responses. I formed a normalized 9×9 Gaussian with σ = 1.5 by taking the outer product of <code>cv2.getGaussianKernel(9, 1.5)</code> with itself. Convolving that Gaussian with each finite-difference filter produced the two DoG kernels:</p>
              <Math display tex="G=gg^{\mathsf T},\qquad K_x=G\ast D_x,\qquad K_y=G\ast D_y" />
              <p>Full convolution makes Kₓ 9×11 and Kᵧ 11×9.</p>
              <Gallery figures={[
                ['part1_3/gaussian_kernel.png','Gaussian kernel G, 9×9, σ = 1.5'],['part1_3/dog_dx.png','DoG kernel G ∗ Dₓ'],['part1_3/dog_dy.png','DoG kernel G ∗ Dᵧ'],
              ]} />
              <p>In the two-step path I blur the cameraman, then take finite differences. Compared with the unsmoothed result, the grass, sky, and clothing texture are quieter and the main contours more continuous, though slightly wider. I use a <strong>0.10 raw-magnitude threshold</strong> after smoothing: 0.08 still retains extra grass texture, while 0.10 keeps the silhouette, camera, tripod, and dome. This is lower than the unsmoothed 0.24 because smoothing reduces isolated gradient responses.</p>
              <Gallery figures={[
                ['part1_3/cameraman_blurred.png','Gaussian-smoothed cameraman'],['part1_3/smoothed_Ix.png','Blur then Dₓ: Iₓ'],['part1_3/smoothed_Iy.png','Blur then Dᵧ: Iᵧ'],['part1_3/smoothed_gradient_magnitude.png','Two-step gradient magnitude'],['part1_3/smoothed_edges_threshold_0.10.png','Two-step binary edges, threshold 0.10'],
              ]} />
              <p>Next I combined the Gaussian and derivative first, then applied each precomputed DoG kernel in one convolution. Associativity predicts that this should reproduce the two-step path:</p>
              <Math display tex="\begin{aligned}(I\ast G)\ast D_x&=I\ast(G\ast D_x)\\(I\ast G)\ast D_y&=I\ast(G\ast D_y)\end{aligned}" />
              <Finding label="What changed">With one symmetric pad followed by valid convolutions in both paths, the maximum difference in either derivative was below 7.2×10⁻¹⁶. The one-step DoG and blur-then-differentiate edge maps agree to floating-point precision; the improvement over raw finite differences comes from smoothing, not from changing the order.</Finding>
              <Gallery columns={4} figures={[
                ['part1_3/dog_Ix.png','One-step DoG Iₓ'],['part1_3/dog_Iy.png','One-step DoG Iᵧ'],['part1_3/dog_gradient_magnitude.png','One-step DoG magnitude'],['part1_3/dog_edges_threshold_0.10.png','One-step DoG edges, threshold 0.10'],
              ]} />
              <FullFigure file="part1_3/finite_difference_vs_gaussian.png" label="Finite differences versus Gaussian-smoothed differences: independently normalized magnitude displays and binary edges" />
            </section>
          </section>

          <section id="fun-with-frequencies">
            <h1>Fun with Frequencies!</h1>
            <p>Once blur and derivatives were working, I used the same frequency split in three different ways: boost detail for sharpening, assign different bands to different subjects for hybrids, and blend bands at different scales to hide a seam.</p>

            <section id="image-sharpening">
              <h2>Image “Sharpening”</h2>
              <p>I blurred an image, subtracted the blur to isolate its high-frequency residual, and added a scaled copy of that residual back. The algebra also turns the two-step idea into one convolution per color channel:</p>
              <Math display tex="\begin{aligned}h&=f-f\ast g\\f_{\mathrm{sharp}}&=f+\alpha h\\&=(1+\alpha)f-\alpha(f\ast g)\\&=f\ast\big[(1+\alpha)\delta-\alpha g\big]\end{aligned}" />
              <p>Here δ is the identity impulse and α controls how much detail is added.</p>
              <p>My single-convolution and explicit two-step Taj results differed by at most 1.33×10⁻¹⁵. This method strengthens existing local contrast; it cannot invent detail erased by blur.</p>
              <h3>Taj Mahal</h3><p>I used a 9×9 Gaussian with σ = 1.5. In the signed high-frequency display, mid-gray is zero, white is positive, and black is negative. I chose α = 2 for the main result: facade patterns, arches, trees, and the dome become clearer without the stronger halos of larger values.</p>
              <Gallery columns={4} figures={[
                ['part2_1/taj_original.png','Original Taj Mahal'],['part2_1/taj_blurred.png','Gaussian blur, σ = 1.5'],['part2_1/taj_high_frequency.png','High-frequency residual (signed display)'],['part2_1/taj_sharpened_alpha_2.png','Sharpened Taj, α = 2'],
              ]} />

              <section id="example-1">
                <h3>Example 1: Long-exposure waterfall</h3>
                <p>I used a 13×13 Gaussian with σ = 2 and α = 2. Rock layers, moss, and grass gain texture, while motion-blurred water changes less because the exposure already removed much of its fine detail. A larger α made the rocks and ridge too harsh.</p>
                <Gallery columns={4} figures={[
                  ['part2_1/waterfall_original.png','Original long-exposure waterfall'],['part2_1/waterfall_blurred.png','Waterfall Gaussian blur, σ = 2'],['part2_1/waterfall_high_frequency.png','Waterfall high-frequency residual'],['part2_1/waterfall_sharpened.png','Sharpened waterfall, α = 2'],
                ]} />
              </section>

              <section id="example-2">
                <h3>Example 2: Amount sweep and skyline</h3>
                <p>I held the Taj Gaussian fixed and changed only α. This made the tradeoff visible: 0 is the original, 2 is a controlled improvement, 5 clips highlights and adds dark outlines, and 10 makes the halos almost cartoon-like.</p>
                <Gallery columns={4} figures={[
                  ['part2_1/taj_alpha_0.png','Taj α = 0'],['part2_1/taj_alpha_2.png','Taj α = 2'],['part2_1/taj_alpha_5.png','Taj α = 5'],['part2_1/taj_alpha_10.png','Taj α = 10'],
                ]} />
                <p>I then tried a different kind of softness: atmospheric haze in the Seattle skyline. A 13×13 Gaussian (σ = 2) with α = 5 emphasizes window grids and Space Needle supports, but the haze remains because it is broad, low-frequency contrast loss.</p>
                <Gallery columns={2} figures={[
                  ['part2_1/seattle_original.png','Original Seattle skyline'],['part2_1/seattle_sharpened.png','Sharpened Seattle skyline, α = 5'],
                ]} />
              </section>

              <section id="example-3-blurring-sharpening">
                <h3>Example 3: Blurring → Sharpening</h3>
                <p>To test the method’s limit, I deliberately blurred a sharp roadside hawk photo with a 25×25 Gaussian (σ = 5), then sharpened the blurred result. I first tried α = 10, but it turned surviving edges into halos. I kept α = 2 for the comparison below.</p>
                <Gallery figures={[
                  ['part2_1/evaluation_original.png','Original sharp roadside hawk'],['part2_1/evaluation_blurred.png','Blurred hawk, 25×25 Gaussian, σ = 5'],['part2_1/evaluation_recovered.png','Sharpened blurred hawk, α = 2'],
                ]} />
                <Finding label="Limit of recovery">The eye, beak, breast bars, and leaf edges regain some contrast, but fine feathers and foliage stay softer than the original. Sharpening amplifies frequencies that survived the blur; it cannot reconstruct the details the blur erased.</Finding>
              </section>
            </section>

            <section id="hybrid-images">
              <h2>Hybrid Images</h2>
              <p>I aligned corresponding features, blurred one image for its low-frequency layer, and added the second image’s high-frequency residual:</p>
              <Math display tex="\begin{aligned}H&=G_{\sigma_{\mathrm{low}}}\ast A\\&\quad+\big[B-G_{\sigma_{\mathrm{high}}}\ast B\big]\end{aligned}" />
              <p>Up close, the detail layer is prominent. From farther away, its fine structure fades and the low-pass subject takes over. I adjusted cutoffs to avoid seeing both subjects at once or making the high-pass layer harsh.</p>
              <h3>Derek + Nutmeg</h3><p>I aligned the eyes and used grayscale for both images. Derek is the low-pass subject with σ = 14; Nutmeg is the high-pass subject with σ = 4. Grayscale prevents Derek’s skin and shirt color from making the close-up look like a person even when Nutmeg’s edges are visible.</p>
              <Gallery figures={[
                ['part2_2/derek_original.png','Derek original'],['part2_2/nutmeg_original.png','Nutmeg original'],['part2_2/derek_nutmeg_hybrid.png','Derek + Nutmeg hybrid (low σ = 14; high σ = 4)'],
              ]} />
              <h3>Motorcycle + bicycle</h3><p>I registered the wheel hubs to preserve a shared two-wheel silhouette. The motorcycle contributes grayscale low frequencies at σ = 12; the bicycle contributes grayscale high frequencies at σ = 4. The motorcycle’s mass reads from far away, while the bicycle’s thin spokes, frame, pedals, and cables appear up close.</p>
              <Gallery figures={[
                ['part2_2/motorbike_input.png','Motorcycle input'],['part2_2/bicycle_input.png','Bicycle input'],['part2_2/motorbike_bicycle_hybrid.png','Motorcycle + bicycle hybrid (low σ = 12; high σ = 4)'],
              ]} />
              <h3>Orca + Ioniq 6</h3><p>I aligned the orca’s snout and tail with the car’s front and rear bumpers. The Ioniq supplies color low frequencies at σ = 14, retaining the car’s broad shape and waterfront tones. The grayscale orca supplies high frequencies at σ = 5; its eye, fin, and body contour become more visible up close. Keeping the orca layer grayscale avoids mixing the original water’s blue with the car’s color.</p>
              <Gallery figures={[
                ['part2_2/ioniq_input.png','Aligned Ioniq 6 input'],['part2_2/orca_input.png','Aligned orca input'],['part2_2/orca_ioniq_hybrid.png','Orca + Ioniq 6 hybrid (car low σ = 14; orca high σ = 5)'],
              ]} />
              <h3>Neytiri + Zoe Saldana: full process</h3><p>This is my favorite pair. I aligned the eyes, then cropped to the common valid area so the eyes, nose, and mouth overlap. Neytiri supplies color low frequencies at σ = 14; Zoe supplies color high frequencies at σ = 4. Neytiri’s broad blue face dominates from far away, while Zoe’s eyebrows, lips, hair, and earrings emerge near the screen. A smaller low-pass σ left Neytiri’s stripes and necklace visible up close; a larger high-pass σ made Zoe noisy. Reversing the roles caused a bright necklace halo.</p>
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
              <p>I calculated a centered log-magnitude Fourier transform from grayscale luminance for each aligned input, filtered layer, and final hybrid:</p>
              <Math display tex="\begin{aligned}F(I)&=\operatorname{fftshift}\!\big(\operatorname{fft2}(I_{\mathrm{gray}})\big)\\S(I)&=\log\!\big(|F(I)|+10^{-12}\big)\end{aligned}" />
              <p>The low-pass spectrum concentrates near the center; Zoe’s high-pass spectrum suppresses that center and retains outer frequencies. The hybrid has both. Each panel below pairs an image (top) with its spectrum (bottom); click one for the complete figure.</p>
              <MontageColumns file="part2_2/neytiri_zoe_frequency_analysis.png" width={2215} height={888} labels={[
                'Aligned Neytiri and FFT', 'Aligned Zoe and FFT', 'Neytiri low-pass and FFT', 'Zoe high-pass and FFT', 'Hybrid and FFT',
              ]} />
            </section>

            <section id="gaussian-and-laplacian-stacks">
              <h2>Gaussian and Laplacian Stacks</h2>
              <p>For blending, I needed detail at more than one scale. I made six Gaussian levels for each apple and orange by repeatedly blurring without downsampling, so every level stays the original size. My base σ is 4, and later blur scales double. Subtracting adjacent Gaussian levels isolates the detail bands:</p>
              <Math display tex="\begin{aligned}L_i&=G_i-G_{i+1}\quad(0\leq i<N-1)\\L_{N-1}&=G_{N-1}\end{aligned}" />
              <p>The last level is the coarsest residual. Summing the Laplacian stack reconstructs the original; the maximum error in my notebook was 1.11×10⁻¹⁶.</p>
              <p>Each panel pairs the apple (top) and orange (bottom) at one level. The larger panels make the progressive blur and the signed detail bands easier to compare; click one to open the complete stack.</p>
              <h3>Gaussian levels</h3>
              <MontageColumns file="part2_3/gaussian_stacks.png" width={2994} height={1004} labels={[
                'Apple and orange, G₀', 'Apple and orange, G₁', 'Apple and orange, G₂', 'Apple and orange, G₃', 'Apple and orange, G₄', 'Apple and orange, G₅',
              ]} />
              <h3>Laplacian levels</h3>
              <MontageColumns file="part2_3/laplacian_stacks.png" width={2994} height={1004} labels={[
                'Apple and orange, L₀', 'Apple and orange, L₁', 'Apple and orange, L₂', 'Apple and orange, L₃', 'Apple and orange, L₄', 'Apple and orange, L₅ (coarse residual)',
              ]} />
              <p>I recreated Szeliski Figure 3.42 (a)–(l) with a vertical apple/orange mask. In each of the first three rows, the columns are masked apple detail, masked orange detail, and their sum, at high (a–c), middle (d–f), and low (g–i) bands. The bottom row shows the collapsed apple contribution (j), orange contribution (k), and complete oraple (l). Signed bands are shifted around mid-gray for display; the final row is the reconstruction.</p>
              <FullFigure file="part2_3/figure_3_42.png" label="Recreation of Szeliski Figure 3.42 (a)–(l): apple and orange frequency contributions and reconstructed oraple" />
            </section>

            <section id="multiresolution-blending">
              <h2>Multiresolution Blending (a.k.a. the oraple!)</h2>
              <p>A hard cut chooses one source on each side of a seam. I wanted the choice to change gradually with scale, so I built a Gaussian stack of the mask alongside Laplacian stacks of both inputs. At each level I blend the two bands, then sum them:</p>
              <Math display tex="\begin{aligned}L_{\mathrm{blend},i}&=M_iL_{A,i}+(1-M_i)L_{B,i}\\I_{\mathrm{blend}}&=\sum_i L_{\mathrm{blend},i}\end{aligned}" />
              <p>Here Mᵢ is the mask’s Gaussian level. Its coarse levels spread the low-frequency transition while finer bands retain local detail near the seam.</p>
              <h3>Apple + orange</h3><p>I began with a vertical step mask: apple on the left, orange on the right. I used the same inputs for a direct cut and a six-level stack blend with base σ = 4, so the difference would come from the blending method.</p>
              <MontageColumns file="part2_4/oraple_comparison.png" width={2909} height={603} labels={[
                'Apple input', 'Orange input', 'Vertical mask', 'Hard cut with visible seam', 'Multiresolution oraple',
              ]} />
              <Finding label="What the mask changed">The direct cut exposes a center seam. The multiresolution result softens that transition while keeping the fruit texture on either side. It is the same oraple reconstructed in Figure 3.42 above.</Finding>
              <h3>Custom blend 1: Lime + lemon</h3><p>I centered and scaled the circular fruit to a common 640×640 canvas, then used a vertical step softened with σ = 28 before making seven stack levels (base σ = 8). The wide transition smooths the change from green to yellow pulp; the hard-cut comparison makes the seam visible.</p>
              <Gallery figures={[
                ['part2_4/lime.png','Aligned lime'],['part2_4/lemon.png','Aligned lemon'],['part2_4/lime_lemon_mask.png','Softened vertical mask'],['part2_4/lime_lemon_hard.png','Lime + lemon hard cut'],['part2_4/lime_lemon.png','Lime + lemon multiresolution blend'],
              ]} />
              <h3>Custom blend 2: Blue + red gummy bear</h3><p>I aligned the two gummies by their bounding boxes, then combined the blue top and red bottom with a horizontal step mask softened at σ = 8. Five stack levels with base σ = 4 smooth the color transition through the bear’s torso. The hard cut makes the midline more obvious; a much wider transition would bleed color into the white background.</p>
              <Gallery figures={[
                ['part2_4/blue_gummy.png','Aligned blue gummy'],['part2_4/red_gummy.png','Aligned red gummy'],['part2_4/gummy_mask.png','Softened horizontal mask'],['part2_4/gummy_hard.png','Blue + red hard cut'],['part2_4/gummy.png','Blue + red multiresolution blend'],
              ]} />
              <h3>Custom blend 3: Oreo flavor packages</h3><p>The Banana Pudding and Chicken &amp; Waffles packages were already registered, so I reduced each to a 900-pixel maximum side before blending. A vertical mask softened at σ = 12 selects banana on the left and chicken on the right. Six stack levels with base σ = 5 preserve the Oreo logo and central cookie while softening the abrupt change between the yellow and brown package backgrounds.</p>
              <Gallery columns={2} figures={[
                ['part2_4/oreo_banana.png','Banana Pudding Oreo input'],['part2_4/oreo_chicken.png','Chicken & Waffles Oreo input'],['part2_4/oreo_mask.png','Softened vertical mask'],['part2_4/oreo_hard.png','Oreo hard cut'],['part2_4/oreo.png','Multiresolution Oreo blend'],
              ]} />
              <h3>Custom blend 4: KAWS + basketball (irregular mask)</h3><p>For my favorite blend, I resized the basketball to replace the sphere held by KAWS and placed it on the same canvas. A circular mask centered at (500, 426) with radius 165 selects the ball. This mask is irregular relative to the straight seams above. The six-level stack (base σ = 4) keeps the ball’s markings while easing its rim into the hands; the hard composite retains a sharper pasted edge.</p>
              <Gallery figures={[
                ['part2_4/kaws_input.png','KAWS original'],['part2_4/basketball_placed.png','Basketball positioned over the sphere'],['part2_4/kaws_basketball_mask.png','Circular selection mask'],['part2_4/kaws_basketball_hard.png','Hard composite'],['part2_4/kaws_basketball.png','Multiresolution KAWS + basketball'],
              ]} />
              <p>The process view shows masked basketball, masked KAWS, and their combined Laplacian contributions at high, middle, and low bands. The last row collapses each input’s contribution and shows the finished image. This makes the circular mask’s role visible at every scale.</p>
              <FullFigure file="part2_4/kaws_basketball_process.png" label="Favorite blend process: masked input contributions, combined Laplacian bands, and final KAWS + basketball result" />
              <Finding label="Why I kept this result">The hard composite preserves a pasted rim around the ball. Across the six stack levels, the mask eases that rim into the hands while the basketball markings remain visible. The process figure shows which source contributes at each scale.</Finding>
              <h3>Custom blend 5: LeBron + GOAT (silhouette mask)</h3><p>I placed the goat’s head over LeBron’s with the same similarity transform for the goat photo and its matching silhouette mask (scale 0.58; target center (434, 346)). The mask follows the horns, ears, and muzzle, selecting only the head rather than the rectangular source photo. I softened its edge with σ = 2 and used six stack levels with base σ = 4. The hard composite leaves a visible cutout edge; the multiresolution blend eases the goat into the dark background while preserving the jersey and arms.</p>
              <Gallery columns={2} figures={[
                ['part2_4/lebron.png','LeBron original'],['part2_4/goat_input.png','Goat source'],['part2_4/lebron_goat_mask.png','Irregular goat-head silhouette mask'],['part2_4/lebron_goat_hard.png','Aligned goat, hard silhouette composite'],['part2_4/lebron_goat.png','Multiresolution LeBron + GOAT blend'],
              ]} />
            </section>
          </section>

          <section id="lessons">
            <h1>Lessons</h1>
            <p>Before this project, Photoshop tools like Sharpen, Blur, and the blending brush felt like black boxes. I dragged sliders until a picture changed and assumed I would never need to know why.</p>
            <p>Building them showed that those tools are one idea written as code. Unsharp masking boosts a high-frequency residual. A hybrid assigns that residual to one subject and the low-pass layer to another. Multiresolution blending repeats the split at several scales so a seam can fade. Those are the effects I have used for years, now as filters I can inspect.</p>
            <p>The part that stayed with me is that the method is only half the result. Sharpening cannot recover frequencies a blur erased, as the hawk experiment made obvious. Hybrids fail when alignment or cutoffs let both subjects read at once, or when leftover color from the low-pass layer gives the close-up away. A hard seam stays visible until the mask is smoothed at the same scales as the images. Once I could open those effects, I could also tell when they would land.</p>
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
