import { useEffect, useState } from 'react';
import Mascot, { Logo } from '../components/Mascot.jsx';

export default function Close({ onRestart }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={`screen active${revealed ? ' in' : ''}`} id="screen-close">
      <Mascot className="mooca reveal r1" src="/assets/lastscreen.png" />
      <Logo className="reveal r1" />
      <p className="quote reveal r2">"This thought is part of my story. It is not my whole story."</p>
      <p className="quote-support reveal r3">Sometimes, stepping back helps us see what we couldn't see up close.</p>
      <p className="next-step reveal r4">You can carry the thought without letting it define everything.</p>
      <button className="btn secondary reveal r5" id="btn-restart" onClick={onRestart}>Start over</button>
    </section>
  );
}