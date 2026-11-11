/** Animated conceptual artwork, not a simulation of a decoding algorithm. */
export function initDecodingFlow(element) {
  if (!element) return () => {};

  const waves = [...element.querySelectorAll('[data-wave]')];
  const samples = [...element.querySelectorAll('[data-wave-sample]')];
  const signals = [...element.querySelectorAll('[data-circuit-signal]')];
  const nodes = [...element.querySelectorAll('[data-decoder-node]')];
  const transfers = [...element.querySelectorAll('[data-transfer]')];
  const solution = element.querySelector('[data-solution-state]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let visible = false;
  let disposed = false;

  function wavePoint(position, lane, time) {
    const envelope = Math.sin(position * Math.PI) ** 1.25;
    const phase = position * Math.PI * 3.5 - time * 1.35 + lane * 0.72;
    const amplitude = 29 - lane * 3;
    return {
      x: 12 + position * 156,
      y: 68 + Math.sin(phase) * amplitude * envelope
        + Math.sin(position * Math.PI * 6 + time * 0.4) * envelope * 3,
    };
  }

  function draw(time) {
    waves.forEach((wave, lane) => {
      let path = '';
      for (let step = 0; step <= 44; step++) {
        const point = wavePoint(step / 44, lane, time);
        path += `${step ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      }
      wave.setAttribute('d', path);
    });

    samples.forEach((sample, index) => {
      const position = (time * 0.11 + 0.22 + index * 0.24) % 1;
      const point = wavePoint(position, index, time);
      sample.setAttribute('cx', point.x.toFixed(2));
      sample.setAttribute('cy', point.y.toFixed(2));
      sample.style.opacity = String(0.25 + Math.sin(position * Math.PI) * 0.75);
    });

    const positions = signals.map((signal, index) => {
      const position = (time / 5.8 + index * 0.23) % 1;
      const x = 12 + position * 156;
      signal.setAttribute('cx', x.toFixed(2));
      signal.style.opacity = String(0.3 + Math.sin(position * Math.PI) * 0.7);
      return x;
    });

    nodes.forEach((node, index) => {
      const distance = Math.abs(Number(node.getAttribute('cx')) - positions[Math.floor(index / 3)]);
      const intensity = Math.max(0, 1 - distance / 38);
      node.style.opacity = String(0.25 + intensity * 0.75);
      node.setAttribute('r', String((index === 4 ? 3.5 : 2.8) + intensity * 1.1));
    });

    transfers.forEach((dot, index) => {
      const position = (time / 3.5 + index * 0.48) % 1;
      dot.setAttribute('cx', String(2 + position * 19));
      dot.style.opacity = String(Math.sin(position * Math.PI) ** 2);
    });

    if (solution) {
      const glow = (Math.sin(time * 1.08 - 1.5) + 1) / 2;
      solution.style.textShadow = `0 0 ${5 + glow * 12}px rgba(218,250,145,${(glow * 0.25).toFixed(2)})`;
    }
  }

  function animate(now) {
    frame = 0;
    if (disposed || !visible || document.hidden || reducedMotion.matches) return;
    if (!previousTime) previousTime = now;
    const delta = now - previousTime;
    if (delta >= 40) {
      elapsed += Math.min(delta, 100) / 1000;
      previousTime = now;
      draw(elapsed);
    }
    frame = requestAnimationFrame(animate);
  }

  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (disposed) return;
    if (reducedMotion.matches) draw(0);
    else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  }, { threshold: 0.05 });
  observer.observe(element);
  document.addEventListener('visibilitychange', resume);
  reducedMotion.addEventListener('change', resume);
  draw(0);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', resume);
    reducedMotion.removeEventListener('change', resume);
  };
}
