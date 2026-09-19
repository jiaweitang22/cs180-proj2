import { useEffect, useState } from 'react';
import { fourLoopCode, twoLoopCode } from './convolutions';

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
        </div>
      </nav>

      <div className="page" id="top">
        <main className="content">
          <header className="title-block">
            <h1 className="title">CS 180 Project 2: Fun with Filters and Frequencies!</h1>
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
            <p>I started with the finite-difference filters Dₓ = [1, 0, −1] and Dᵧ = [1, 0, −1]ᵀ. Convolution flips each filter before sliding it over the image, so these detect changes across columns and rows respectively.</p>

            <section id="convolutions-from-scratch">
              <h2>Convolutions from Scratch</h2>
              <p>I implemented convolution twice using NumPy alone. Both versions flip the kernel and explicitly zero-pad the image for <code>same</code> or <code>full</code> output. The first uses four loops over output pixels and kernel entries; the second keeps only the output loops and lets NumPy multiply and sum each patch. These are the exact Part 1.1 implementations from my notebook.</p>
              <CodeSlot label="Four-loop convolution" source={fourLoopCode} />
              <CodeSlot label="Two-loop convolution" source={twoLoopCode} />
              <p>I checked both modes against <code>scipy.signal.convolve2d</code> using a nonsymmetric 2×3 kernel. The maximum error was 8.88×10⁻¹⁶ in both modes, which also verifies the kernel flip. On a seeded 128×128 image with a 9×9 box kernel, my four-loop version took <strong>0.3285 s</strong>, the two-loop version <strong>0.0308 s</strong>, and SciPy <strong>0.00152 s</strong>. NumPy accelerates the inner computation; SciPy’s compiled routine was about 20 times faster than even the two-loop version.</p>
              <p>My zero padding matches SciPy’s <code>boundary="fill", fillvalue=0</code>. It keeps the image dimensions in <code>same</code> mode but treats unseen pixels as black: a box blur darkens near the frame, and a derivative may detect the frame itself. SciPy also offers symmetric and wrap boundaries; I use symmetric extension in later edge experiments to avoid that artificial response.</p>
              <p>I read my selfie in grayscale and applied B₉ₓ₉ = 1/81 at every position, then Dₓ and Dᵧ. The box smooths small details, Dₓ highlights vertical transitions, and Dᵧ horizontal ones. Mid-gray means zero in the signed derivative displays; bright and dark show opposite signs.</p>
              <Gallery columns={4} figures={[
                ['part1_1/selfie.png','Original grayscale selfie'],['part1_1/selfie_box9.png','9×9 box-filtered selfie'],['part1_1/selfie_dx.png','Selfie convolved with Dₓ'],['part1_1/selfie_dy.png','Selfie convolved with Dᵧ'],
              ]} />
            </section>

            <section id="finite-difference-operator">
              <h2>Finite Difference Operator</h2>
              <p>I convolved the cameraman with Dₓ and Dᵧ to get Iₓ and Iᵧ. The gradient magnitude at each pixel is √(Iₓ² + Iᵧ²); thresholding it gives a binary edge map. I cropped the supplied image’s uniform white matte and used symmetric boundary extension so the matte and a zero-filled frame would not become false edges.</p>
              <Gallery figures={[
                ['part1_2/cameraman.png','Cameraman after removing the white matte'],['part1_2/Ix.png','Partial derivative Iₓ'],['part1_2/Iy.png','Partial derivative Iᵧ'],['part1_2/gradient_magnitude.png','Gradient magnitude (normalized for display)'],['part1_2/edges_threshold_0.24.png','Binarized edges, threshold 0.24'],
              ]} />
              <p>I tried thresholds from 0.16 to 0.32 and selected <strong>0.24 on the unnormalized magnitude</strong>. At 0.16–0.20, grass and background texture become distracting edges. At 0.28–0.32, useful camera, face, and tripod contours begin to break. The chosen value keeps the main silhouette and horizon while suppressing most isolated background responses.</p>
              <FullFigure file="part1_2/threshold_sweep.png" label="Threshold sweep: 0.16, 0.20, 0.24, 0.28, and 0.32 on the raw gradient magnitude" />
            </section>

            <section id="derivative-of-gaussian-dog-filter">
              <h2>Derivative of Gaussian (DoG) Filter</h2>
              <p>I formed a normalized 9×9 Gaussian with σ = 1.5 by taking the outer product of <code>cv2.getGaussianKernel(9, 1.5)</code> with itself. I convolved it with Dₓ and Dᵧ to make the DoG kernels. Full convolution gives 9×11 and 11×9 filters.</p>
              <Gallery figures={[
                ['part1_3/gaussian_kernel.png','Gaussian kernel G, 9×9, σ = 1.5'],['part1_3/dog_dx.png','DoG kernel G ∗ Dₓ'],['part1_3/dog_dy.png','DoG kernel G ∗ Dᵧ'],
              ]} />
              <p>In the two-step path I blur the cameraman, then take finite differences. Compared with the unsmoothed result, the grass, sky, and clothing texture are quieter and the main contours more continuous, though slightly wider. I use a <strong>0.10 raw-magnitude threshold</strong> after smoothing: 0.08 still retains extra grass texture, while 0.10 keeps the silhouette, camera, tripod, and dome. This is lower than the unsmoothed 0.24 because smoothing reduces isolated gradient responses.</p>
              <Gallery figures={[
                ['part1_3/cameraman_blurred.png','Gaussian-smoothed cameraman'],['part1_3/smoothed_Ix.png','Blur then Dₓ: Iₓ'],['part1_3/smoothed_Iy.png','Blur then Dᵧ: Iᵧ'],['part1_3/smoothed_gradient_magnitude.png','Two-step gradient magnitude'],['part1_3/smoothed_edges_threshold_0.10.png','Two-step binary edges, threshold 0.10'],
              ]} />
              <p>Associativity gives (I ∗ G) ∗ Dₓ = I ∗ (G ∗ Dₓ), and likewise for y. I applied each precomputed DoG filter in one convolution. With one symmetric pad followed by valid convolutions in both paths, the maximum difference in either derivative was below 7.2×10⁻¹⁶; the magnitude and binary edges agree to floating-point precision.</p>
              <Gallery columns={4} figures={[
                ['part1_3/dog_Ix.png','One-step DoG Iₓ'],['part1_3/dog_Iy.png','One-step DoG Iᵧ'],['part1_3/dog_gradient_magnitude.png','One-step DoG magnitude'],['part1_3/dog_edges_threshold_0.10.png','One-step DoG edges, threshold 0.10'],
              ]} />
              <FullFigure file="part1_3/finite_difference_vs_gaussian.png" label="Finite differences versus Gaussian-smoothed differences: independently normalized magnitude displays and binary edges" />
            </section>
          </section>

          <section id="fun-with-frequencies">
            <h1>Fun with Frequencies!</h1>
            <p>Gaussian blur retains low frequencies. Subtracting that blur isolates high-frequency detail; combining frequency bands also lets me create hybrids and gradual blends.</p>

            <section id="image-sharpening">
              <h2>Image “Sharpening”</h2>
              <p>For image f and Gaussian kernel g, the high-frequency residual is h = f − f ∗ g. Adding αh gives the unsharp-mask formula below. Here δ is the identity impulse, so the right side is one convolution per channel, as used in my notebook.</p>
              <div className="equation">f + α(f − f ∗ g) = (1 + α)f − α(f ∗ g) = f ∗ [(1 + α)δ − αg]</div>
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
                <p>The Taj sweep holds the Gaussian fixed and varies α. Zero is the original; 2 is a controlled improvement; 5 brings clipped highlights and dark outlines; 10 pushes the halos toward a cartoon-like result. On the Seattle skyline I used a 13×13 Gaussian, σ = 2, and α = 5 to emphasize window grids and Space Needle supports. Atmospheric haze remains because it is broad, low-frequency contrast loss.</p>
                <Gallery columns={4} figures={[
                  ['part2_1/taj_alpha_0.png','Taj α = 0'],['part2_1/taj_alpha_2.png','Taj α = 2'],['part2_1/taj_alpha_5.png','Taj α = 5'],['part2_1/taj_alpha_10.png','Taj α = 10'],
                ]} />
                <Gallery columns={2} figures={[
                  ['part2_1/seattle_original.png','Original Seattle skyline'],['part2_1/seattle_sharpened.png','Sharpened Seattle skyline, α = 5'],
                ]} />
              </section>

              <section id="example-3-blurring-sharpening">
                <h3>Example 3: Blurring → Sharpening</h3>
                <p>I deliberately blurred a sharp roadside hawk photo with a 25×25 Gaussian (σ = 5), then sharpened it with the matching unsharp mask at α = 2. The eye, beak, breast bars, and leaf edges regain some contrast, but fine feathers and foliage stay softer than the original. α = 10 produced halos, so I kept the moderate recovery. Sharpening amplifies surviving frequencies without reversing information loss.</p>
                <Gallery figures={[
                  ['part2_1/evaluation_original.png','Original sharp roadside hawk'],['part2_1/evaluation_blurred.png','Blurred hawk, 25×25 Gaussian, σ = 5'],['part2_1/evaluation_recovered.png','Sharpened blurred hawk, α = 2'],
                ]} />
              </section>
            </section>

            <section id="hybrid-images">
              <h2>Hybrid Images</h2>
              <p>I align corresponding features, blur one image for its low-frequency layer, and add the second image’s high-frequency residual: H = G<sub>σlow</sub> ∗ A + [B − G<sub>σhigh</sub> ∗ B]. Up close the detail layer is prominent; at a distance its fine structure fades and the low-pass subject takes over. I chose cutoffs experimentally to avoid seeing both subjects at once or making the high-pass layer harsh.</p>
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
              <h3>Davy Jones + Bill Nighy</h3><p>These portraits were already aligned on the same canvas, with compatible eye positions. I kept Davy’s color low frequencies at σ = 11 and added Bill’s grayscale high-frequency residual at σ = 4. Davy’s broad face and costume read from farther away; Bill’s glasses, hair, and wrinkles appear up close without introducing a second skin color.</p>
              <Gallery figures={[
                ['part2_2/davyjones_input.png','Aligned Davy Jones input'],['part2_2/bill_input.png','Aligned Bill Nighy input'],['part2_2/davyjones_bill_hybrid.png','Davy + Bill hybrid (Davy low σ = 11; Bill high σ = 4)'],
              ]} />
              <h3>Neytiri + Zoe Saldana: full process</h3><p>This is my favorite pair. I aligned the eyes, then cropped to the common valid area so the eyes, nose, and mouth overlap. Neytiri supplies color low frequencies at σ = 14; Zoe supplies color high frequencies at σ = 4. Neytiri’s broad blue face dominates from far away, while Zoe’s eyebrows, lips, hair, and earrings emerge near the screen. A smaller low-pass σ left Neytiri’s stripes and necklace visible up close; a larger high-pass σ made Zoe noisy. Reversing the roles caused a bright necklace halo.</p>
              <Gallery columns={2} figures={[
                ['part2_2/neytiri_original.png','Neytiri original'],['part2_2/zoe_original.png','Zoe Saldana original'],
              ]} />
              <Gallery columns={2} figures={[
                ['part2_2/neytiri_aligned.png','Neytiri aligned and cropped'],['part2_2/zoe_aligned.png','Zoe aligned and cropped'],
              ]} />
              <Gallery figures={[
                ['part2_2/neytiri_low.png','Low-pass Neytiri, σ = 14'],['part2_2/zoe_high.png','High-pass Zoe, σ = 4 (signed display)'],['part2_2/neytiri_zoe_hybrid.png','Final Neytiri + Zoe hybrid'],
              ]} />
              <p>The frequency view shows the aligned inputs, their filtered layers, and the final hybrid, with each centered log-magnitude Fourier transform underneath. The low-pass spectrum concentrates near the center; Zoe’s high-pass spectrum suppresses that center and retains outer frequencies. The hybrid has both. I compute each spectrum from grayscale luminance using log(|fftshift(fft2(image))| + 10⁻¹²). Each panel below pairs an image (top) with its spectrum (bottom); click a panel for the complete figure.</p>
              <MontageColumns file="part2_2/neytiri_zoe_frequency_analysis.png" width={2215} height={888} labels={[
                'Aligned Neytiri and FFT', 'Aligned Zoe and FFT', 'Neytiri low-pass and FFT', 'Zoe high-pass and FFT', 'Hybrid and FFT',
              ]} />
            </section>

            <section id="gaussian-and-laplacian-stacks">
              <h2>Gaussian and Laplacian Stacks</h2>
              <p>I made six Gaussian levels for each apple and orange by repeatedly blurring without downsampling, so every level stays the original size. My base σ is 4, and later blur scales double. Each Laplacian level is Lᵢ = Gᵢ − Gᵢ₊₁; the final level keeps the coarsest Gaussian residual. Summing the Laplacian stack reconstructs the original (maximum error 1.11×10⁻¹⁶ in my notebook).</p>
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
              <p>I use a Gaussian stack of the mask alongside Laplacian stacks of both inputs. At level i, L<sub>blend,i</sub> = G<sub>mask,i</sub>L<sub>A,i</sub> + (1 − G<sub>mask,i</sub>)L<sub>B,i</sub>. Summing the blended levels gives the image. Blurring the mask at coarser scales spreads low-frequency transitions while retaining finer local detail near the seam.</p>
              <h3>Apple + orange</h3><p>A vertical step mask selects the apple on the left and orange on the right. The direct cut exposes a hard center seam; the six-level stack blend (base σ = 4) softens the transition. This is the oraple from the Figure 3.42 reconstruction above.</p>
              <MontageColumns file="part2_4/oraple_comparison.png" width={2909} height={603} labels={[
                'Apple input', 'Orange input', 'Vertical mask', 'Hard cut with visible seam', 'Multiresolution oraple',
              ]} />
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
              <h3>Custom blend 5: LeBron + GOAT (silhouette mask)</h3><p>I placed the goat’s head over LeBron’s with the same similarity transform for the goat photo and its matching silhouette mask (scale 0.58; target center (434, 346)). The mask follows the horns, ears, and muzzle, selecting only the head rather than the rectangular source photo. I softened its edge with σ = 2 and used six stack levels with base σ = 4. The hard composite leaves a visible cutout edge; the multiresolution blend eases the goat into the dark background while preserving the jersey and arms.</p>
              <Gallery columns={2} figures={[
                ['part2_4/lebron.png','LeBron original'],['part2_4/goat_input.png','Goat source'],['part2_4/lebron_goat_mask.png','Irregular goat-head silhouette mask'],['part2_4/lebron_goat_hard.png','Aligned goat, hard silhouette composite'],['part2_4/lebron_goat.png','Multiresolution LeBron + GOAT blend'],
              ]} />
            </section>
          </section>

          <section id="lessons">
            <h1>Lessons</h1>
            <p className="prose">
              I never really knew how Photoshop tools like sharpen, blur, or the blending
              brush actually worked. They felt like magic sliders: you drag them and the
              picture changes, and I assumed the internals were something I would never need
              to understand.
            </p>
            <p className="prose">
              This project showed me those tools are just code. Unsharp masking, hybrid faces,
              and the oraple are the same ideas as the buttons I have clicked for years,
              written out as filters I can run myself. I also finally get why the same effect
              sometimes looks amazing and sometimes looks like it is not working at all — it
              depends on the pictures you start with and how you set the tool, not on whether
              the button is broken. That is the part that stuck with me: I can open those
              effects, rebuild them, and tell when they will land.
            </p>
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
