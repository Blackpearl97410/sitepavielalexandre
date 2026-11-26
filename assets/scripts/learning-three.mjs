import * as THREE from '../vendor/three/three.module.mjs';

export async function createLearningScene({ demo, toggle, steps, onFallback }) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!context) return null;
  await document.fonts.ready;
  canvas.className = 'learning-webgl';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, .1, 60);
  const assembly = new THREE.Group();
  scene.add(assembly);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa8c9c4, 2.5));
  const key = new THREE.DirectionalLight(0xfffaf0, 3.2);
  key.position.set(-5, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 8, bottom: -7, near: .5, far: 30 });
  key.shadow.bias = -.0005;
  key.shadow.normalBias = .025;
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc5e6f0, 1.5);
  fill.position.set(6, 5, -6);
  scene.add(fill);
  const teal = new THREE.MeshStandardMaterial({ color: 0x0b7f74, roughness: .3, metalness: .2 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a35c, roughness: .35, metalness: .45 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf5fcf8, roughness: .6 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x243d40, roughness: .5 });

  function rounded(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function slab(shape, depth, material) {
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .035, bevelThickness: .035, curveSegments: 10 });
    geometry.center();
    const m = new THREE.Mesh(geometry, material);
    m.rotation.x = -Math.PI / 2;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function mesh(group, geometry, material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    group.add(m); return m;
  }
  function rod(group, from, to, radius, material) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), d = b.clone().sub(a);
    const m = mesh(group, new THREE.CylinderGeometry(radius, radius, d.length(), 12), material);
    m.position.copy(a.add(b).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  function icon(index) {
    const g = new THREE.Group();
    if (index === 0) {
      for (const radius of [.52, .33, .14]) {
        const ring = mesh(g, new THREE.TorusGeometry(radius, .045, 8, 40), teal, 0, .09);
        ring.rotation.x = -Math.PI / 2;
      }
      rod(g, [0, .14, 0], [.61, .27, -.61], .035, gold);
      const arrow = mesh(g, new THREE.ConeGeometry(.11, .27, 12), gold, .61, .27, -.61);
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, .2, -1).normalize());
    } else if (index === 1) {
      const caseBody = slab(rounded(1.15, .75, .12), .22, teal);
      caseBody.position.y = .16; g.add(caseBody);
      const handle = mesh(g, new THREE.TorusGeometry(.23, .045, 8, 24, Math.PI), gold, 0, .2, -.4);
      handle.rotation.z = 0;
      rod(g, [-.55, .3, 0], [.55, .3, 0], .025, ivory);
      mesh(g, new THREE.BoxGeometry(.16, .08, .18), gold, 0, .33, .03);
    } else if (index === 2) {
      const pencil = mesh(g, new THREE.CylinderGeometry(.105, .105, 1.2, 6), teal);
      pencil.position.set(0, .16, 0);
      const direction = new THREE.Vector3(1, 0, -1).normalize();
      pencil.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      const tip = mesh(g, new THREE.ConeGeometry(.105, .28, 6), gold, .51, .16, -.51);
      tip.quaternion.copy(pencil.quaternion);
      mesh(g, new THREE.SphereGeometry(.055, 12, 8), ink, .61, .16, -.61);
      rod(g, [-.62, .055, .67], [.32, .055, .67], .025, gold);
    } else if (index === 3) {
      const shape = rounded(1.24, .85, .14);
      const bubble = slab(shape, .16, teal); bubble.position.y = .15; g.add(bubble);
      const tail = slab(new THREE.Shape([new THREE.Vector2(-.4, -.24), new THREE.Vector2(-.4, -.62), new THREE.Vector2(-.04, -.24)]), .13, teal);
      tail.position.y = .12; g.add(tail);
      for (const x of [-.3, 0, .3]) mesh(g, new THREE.SphereGeometry(.065, 12, 8), ivory, x, .28, 0);
    } else {
      const shield = new THREE.Shape();
      shield.moveTo(0, .62); shield.lineTo(.54, .39); shield.lineTo(.43, -.3);
      shield.quadraticCurveTo(.22, -.61, 0, -.72); shield.quadraticCurveTo(-.22, -.61, -.43, -.3);
      shield.lineTo(-.54, .39); shield.closePath();
      const body = slab(shield, .19, teal); body.position.y = .16; g.add(body);
      rod(g, [-.26, .3, .02], [-.06, .3, .22], .045, ivory);
      rod(g, [-.06, .3, .22], [.3, .3, -.25], .045, ivory);
    }
    g.position.y = .15;
    return g;
  }
  function labelTexture(index) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 640;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8fcfb'; ctx.fillRect(0, 0, 1024, 640);
    ctx.strokeStyle = '#d2e5df'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(24, 24, 976, 592, 38); ctx.stroke();
    ctx.fillStyle = '#55716d'; ctx.font = '500 36px Onest, sans-serif';
    ctx.fillText(String(index + 1).padStart(2, '0'), 65, 94);
    ctx.fillStyle = '#173b37'; ctx.font = '600 48px Gabarito, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText(steps[index].dataset.title, 512, 549);
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  const cards = steps.map((step, index) => {
    const group = new THREE.Group(); assembly.add(group);
    const material = new THREE.MeshStandardMaterial({ color: 0xdcece6, roughness: .4, metalness: .12 });
    group.add(slab(rounded(3.65, 2.28, .2), .17, material));
    const faceGeometry = new THREE.ShapeGeometry(rounded(3.58, 2.21, .18), 12);
    const uv = faceGeometry.attributes.uv, pos = faceGeometry.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 3.58 + .5, pos.getY(i) / 2.21 + .5);
    const faceMaterial = new THREE.MeshStandardMaterial({ map: labelTexture(index), roughness: .8 });
    const face = new THREE.Mesh(faceGeometry, faceMaterial); face.rotation.x = -Math.PI / 2;
    face.position.y = .122; face.receiveShadow = true; group.add(face);
    const symbol = icon(index); group.add(symbol);
    return { group, symbol, material, faceMaterial, emphasis: index === 0 ? 1 : 0 };
  });
  const plinth = slab(rounded(4.4, 3.3, .5), .08, new THREE.MeshStandardMaterial({ color: 0xe0ecee, roughness: .85 }));
  plinth.position.y = -.1; assembly.add(plinth);
  const grid = new THREE.GridHelper(8, 24, 0xbdd4d7, 0xcbdfe1);
  grid.position.y = -.18; grid.material.transparent = true; grid.material.opacity = .22; scene.add(grid);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(25, 25), new THREE.ShadowMaterial({ opacity: .1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.2; ground.receiveShadow = true; scene.add(ground);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let open = demo.classList.contains('is-open'), selected = 0, progress = open ? 1 : 0;
  let yaw = 0, targetYaw = 0, pitch = 0, targetPitch = 0, frame = 0, last = 0;
  let visible = true, disposed = false, width = 1, height = 1;
  const selectedColor = new THREE.Color('#c1eadb'), plainColor = new THREE.Color('#ffffff');
  const selectedBody = new THREE.Color('#7ab6a5'), plainBody = new THREE.Color('#dcece6');
  function pose() {
    cards.forEach(({ group, symbol, material, faceMaterial, emphasis }, i) => {
      group.position.set((i - 2) * -.07 * progress, .25 + (4 - i) * (.27 + progress * .83), (i - 2) * .65 * progress);
      group.position.x += .45 * progress * emphasis;
      group.position.z += .95 * progress * emphasis;
      group.rotation.y = (i - 2) * .025 * progress;
      symbol.scale.setScalar(i === 0 ? 1 : .04 + progress * .96);
      material.color.copy(plainBody).lerp(selectedBody, emphasis);
      faceMaterial.color.copy(plainColor).lerp(selectedColor, emphasis);
    });
    assembly.rotation.set(pitch, -.18 + yaw, 0);
    const viewHeight = 5.25 + progress * 3.55;
    camera.left = -viewHeight * width / height / 2; camera.right = -camera.left;
    camera.top = viewHeight / 2; camera.bottom = -camera.top;
    const target = new THREE.Vector3(0, .75 + progress * 1.55, 0);
    camera.position.copy(target).add(new THREE.Vector3(5, 8, 11)); camera.lookAt(target);
    camera.updateProjectionMatrix();
  }
  function draw(now) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = Math.min((now - (last || now)) / 1000, .05); last = now;
    const target = open ? 1 : 0;
    cards.forEach((card, i) => {
      const emphasis = i === selected ? 1 : 0;
      card.emphasis = reduced.matches ? emphasis : THREE.MathUtils.damp(card.emphasis, emphasis, 8, dt);
      if (Math.abs(card.emphasis - emphasis) < .001) card.emphasis = emphasis;
    });
    if (reduced.matches) { progress = target; yaw = 0; pitch = 0; }
    else {
      progress = THREE.MathUtils.damp(progress, target, 7, dt);
      yaw = THREE.MathUtils.damp(yaw, targetYaw, 9, dt);
      pitch = THREE.MathUtils.damp(pitch, targetPitch, 9, dt);
    }
    if (Math.abs(progress - target) < .001) progress = target;
    pose(); renderer.render(scene, camera);
    if (!reduced.matches && (Math.abs(progress - target) > .001 || Math.abs(yaw - targetYaw) > .001 || Math.abs(pitch - targetPitch) > .001 || cards.some((card, i) => card.emphasis !== (i === selected ? 1 : 0)))) frame = requestAnimationFrame(draw);
  }
  function request() {
    if (!frame && !disposed && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(draw); }
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect(); width = Math.max(bounds.width, 1); height = Math.max(bounds.height, 1);
    renderer.setSize(width, height, false); request();
  }
  function restoreFallback() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); visibilityObserver.disconnect();
    demo.classList.remove('has-webgl'); canvas.remove();
    scene.traverse(obj => { obj.geometry?.dispose(); if (obj.material) { obj.material.map?.dispose(); obj.material.dispose(); } });
    renderer.dispose();
    onFallback?.();
  }
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); restoreFallback(); });
  toggle.prepend(canvas); demo.classList.add('has-webgl');
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) request(); else { cancelAnimationFrame(frame); frame = 0; }
  }); visibilityObserver.observe(demo);
  toggle.addEventListener('pointermove', event => {
    if (reduced.matches || event.pointerType !== 'mouse') return;
    const bounds = toggle.getBoundingClientRect();
    targetYaw = ((event.clientX - bounds.left) / bounds.width - .5) * .35;
    targetPitch = ((event.clientY - bounds.top) / bounds.height - .5) * .08;
    request();
  });
  toggle.addEventListener('pointerleave', () => { targetYaw = 0; targetPitch = 0; request(); });
  reduced.addEventListener('change', request);
  document.addEventListener('visibilitychange', request);
  resize();
  // Hide the CSS model only after a successful WebGL frame.
  pose(); renderer.render(scene, camera);
  return {
    setOpen(value) { open = value; request(); },
    select(index) { selected = index; request(); },
    dispose: restoreFallback
  };
}
