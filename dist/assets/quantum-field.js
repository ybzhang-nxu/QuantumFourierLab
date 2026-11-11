/** A conceptual Fourier field. This is artwork, not a quantum simulation. */
export function initQuantumField(canvas) {
  if (!canvas || !canvas.getContext) return () => {};
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastFrame = 0;
  let phase = 0;
  let visible = true;
  let disposed = false;
  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;

  // The samples are stable, so there is no visual noise between frames.
  const dust = Array.from({ length: 96 }, (_, index) => {
    const angle = index * 2.399963229728653;
    const radius = 1.35 + (Math.sin(index * 17.31) + 1) * 0.17;
    return { angle, radius, size: index % 7 === 0 ? 1.05 : 0.55 };
  });

  function project(u, v, time, rotation) {
    const wave = Math.sin(u * 3 + time * 0.36);
    const tube = 0.335 + 0.053 * Math.cos(u * 3 - time * 0.2);
    const major = 0.865 + 0.035 * Math.sin(u * 6 + v * 2);
    const twist = v + u * 2 + time * 0.1;
    let x = (major + tube * Math.cos(twist)) * Math.cos(u);
    let y = (major + tube * Math.cos(twist)) * Math.sin(u);
    let z = tube * Math.sin(twist) + 0.095 * wave;

    // Gentle oblique projection preserves the open center of the field.
    const cx = Math.cos(rotation.x);
    const sx = Math.sin(rotation.x);
    const cy = Math.cos(rotation.y);
    const sy = Math.sin(rotation.y);
    const cz = Math.cos(rotation.z);
    const sz = Math.sin(rotation.z);
    const ry = y * cx - z * sx;
    z = y * sx + z * cx;
    y = ry;
    const rx = x * cy + z * sy;
    z = -x * sy + z * cy;
    x = rx;
    const finalX = x * cz - y * sz;
    const finalY = x * sz + y * cz;
    const perspective = 3.8 / (3.8 - z);
    const scale = Math.min(width, height) * 0.345;
    return {
      x: width * 0.5 + finalX * scale * perspective,
      y: height * 0.49 + finalY * scale * perspective,
      z,
    };
  }

  function draw() {
    if (!width || !height || disposed) return;
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) * 0.345;
    const rotation = {
      x: 0.56 + tiltY * 0.12 + Math.sin(phase * 0.18) * 0.055,
      y: -0.38 + tiltX * 0.13 + Math.sin(phase * 0.12) * 0.08,
      z: -0.42 + Math.sin(phase * 0.1) * 0.025,
    };

    // Quiet orbital marks give the central sculpture scale and space.
    ctx.save();
    ctx.translate(width * 0.5, height * 0.49);
    ctx.rotate(-0.42);
    ctx.strokeStyle = 'rgba(221, 233, 199, 0.08)';
    ctx.lineWidth = 0.65;
    ctx.setLineDash([1, 8]);
    ctx.beginPath();
    ctx.ellipse(0, 0, scale * 1.43, scale * 1.2, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    dust.forEach(({ angle, radius, size }, index) => {
      const a = angle + phase * 0.012;
      const alpha = 0.13 + (index % 5) * 0.025;
      ctx.fillStyle = `rgba(221, 233, 199, ${alpha})`;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * radius * scale, Math.sin(a) * radius * scale * 0.82, size, 0, TAU);
      ctx.fill();
    });
    ctx.restore();

    const strands = [];
    const rings = width < 450 ? 42 : 58;
    const samples = 88;
    for (let ring = 0; ring < rings; ring += 1) {
      const u = (ring / rings) * TAU;
      const points = [];
      let depth = 0;
      for (let sample = 0; sample <= samples; sample += 1) {
        const point = project(u, (sample / samples) * TAU, phase, rotation);
        points.push(point);
        depth += point.z;
      }
      strands.push({ points, depth: depth / points.length, accent: ring % 11 === 0 });
    }

    // Draw far contours before near contours to make the mesh read in 3D.
    strands.sort((a, b) => a.depth - b.depth);
    for (const strand of strands) {
      const opacity = Math.max(0.11, Math.min(0.62, 0.33 + strand.depth * 0.29));
      ctx.strokeStyle = strand.accent
        ? `rgba(220, 250, 137, ${opacity + 0.11})`
        : `rgba(232, 234, 213, ${opacity})`;
      ctx.lineWidth = strand.accent ? 0.85 : 0.55;
      ctx.beginPath();
      strand.points.forEach((p, index) => {
        if (index === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // Longitudinal modes trace smooth waves through the cross-section rings.
    const modes = width < 450 ? 24 : 34;
    for (let mode = 0; mode < modes; mode += 1) {
      const v = (mode / modes) * TAU;
      for (let quarter = 0; quarter < 4; quarter += 1) {
        const points = [];
        let depth = 0;
        for (let sample = 0; sample <= 40; sample += 1) {
          const u = (quarter + sample / 40) * Math.PI * 0.5;
          const point = project(u, v, phase, rotation);
          points.push(point);
          depth += point.z;
        }
        const alpha = Math.max(0.07, 0.22 + (depth / points.length) * 0.21);
        ctx.strokeStyle = mode % 9 === 0
          ? `rgba(220, 250, 137, ${alpha + 0.12})`
          : `rgba(235, 235, 217, ${alpha})`;
        ctx.lineWidth = mode % 9 === 0 ? 0.85 : 0.45;
        ctx.beginPath();
        points.forEach((p, index) => {
          if (index === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    }

    // Selected lattice intersections, rather than arbitrary particle movement.
    for (let ring = 0; ring < 48; ring += 1) {
      for (let sample = 0; sample < 16; sample += 1) {
        const p = project((ring / 48) * TAU, (sample / 16) * TAU, phase, rotation);
        if (p.z < -0.35) continue;
        const accent = (ring + sample * 3) % 23 === 0;
        const alpha = Math.min(0.88, 0.28 + (p.z + 0.5) * 0.35);
        ctx.fillStyle = accent
          ? `rgba(220, 250, 137, ${alpha})`
          : `rgba(242, 241, 221, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, accent ? 1.45 : 0.65, 0, TAU);
        ctx.fill();
      }
    }
  }

  function animate(now) {
    frame = 0;
    if (disposed || !visible || document.hidden || reducedMotion.matches) return;
    if (!lastFrame) lastFrame = now;
    const elapsed = now - lastFrame;
    // Cap at 30 fps; this is ambient artwork, not a high-refresh interaction.
    if (elapsed >= 32) {
      phase += Math.min(elapsed, 80) * 0.00045;
      tiltX += (pointerX - tiltX) * 0.035;
      tiltY += (pointerY - tiltY) * 0.035;
      lastFrame = now;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }

  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
    if (disposed) return;
    if (reducedMotion.matches) draw();
    else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function onPointer(event) {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const rect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onLeave() {
    pointerX = 0;
    pointerY = 0;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  }, { rootMargin: '80px' });
  intersectionObserver.observe(canvas);
  canvas.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('pointerleave', onLeave, { passive: true });
  document.addEventListener('visibilitychange', resume);
  reducedMotion.addEventListener('change', resume);
  resize();
  resume();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    canvas.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', resume);
    reducedMotion.removeEventListener('change', resume);
  };
}
