import { useState, useRef, useEffect } from 'react';
import Entry from './screens/Entry.jsx';
import InputScreen from './screens/InputScreen.jsx';
import Experience from './screens/Experience.jsx';
import Close from './screens/Close.jsx';

export default function App() {
  const [screen, setScreen] = useState('entry');
  const [thought, setThought] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const intervalRef = useRef(null);

  function handleBegin() {
    setScreen('input');
    startRef.current = Date.now();
    setElapsed(0);
    setTimerRunning(true);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
  }

  function handleContinue(text) {
    setThought(text);
    setScreen('experience');
  }

  function handleFinish() {
    setScreen('close');
    setTimerRunning(false);
    clearInterval(intervalRef.current);
  }

  function handleRestart() {
    setThought('');
    setScreen('entry');
    setTimerRunning(false);
    clearInterval(intervalRef.current);
  }

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div id="app">
      {timerRunning && <div id="dev-timer" className="show">{mm}:{ss}</div>}
      {screen === 'entry' && <Entry onBegin={handleBegin} />}
      {screen === 'input' && <InputScreen onContinue={handleContinue} />}
      {screen === 'experience' && (
        <Experience thought={thought} onFinish={handleFinish} />
      )}
      {screen === 'close' && <Close onRestart={handleRestart} />}
    </div>
  );
}