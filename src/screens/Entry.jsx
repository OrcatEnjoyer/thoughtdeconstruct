import Mascot, { Logo } from '../components/Mascot.jsx';

export default function Entry({ onBegin }) {
  return (
    <section className="screen active" id="screen-entry">
      <Mascot className="mooca breathe" src="/assets/firstscreen.png" />
      <Logo />
      <h1 className="prompt">Need a moment?</h1>
      <p className="entry-sub">This takes about two minutes. No sign-up, no assessment — just a small pause.</p>
      <button className="btn" id="btn-start" onClick={onBegin}>Begin</button>
    </section>
  );
}