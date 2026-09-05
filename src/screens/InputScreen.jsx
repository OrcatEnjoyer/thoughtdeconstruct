import { useState, useEffect, useRef } from 'react';

const CHIPS = ["I'm falling behind.", "I can't handle this.", "I'm not good enough."];

export default function InputScreen({ onContinue }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleContinue() {
    onContinue((value || "I'm falling behind.").trim());
  }

  return (
    <section className="screen active" id="screen-input">
      <p className="eyebrow">01 • Put the thought outside</p>
      <h1 className="prompt">Is there a thought that's been weighing on you?</h1>
      <input
        ref={inputRef}
        type="text"
        className="thought-input"
        id="thought-field"
        maxLength={60}
        placeholder="Type it here…"
        aria-label="Type the thought that's on your mind"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <div className="chip-row" id="chip-row">
        {CHIPS.map(c => (
          <button key={c} className="chip" onClick={() => setValue(c)}>{c}</button>
        ))}
      </div>
      <button className="btn" id="btn-continue" onClick={handleContinue}>Continue</button>
    </section>
  );
}