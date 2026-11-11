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
  let orbitX = 0;
  let orbitY = 0;
  let targetOrbitX = 0;
  let targetOrbitY = 0;
  let drag = null;
  let suppressClick = false;
  let lastPointerType = 'mouse';
  let pulseAge = Infinity;
  let pulseOrigin = 0;
  let lastHoverPulsePoint = null;
  let hitRings = [];
  const pulseDuration = 1.65;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function pulseAt(u) {
    if (pulseAge >= pulseDuration) return 0;
    const progress = pulseAge / pulseDuration;
    const distance = Math.abs(Math.atan2(Math.sin(u - pulseOrigin), Math.cos(u - pulseOrigin)));
    const front = progress * Math.PI;
    const envelope = (1 - progress) ** 1.35;
    return Math.exp(-Math.pow((distance - front) / 0.23, 2)) * envelope;
  }

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
      x: 0.56 + orbitX - tiltY * 0.34 + Math.sin(phase * 0.18) * 0.055,
      y: -0.38 + orbitY + tiltX * 0.5 + Math.sin(phase * 0.12) * 0.08,
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
      strands.push({ u, points, depth: depth / points.length, accent: ring % 11 === 0 });
    }
    hitRings = strands;

    // Draw far contours before near contours to make the mesh read in 3D.
    strands.sort((a, b) => a.depth - b.depth);
    for (const strand of strands) {
      const opacity = Math.max(0.11, Math.min(0.62, 0.33 + strand.depth * 0.29));
      const pulse = pulseAt(strand.u);
      ctx.strokeStyle = strand.accent || pulse > 0.01
        ? `rgba(220, 250, 137, ${Math.min(0.98, opacity + 0.11 + pulse * 0.6)})`
        : `rgba(232, 234, 213, ${opacity})`;
      ctx.lineWidth = (strand.accent ? 0.85 : 0.55) + pulse * 1.35;
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
      const u = (ring / 48) * TAU;
      const pulse = pulseAt(u);
      for (let sample = 0; sample < 16; sample += 1) {
        const p = project(u, (sample / 16) * TAU, phase, rotation);
        if (p.z < -0.35) continue;
        const accent = (ring + sample * 3) % 23 === 0;
        const alpha = Math.min(0.98, 0.28 + (p.z + 0.5) * 0.35 + pulse * 0.5);
        ctx.fillStyle = accent || pulse > 0.1
          ? `rgba(220, 250, 137, ${alpha})`
          : `rgba(242, 241, 221, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (accent ? 1.45 : 0.65) + pulse * 1.1, 0, TAU);
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
      const delta = Math.min(elapsed, 80);
      const follow = 1 - Math.exp(-delta / 130);
      const rotate = 1 - Math.exp(-delta / (drag ? 70 : 110));
      phase += delta * 0.00045;
      if (pulseAge < pulseDuration) pulseAge += delta / 1000;
      tiltX += (pointerX - tiltX) * follow;
      tiltY += (pointerY - tiltY) * follow;
      orbitX += (targetOrbitX - orbitX) * rotate;
      orbitY += (targetOrbitY - orbitY) * rotate;
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
    if (reducedMotion.matches) {
      // Explicit drag/key input changes the static view without interpolation.
      tiltX = 0;
      tiltY = 0;
      orbitX = targetOrbitX;
      orbitY = targetOrbitY;
      draw();
    }
    else if (visible && !document.hidden) frame = requestAnimationFrame(animate);
  }

  function renderInteraction() {
    if (reducedMotion.matches) {
      orbitX = targetOrbitX;
      orbitY = targetOrbitY;
      tiltX = 0;
      tiltY = 0;
      draw();
    } else if (!frame) resume();
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

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointerY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
  }

  function onPointer(event) {
    if (event.pointerType === 'touch') return;
    if (drag && event.pointerId === drag.id) {
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      const alreadyMoved = drag.moved;
      if (Math.hypot(dx, dy) > 5) drag.moved = true;
      if (drag.moved) {
        if (!alreadyMoved) {
          orbitX = drag.orbitX;
          orbitY = drag.orbitY;
          pointerX = pointerY = tiltX = tiltY = 0;
        }
        targetOrbitY = drag.orbitY + dx * 0.008;
        targetOrbitX = clamp(drag.orbitX - dy * 0.006, -1.35, 1.35);
        renderInteraction();
      }
      return;
    }
    if (reducedMotion.matches) return;
    updatePointer(event);
    maybeHoverPulse(event);
  }

  function onPointerEnter(event) {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    updatePointer(event);
    maybeHoverPulse(event, true);
  }

  function onPointerDown(event) {
    lastPointerType = event.pointerType;
    // Touch keeps native vertical scrolling and the ambient visualization.
    if (event.pointerType === 'touch' || event.button !== 0 || event.isPrimary === false || drag) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    suppressClick = false;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      orbitX,
      orbitY,
      moved: false,
    };
    canvas.dataset.dragging = 'true';
    // Preserve the visible hover tilt when a press becomes an actual drag.
    if (!reducedMotion.matches) {
      drag.orbitX -= tiltY * 0.34;
      drag.orbitY += tiltX * 0.5;
    }
    canvas.setPointerCapture(event.pointerId);
  }

  function finishDrag(event, cancelled = false) {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.id)) return;
    const pointerId = drag.id;
    suppressClick = drag.moved || cancelled;
    if (drag.moved || cancelled) {
      pointerX = 0;
      pointerY = 0;
    }
    drag = null;
    delete canvas.dataset.dragging;
    if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
  }

  function onPointerUp(event) {
    finishDrag(event);
  }

  function onPointerCancel(event) {
    finishDrag(event, true);
  }

  function triggerPulse(event) {
    pulseOrigin = 0;
    if (event && Number.isFinite(event.clientX)) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let nearest = Infinity;
      for (const ring of hitRings) {
        for (const point of ring.points) {
          const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
          if (distance < nearest) {
            nearest = distance;
            pulseOrigin = ring.u;
          }
        }
      }
    }
    // With reduced motion this remains a still highlight, without a traveling wave.
    pulseAge = 0;
    renderInteraction();
  }

  function maybeHoverPulse(event, entering = false) {
    if (drag || event.buttons || !visible || document.hidden || reducedMotion.matches) return;
    // Share one wave with click/keyboard input. Let it fade completely before
    // another hover can launch it, so frequent pointer events never stack or reset it.
    if (pulseAge < pulseDuration) return;
    if (!entering && lastHoverPulsePoint
      && Math.hypot(event.clientX - lastHoverPulsePoint.x, event.clientY - lastHoverPulsePoint.y) < 28) return;
    lastHoverPulsePoint = { x: event.clientX, y: event.clientY };
    triggerPulse(event);
  }

  function onClick(event) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (event.pointerType === 'touch' || (event.detail > 0 && lastPointerType === 'touch')) return;
    triggerPulse(event.detail > 0 ? event : undefined);
  }

  function onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = 0.22;
    switch (event.key) {
      case 'ArrowLeft': targetOrbitY -= step; break;
      case 'ArrowRight': targetOrbitY += step; break;
      case 'ArrowUp': targetOrbitX = clamp(targetOrbitX - step, -1.35, 1.35); break;
      case 'ArrowDown': targetOrbitX = clamp(targetOrbitX + step, -1.35, 1.35); break;
      case 'Home':
        targetOrbitX = targetOrbitY = pointerX = pointerY = 0;
        pulseAge = Infinity;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (!event.repeat) triggerPulse();
        return;
      default: return;
    }
    event.preventDefault();
    renderInteraction();
  }

  function onLeave() {
    lastHoverPulsePoint = null;
    if (drag) return;
    pointerX = 0;
    pointerY = 0;
  }

  function onVisibilityChange() {
    if (document.hidden) finishDrag(undefined, true);
    resume();
  }

  function onWindowBlur() {
    finishDrag(undefined, true);
    onLeave();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  }, { rootMargin: '80px' });
  intersectionObserver.observe(canvas);
  canvas.addEventListener('pointerenter', onPointerEnter, { passive: true });
  canvas.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('pointerleave', onLeave, { passive: true });
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('lostpointercapture', onPointerCancel);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('keydown', onKeyDown);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', resume);
  resize();
  resume();

  return () => {
    disposed = true;
    finishDrag(undefined, true);
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    canvas.removeEventListener('pointerenter', onPointerEnter);
    canvas.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('pointerleave', onLeave);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerCancel);
    canvas.removeEventListener('lostpointercapture', onPointerCancel);
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('blur', onWindowBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.removeEventListener('change', resume);
  };
}
