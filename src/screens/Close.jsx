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
      <p className="quote reveal r2">"The thought was real. It was never the whole picture."</p>
      <p className="quote-support reveal r3">One thought can feel like everything when you're standing too close to it.</p>
      <p className="next-step reveal r4">If something stayed with you, maybe that's enough for now.</p>
      <button className="btn secondary reveal r5" id="btn-restart" onClick={onRestart}>Start over</button>
    </section>
  );
}