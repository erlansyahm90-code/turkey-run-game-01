// Dinner Table Dash — input. Keyboard and mouse, held state plus one-shot presses.
// Arrows / WASD steer and jump; SHIFT, S or ArrowDown dash (a double-tap of W / ArrowUp
// dashes too); the mouse steers by its position across the window, a click jumps and a
// right-click dashes (a two-finger touch dashes). Enter and clicks also drive the title
// and end screens (wired in main.js).

const held = new Set();
const pressed = new Set();
let mouseX = null;      // -1..1 across the window, or null when the mouse has not moved
let mouseJump = false;
let lastJumpKeyAt = -1e9; // for the double-tap-W dash: when W / ArrowUp was last freshly pressed

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  ShiftLeft: 'dash', ShiftRight: 'dash', ArrowDown: 'dash', KeyS: 'dash',
  Enter: 'confirm',
  KeyP: 'pause', Escape: 'pause',
};

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    const action = KEYMAP[e.code];
    if (!action) return;
    if (action === 'left' || action === 'right' || action === 'jump' || action === 'dash') e.preventDefault();
    if (!held.has(action)) {
      pressed.add(action);
      // Double-tap W / ArrowUp: a second fresh jump-key press within 0.5 s also dashes
      // (the Windows double-click standard — generous enough for slow devices too).
      if (action === 'jump' && (e.code === 'KeyW' || e.code === 'ArrowUp')) {
        const now = performance.now();
        if (now - lastJumpKeyAt < 500) pressed.add('dash');
        lastJumpKeyAt = now;
      }
    }
    held.add(action);
  });
  window.addEventListener('keyup', (e) => {
    const action = KEYMAP[e.code];
    if (action) held.delete(action);
  });
  window.addEventListener('blur', () => held.clear());
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  });
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) { pressed.add('dash'); return; }
    mouseJump = true; pressed.add('jump');
  });
  canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); pressed.add('dash'); });
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t) mouseX = (t.clientX / window.innerWidth) * 2 - 1;
    if (e.touches.length >= 2) { pressed.add('dash'); return; }
    mouseJump = true;
    pressed.add('jump');
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t) mouseX = (t.clientX / window.innerWidth) * 2 - 1;
  }, { passive: true });
}

/** Steering for this frame: -1 (hard left) .. 1 (hard right). Keys win over the mouse. */
export function steerInput() {
  let steer = 0;
  if (held.has('left')) steer -= 1;
  if (held.has('right')) steer += 1;
  if (steer === 0 && mouseX !== null) steer = Math.max(-1, Math.min(1, mouseX * 1.15));
  return steer;
}

export function jumpHeld() {
  return held.has('jump');
}

/** One-shot presses since the last call: drains the queue. */
export function takePresses() {
  const out = new Set(pressed);
  pressed.clear();
  mouseJump = false;
  return out;
}
