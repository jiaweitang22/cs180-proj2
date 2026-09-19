import * as katex from 'katex';

export default function Math({ tex, display = false }: { tex: string; display?: boolean }) {
  const markup = { __html: katex.renderToString(tex, { displayMode: display, output: 'htmlAndMathml', throwOnError: true }) };
  return display
    ? <div className="math-block" dangerouslySetInnerHTML={markup} />
    : <span className="math-inline" dangerouslySetInnerHTML={markup} />;
}
