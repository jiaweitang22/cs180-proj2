import { useEffect, useState } from 'react';

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

function Placeholder({ caption }: { caption: string }) {
  return (
    <figure className="figure">
      <div className="placeholder-frame">Figure</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function CodeSlot({ label }: { label: string }) {
  return (
    <div className="source-code">
      <pre>
        <code>{`# ${label}`}</code>
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
            <p className="slot">Write-up</p>

            <section id="convolutions-from-scratch">
              <h2>Convolutions from Scratch</h2>
              <p className="slot">Write-up</p>
              <CodeSlot label="four-loop convolution" />
              <CodeSlot label="two-loop convolution" />
              <p className="slot">Runtime and boundary-handling comparison with scipy.signal.convolve2d</p>
              <Placeholder caption="Selfie convolved with a 9×9 box filter, Dx, and Dy" />
            </section>

            <section id="finite-difference-operator">
              <h2>Finite Difference Operator</h2>
              <p className="slot">Write-up</p>
              <Placeholder caption="Cameraman partial derivatives, gradient magnitude, and binarized edges" />
            </section>

            <section id="derivative-of-gaussian-dog-filter">
              <h2>Derivative of Gaussian (DoG) Filter</h2>
              <p className="slot">Write-up</p>
              <Placeholder caption="Gaussian-smoothed cameraman, gradient magnitude, and binarized edges" />
              <Placeholder caption="DoG filters and one-convolution vs. two-convolution comparison" />
            </section>
          </section>

          <section id="fun-with-frequencies">
            <h1>Fun with Frequencies!</h1>

            <section id="image-sharpening">
              <h2>Image “Sharpening”</h2>
              <p className="slot">Write-up</p>
              <Placeholder caption="Taj Mahal: blurred, high-frequency, and sharpened results" />

              <section id="example-1">
                <h3>Example 1</h3>
                <p className="slot">Write-up</p>
                <Placeholder caption="Sharpening example 1" />
              </section>

              <section id="example-2">
                <h3>Example 2</h3>
                <p className="slot">Write-up</p>
                <Placeholder caption="Sharpening amount sweep" />
              </section>

              <section id="example-3-blurring-sharpening">
                <h3>Example 3: Blurring → Sharpening</h3>
                <p className="slot">Write-up</p>
                <Placeholder caption="Sharp image, blurred version, and resharpened result" />
              </section>
            </section>

            <section id="hybrid-images">
              <h2>Hybrid Images</h2>
              <p className="slot">Write-up</p>
              <Placeholder caption="Hybrid 1: Derek and Nutmeg" />
              <Placeholder caption="Hybrid 2" />
              <Placeholder caption="Hybrid 3" />
              <Placeholder caption="Frequency analysis: inputs, filtered images, and hybrid FFTs" />
            </section>

            <section id="gaussian-and-laplacian-stacks">
              <h2>Gaussian and Laplacian Stacks</h2>
              <p className="slot">Write-up</p>
              <Placeholder caption="Apple and orange Gaussian / Laplacian stacks, Szeliski Figure 3.42 (a)–(l)" />
            </section>

            <section id="multiresolution-blending">
              <h2>Multiresolution Blending (a.k.a. the oraple!)</h2>
              <p className="slot">Write-up</p>
              <Placeholder caption="Oraple (vertical / horizontal seam)" />
              <Placeholder caption="Custom blend 1" />
              <Placeholder caption="Custom blend 2 with an irregular mask" />
              <Placeholder caption="Favorite blend process: masks and Laplacian stack" />
            </section>
          </section>

          <section id="lessons">
            <h1>Lessons</h1>
            <p className="slot">The most important thing learned from this project</p>
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
