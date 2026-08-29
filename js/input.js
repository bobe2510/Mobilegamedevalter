// 鍵盤 + 觸控按鈕，統一成同一組動作旗標。
export const KEYMAP = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump',
  ArrowDown: 'down', s: 'down', S: 'down',
  j: 'attack', J: 'attack', z: 'attack', Z: 'attack',
  k: 'special', K: 'special', x: 'special', X: 'special',
  p: 'pause', P: 'pause', Escape: 'pause',
};

export class Input {
  constructor() {
    this.state = { left: 0, right: 0, jump: 0, down: 0, attack: 0, special: 0, pause: 0 };
    this.pressed = {};   // 這一幀剛按下
    this.anyPress = false;
    this._queue = [];

    addEventListener('keydown', (e) => {
      const act = KEYMAP[e.key];
      if (!act) return;
      e.preventDefault();
      if (!this.state[act]) this._queue.push(act);
      this.state[act] = 1;
      this.anyPress = true;
    }, { passive: false });

    addEventListener('keyup', (e) => {
      const act = KEYMAP[e.key];
      if (!act) return;
      e.preventDefault();
      this.state[act] = 0;
    }, { passive: false });

    // 失焦時放開所有鍵，避免角色卡住一直走
    addEventListener('blur', () => this.releaseAll());
  }

  releaseAll() {
    for (const k in this.state) this.state[k] = 0;
  }

  // 綁定畫面上的觸控按鈕（多點觸控：每顆按鈕各自追蹤 pointerId）
  bindTouch(root) {
    const btns = root.querySelectorAll('[data-act]');
    for (const btn of btns) {
      const act = btn.dataset.act;
      const down = (e) => {
        e.preventDefault();
        btn.setPointerCapture?.(e.pointerId);
        btn.classList.add('is-down');
        if (!this.state[act]) this._queue.push(act);
        this.state[act] = 1;
        this.anyPress = true;
      };
      const up = (e) => {
        e.preventDefault();
        btn.classList.remove('is-down');
        this.state[act] = 0;
      };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  // 每幀開頭呼叫：把「剛按下」的事件搬到 pressed
  beginFrame() {
    this.pressed = {};
    for (const act of this._queue) this.pressed[act] = 1;
    this._queue.length = 0;
  }

  endFrame() {
    this.anyPress = false;
  }
}
