import { useRef } from 'react';
import { fragments } from '../data/fragments.js';
import FragmentCard from './FragmentCard.jsx';
import MiniMascot from '../components/MiniMascot.jsx';
import { useExperienceEngine } from '../hooks/useExperienceEngine.js';

export default function Experience({ thought, onFinish }) {
  const liveFragments = fragments.map(f => (f.isReframeCard ? { ...f, text: thought } : f));

  const world = useRef(null);
  const thoughtOuter = useRef(null);
  const thoughtText = useRef(null);
  const reframeText = useRef(null);
  const experienceScreen = useRef(null);
  const hint = useRef(null);
  const hintText = useRef(null);
  const breatheWrap = useRef(null);
  const breatheLabel = useRef(null);
  const progressFill = useRef(null);
  const mini = useRef(null);
  const focusBackdrop = useRef(null);
  const focusCard = useRef(null);
  const continueBtn = useRef(null);

  const breatheRings = useRef([]);
  const fogLayers = useRef([]);
  const fragEls = useRef([]);

  useExperienceEngine(
    {
      world, thoughtOuter, thoughtText, reframeText, experienceScreen,
      hint, hintText, breatheWrap, breatheLabel, breatheRings,
      fogLayers, continueBtn, progressFill,
      mini,
      focusBackdrop, focusCard, fragEls,
    },
    liveFragments,
    { onFinish }
  );

  return (
    <section className="screen active" id="screen-experience" ref={experienceScreen}>


      {[0, 1, 2].map(i => (
        <div key={i} id={`fog-${i + 1}`} className="fog-layer" ref={el => (fogLayers.current[i] = el)} />
      ))}

      <div id="progress-track" aria-hidden="true">
        <div id="progress-fill" ref={progressFill} />
      </div>

      <div id="world" ref={world}>
        <div id="thought-wrap" ref={thoughtOuter}>
          <div id="thought-card-inner">
            <div id="reframe-text" ref={reframeText}>I'm having the thought that…</div>
            <div id="thought-text" ref={thoughtText}>{thought}</div>
          </div>
        </div>

        {liveFragments.map((f, i) => (
          <div
            key={i}
            className={`fragment${f.tone ? ' tone-' + f.tone : ''}`}
            style={{ top: f.top + '%', left: f.left + '%' }}
            ref={el => (fragEls.current[i] = el)}
          >
            <FragmentCard f={f} />
          </div>
        ))}
      </div>

      <MiniMascot rootRef={mini} />

      <div id="hint" ref={hint}>
        <span id="hint-text" ref={hintText}>In a moment, you'll be able to breathe to step back</span>
      </div>

      <div id="breathe-wrap" ref={breatheWrap}>
        {[4, 3, 2, 1].map(n => (
          <div key={n} id={`breathe-ring-${n}`} className="breathe-ring" ref={el => (breatheRings.current[n - 1] = el)} />
        ))}
        <div id="breathe-core">
          <span id="breathe-label" ref={breatheLabel}>Inhale</span>
        </div>
      </div>

      <button id="continue-btn" className="btn secondary" ref={continueBtn}>Continue</button>
      <div id="focus-backdrop" ref={focusBackdrop} />
      <div id="focus-card" ref={focusCard} />
    </section>
  );
}