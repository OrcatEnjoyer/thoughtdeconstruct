import { useEffect } from 'react';
import { CHECKPOINTS, INHALE_MS, EXHALE_MS, BREATH_PAUSE_MS, HOLD_BEFORE_CLOSE_MS } from '../data/fragments.js';

function lerp(a, b, t) { return a + (b - a) * t; }

export function useExperienceEngine(refs, fragmentsData, { onFinish }) {
  useEffect(() => {
    const {
      world, thoughtOuter, thoughtText, reframeText, experienceScreen,
      hint, hintText, breatheWrap, breatheLabel, breatheRings,
      fogLayers, continueBtn, progressFill,
      mini,
      focusBackdrop, focusCard, fragEls,
    } = Object.fromEntries(Object.entries(refs).map(([k, r]) => [k, r.current]));

    let canvasScale = 1, canvasPanX = 0, canvasPanY = 0;

    function updateCanvasTransform() {
      world.style.transform = `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasScale})`;
    }
    function resetCanvasTransform() {
      canvasScale = 1; canvasPanX = 0; canvasPanY = 0;
      updateCanvasTransform();
    }

    const fragMeta = fragmentsData.map(f => ({ def: f, currentScale: 1 }));

    let thoughtDragX = 0, thoughtDragY = 0;
    let z = 0, targetZ = 0, noticeDone = false, locked = false, raf = null;
    let stepIndex = 0, isDrifting = false, inBigPicture = false;
    let miniMood = null;
    let breathTimer = null;
    let tweenStart = 0, tweenFromZ = 0, tweenToZ = 0, tweenDuration = EXHALE_MS;
    let organized = false;

    function setMiniMood(mood) {
      if (mood === miniMood) return;
      miniMood = mood;
      mini.querySelectorAll('.mini-mood').forEach(el => {
        el.classList.toggle('active', el.classList.contains('mood-' + mood));
      });
    }

    function updateProgressDots() { progressFill.style.width = (z * 100) + '%'; }
    function showHint() { hint.classList.remove('muted'); hint.style.opacity = '1'; }
    function hideHint() { hint.style.opacity = '0'; }
    function previewHint() {
      hint.classList.add('muted');
      hint.classList.remove('no-icon');
      hintText.textContent = `In a moment, you'll breathe to step back`;
      hint.style.opacity = '1';
    }

    const RING_TARGETS = {
  expand: [
    { scale: 1.14, opacity: .6, glow: '0 0 18px rgba(0,196,179,.55)' },
    { scale: 1.28, opacity: .4, glow: '0 0 14px rgba(0,196,179,.4)' },
    { scale: 1.42, opacity: .24, glow: '0 0 10px rgba(0,196,179,.25)' },
    { scale: 1.56, opacity: .12, glow: '0 0 8px rgba(0,196,179,.15)' },
  ],
  rest: [
    { scale: 0.84, opacity: .22, glow: '0 0 0px rgba(0,196,179,0)' },
    { scale: 0.78, opacity: .14, glow: '0 0 0px rgba(0,196,179,0)' },
    { scale: 0.72, opacity: .08, glow: '0 0 0px rgba(0,196,179,0)' },
    { scale: 0.66, opacity: .04, glow: '0 0 0px rgba(0,196,179,0)' },
  ],
};
    function setRingPhase(expanding, durationMs) {
      const targets = expanding ? RING_TARGETS.expand : RING_TARGETS.rest;
      breatheRings.forEach((ring, i) => {
        ring.style.transitionDelay = (i * 110) + 'ms';
        ring.style.transitionDuration = (durationMs / 1000) + 's';
      });
      void breatheRings[0].offsetWidth;
      requestAnimationFrame(() => {
        breatheRings.forEach((ring, i) => {
          ring.style.transform = `scale(${targets[i].scale})`;
          ring.style.opacity = targets[i].opacity;
          ring.style.boxShadow = targets[i].glow;
        });
      });
    }

    function runBreathCycle() {
      if (locked || stepIndex >= CHECKPOINTS.length) return;
      breatheWrap.style.opacity = '1';
      breatheWrap.classList.remove('exhale-phase');
      breatheLabel.textContent = 'Inhale';
      setRingPhase(true, INHALE_MS);
      clearTimeout(breathTimer);
      breathTimer = setTimeout(() => {
        breatheWrap.classList.add('exhale-phase');
        breatheLabel.textContent = 'Exhale';
        setRingPhase(false, EXHALE_MS);
        beginDrift(EXHALE_MS);
      }, INHALE_MS);
    }
    function scheduleNextBreath() {
      clearTimeout(breathTimer);
      breathTimer = setTimeout(runBreathCycle, BREATH_PAUSE_MS);
    }

    function beginDrift(duration) {
      if (isDrifting || locked) return;
      if (stepIndex >= CHECKPOINTS.length) return;
      isDrifting = true;
      tweenFromZ = z;
      tweenToZ = CHECKPOINTS[stepIndex];
      tweenStart = Date.now();
      tweenDuration = duration || EXHALE_MS;
      const fog = fogLayers[stepIndex];
      if (fog) {
        const s = (tweenDuration / 1000) + 's';
        fog.style.transitionDuration = `${s}, ${s}, ${s}`;
        fog.classList.add('lifted');
      }
    }

    function render() {
      const now = Date.now();
      progressFill.style.width = (z * 100) + '%';

      const fadeProgress = z;
      const scale = lerp(1, 0.05, fadeProgress);
      const tx = lerp(0, -18, z);
      const ty = lerp(0, 8, z);
      const rot = lerp(0, -4, z);
      const idleY = Math.sin(now / 1400) * 3;
      thoughtOuter.style.transform =
        `translate(-50%,-50%) translate(${tx}vw, ${ty}vh) translate(${thoughtDragX}px, ${thoughtDragY + idleY}px) scale(${scale}) rotate(${rot}deg)`;
      thoughtOuter.style.opacity = 1 - fadeProgress;
      thoughtOuter.style.pointerEvents = fadeProgress >= 1 ? 'none' : '';

      reframeText.style.opacity = Math.min(1, Math.max(0, (z - 0.12) / 0.18));

      fragEls.forEach((el, i) => {
        if (!el) return;
        const meta = fragMeta[i];
        const def = meta.def;
        const local = Math.min(1, Math.max(0, (z - def.at) / 0.14));
        el.style.opacity = local;
        const scaleUp = lerp(0.7, 1, local);
        meta.currentScale = scaleUp;
        const swayY = (!organized && local > 0.05) ? Math.sin(now / 2200 + i * 1.7) * 4 * local : 0;
        const swayRot = (!organized && local > 0.05) ? Math.sin(now / 3000 + i) * 1.4 * local : 0;
        const rot = organized ? 0 : (def.rot + swayRot);
        el.style.transform = `translate(-50%,-50%) translate(0px, ${swayY}px) scale(${scaleUp}) rotate(${rot}deg)`;
      });

      const bgFrom = [255, 255, 255];
      const bgTo = [219, 240, 238];
      const mix = bgTo.map((c, i) => Math.round(lerp(bgFrom[i], c, z)));
      experienceScreen.style.setProperty('--experience-bg',
        `radial-gradient(120% 120% at 50% 40%, rgb(${mix.join(',')}) 0%, #F6F6F6 70%)`);
      experienceScreen.style.setProperty('--dot-alpha', Math.min(1, z / 0.5).toFixed(2));

      setMiniMood(z < 0.32 ? 'worried' : z < 0.68 ? 'neutral' : 'happy');

      thoughtText.style.color = z < 0.4
        ? `rgb(${Math.round(lerp(20, 43, z / 0.4))},${Math.round(lerp(16, 43, z / 0.4))},${Math.round(lerp(14, 43, z / 0.4))})`
        : 'var(--gray-900)';
    }

    function tick() {
      if (!locked) {
        if (isDrifting) {
          const t = Math.min(1, (Date.now() - tweenStart) / tweenDuration);
          z = tweenFromZ + (tweenToZ - tweenFromZ) * t;
          if (t >= 1) {
            z = tweenToZ;
            isDrifting = false;
            stepIndex++;
            updateProgressDots();
            if (stepIndex >= CHECKPOINTS.length) {
              breatheWrap.style.opacity = '0';
              enterBigPicture();
            } else {
              scheduleNextBreath();
            }
          }
        }
        render();
      }
      raf = requestAnimationFrame(tick);
    }

    function enterBigPicture() {
      inBigPicture = true;
      hideHint();
      resetCanvasTransform();
      organizeIntoColumns();
      experienceScreen.classList.add('pannable');
      setTimeout(() => {
        fragEls.forEach(el => el && el.classList.add('tappable'));
        hintText.textContent = 'Tap anything to look closer — drag to rearrange, pinch or scroll to explore';
        hint.classList.remove('muted');
        hint.classList.add('no-icon');
        hint.style.opacity = '1';
      }, 1000);
    }

    // Stacks each column using every card's REAL rendered height (not a
    // guessed percentage) — this is what actually prevents overlap, since
    // bubble text wraps to a different number of lines depending on what
    // the user's content happens to be.
    function organizeIntoColumns(){
      const isNarrow = window.innerWidth < 480;
      const typeToGroup = isNarrow
        ? { bubble:'a', sticky:'a', reframe:'a', photostrip:'b', polaroid:'b', receipt:'b' }
        : null;

      const groups = {};
      const order = [];
      fragMeta.forEach((meta, i) => {
        const t = typeToGroup ? typeToGroup[meta.def.type] : meta.def.type;
        if(!groups[t]){ groups[t] = []; order.push(t); }
        groups[t].push(i);
      });

      const numCols = order.length;
      const marginXPercent = isNarrow ? 6 : 10;
      const marginYPx = 24;
      const gapPx = isNarrow ? 14 : 22;
      const colWidthPercent = (100 - marginXPercent*2) / numCols;
      const worldHeight = world.clientHeight || window.innerHeight;

      order.forEach((groupKey, colIdx) => {
        const indices = groups[groupKey];
        const colLeftPercent = marginXPercent + colWidthPercent*colIdx + colWidthPercent/2;
        let runningTopPx = marginYPx;
        indices.forEach((fragIndex) => {
          const el = fragEls[fragIndex];
          if(!el) return;
          const heightPx = el.getBoundingClientRect().height || 60;
          const topPercent = (runningTopPx / worldHeight) * 100;
          el.style.transition = 'top 900ms ease, left 900ms ease';
          el.style.top = topPercent + '%';
          el.style.left = colLeftPercent + '%';
          runningTopPx += heightPx + gapPx;
        });
      });
      organized = true;
      setTimeout(() => {
        fragEls.forEach(el => { if(el) el.style.transition = ''; });
      }, 950);
    }

    function dismissBigPictureHint() {
      if (!inBigPicture) return;
      hideHint();
      continueBtn.style.opacity = '1';
      continueBtn.style.pointerEvents = 'auto';
    }
    function finishExperience() {
      if (locked) return;
      locked = true;
      closeFocus(true);
      onFinish();
    }
    continueBtn.addEventListener('click', finishExperience);

    let focusOriginEl = null, focusOriginRect = null, focusCloneEl = null, focusBaseScale = 1;
    function openFocus(hideEl, styleSourceEl, baseScale) {
      baseScale = baseScale || 1;
      const rect = styleSourceEl.getBoundingClientRect();
      const naturalW = rect.width / baseScale;
      const naturalH = rect.height / baseScale;

      focusOriginEl = hideEl;
      focusOriginRect = rect;
      focusBaseScale = baseScale;

      focusCard.innerHTML = '';
      const clone = styleSourceEl.cloneNode(true);
      clone.removeAttribute('id');
      focusCard.appendChild(clone);
      focusCloneEl = clone;

      Object.assign(focusCard.style, {
        left: rect.left + 'px', top: rect.top + 'px',
        width: naturalW + 'px', height: naturalH + 'px',
      });
      Object.assign(clone.style, {
        transformOrigin: 'top left',
        transform: `scale(${baseScale})`,
        transition: 'none',
      });

      hideEl.style.visibility = 'hidden';
      void focusCard.offsetWidth;
      focusCard.classList.add('active');
      focusBackdrop.classList.add('active');

      requestAnimationFrame(() => {
        const targetScale = Math.min(
          Math.min(420, window.innerWidth * 0.8) / naturalW,
          Math.min(300, window.innerHeight * 0.5) / naturalH,
          3.2
        );
        const targetW = naturalW * targetScale, targetH = naturalH * targetScale;
        focusCard.style.left = ((window.innerWidth - targetW) / 2) + 'px';
        focusCard.style.top = ((window.innerHeight - targetH) / 2) + 'px';
        clone.style.transition = 'transform 420ms cubic-bezier(.2,.8,.2,1)';
        clone.style.transform = `scale(${targetScale})`;
      });
    }
    function closeFocus(instant) {
      if (!focusOriginEl) return;
      if (instant) {
        focusCard.classList.remove('active');
        focusBackdrop.classList.remove('active');
        focusOriginEl.style.visibility = 'visible';
        focusOriginEl = null; focusOriginRect = null; focusCloneEl = null;
        return;
      }
      focusCard.style.left = focusOriginRect.left + 'px';
      focusCard.style.top = focusOriginRect.top + 'px';
      if (focusCloneEl) focusCloneEl.style.transform = `scale(${focusBaseScale})`;
      focusBackdrop.classList.remove('active');
      const origin = focusOriginEl;
      setTimeout(() => {
        focusCard.classList.remove('active');
        origin.style.visibility = 'visible';
      }, 420);
      focusOriginEl = null; focusOriginRect = null; focusCloneEl = null;
    }
    const onBackdropClick = () => closeFocus(false);
    const onFocusCardClick = () => closeFocus(false);
    focusBackdrop.addEventListener('click', onBackdropClick);
    focusCard.addEventListener('click', onFocusCardClick);

    let topZ = 9;
    function bringToFront(el) { topZ += 1; el.style.zIndex = topZ; }

    const dragCleanups = [];
    function wireDraggable(el, cardEl, getBaseScale) {
      let startX = 0, startY = 0, startLeft = 0, startTop = 0, moved = 0, dragging = false;
      const onDown = (e) => {
        if (!inBigPicture || focusOriginEl) return;
        el.setPointerCapture(e.pointerId);
        startX = e.clientX; startY = e.clientY;
        startLeft = el.offsetLeft; startTop = el.offsetTop;
        el.style.left = startLeft + 'px';
        el.style.top = startTop + 'px';
        moved = 0; dragging = true;
        el.classList.add('dragging');
        bringToFront(el);
        dismissBigPictureHint();
      };
      const onMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        moved = Math.hypot(dx, dy);
        el.style.left = (startLeft + dx) + 'px';
        el.style.top = (startTop + dy) + 'px';
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('dragging');
        if (moved < 6) openFocus(el, cardEl, getBaseScale());
      };
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      dragCleanups.push(() => {
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
      });
    }

    fragEls.forEach((el, i) => {
      if (!el) return;
      const cardEl = el.querySelector('.card');
      wireDraggable(el, cardEl, () => fragMeta[i].currentScale);
    });

    const onWheel = (e) => {
      if (locked || !inBigPicture) return;
      e.preventDefault();
      canvasScale = Math.min(2.2, Math.max(0.6, canvasScale - e.deltaY * 0.0012));
      updateCanvasTransform();
      dismissBigPictureHint();
    };
    experienceScreen.addEventListener('wheel', onWheel, { passive: false });

    let pinchStartDist = null, pinchStartScale = 1;
    const onTouchStart = (e) => {
      if (locked || !inBigPicture) return;
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        pinchStartDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchStartScale = canvasScale;
      }
    };
    const onTouchMove = (e) => {
      if (locked || !inBigPicture || pinchStartDist === null) return;
      if (e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        canvasScale = Math.min(2.2, Math.max(0.6, pinchStartScale * (dist / pinchStartDist)));
        updateCanvasTransform();
        dismissBigPictureHint();
      }
    };
    const onTouchEnd = () => { pinchStartDist = null; };
    experienceScreen.addEventListener('touchstart', onTouchStart, { passive: true });
    experienceScreen.addEventListener('touchmove', onTouchMove, { passive: false });
    experienceScreen.addEventListener('touchend', onTouchEnd);

    let panState = null;
    const onPanDown = (e) => {
      if (!inBigPicture || focusOriginEl) return;
      if (e.target.closest('.fragment') || e.target.closest('#thought-wrap') || e.target.closest('button')) return;
      experienceScreen.setPointerCapture(e.pointerId);
      panState = { startX: e.clientX, startY: e.clientY, startPanX: canvasPanX, startPanY: canvasPanY };
      experienceScreen.classList.add('panning');
    };
    const onPanMove = (e) => {
      if (!panState) return;
      canvasPanX = panState.startPanX + (e.clientX - panState.startX);
      canvasPanY = panState.startPanY + (e.clientY - panState.startY);
      updateCanvasTransform();
      dismissBigPictureHint();
    };
    const onPanUp = () => {
      if (panState) { panState = null; experienceScreen.classList.remove('panning'); }
    };
    experienceScreen.addEventListener('pointerdown', onPanDown);
    experienceScreen.addEventListener('pointermove', onPanMove);
    window.addEventListener('pointerup', onPanUp);

    hideHint();
    thoughtText.classList.add('noticing');
    tick();
    previewHint();
    const noticeTimer = setTimeout(() => {
      noticeDone = true;
      hideHint();
      runBreathCycle();
    }, 6500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(breathTimer);
      clearTimeout(noticeTimer);
      continueBtn.removeEventListener('click', finishExperience);
      focusBackdrop.removeEventListener('click', onBackdropClick);
      focusCard.removeEventListener('click', onFocusCardClick);
      dragCleanups.forEach(fn => fn());
      experienceScreen.removeEventListener('wheel', onWheel);
      experienceScreen.removeEventListener('touchstart', onTouchStart);
      experienceScreen.removeEventListener('touchmove', onTouchMove);
      experienceScreen.removeEventListener('touchend', onTouchEnd);
      experienceScreen.removeEventListener('pointerdown', onPanDown);
      experienceScreen.removeEventListener('pointermove', onPanMove);
      window.removeEventListener('pointerup', onPanUp);
    };
  }, []);
}