class UIResizableBox extends HTMLElement {
  static get observedAttributes() {
    return ['initial-width', 'min-width', 'max-width'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: var(--_w, 260px) 6px 1fr;
          width: 100%;
          height: 100%;
          min-height: 0;
          box-sizing: border-box;
        }
        :host([hidden]) { display: none; }

        .pane {
          min-width: 0;
          min-height: 0;
          overflow: auto;
        }

        #splitter {
          position: relative;
          cursor: col-resize;
          background: transparent;
          border-left: 1px solid var(--border, #e5e7eb);
          border-right: 1px solid var(--border, #e5e7eb);
          user-select: none;
          touch-action: none;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        #splitter::before {
          content: "";
          position: absolute;
          inset: 0 -4px;
        }

        #splitter:hover,
        #splitter:focus-visible,
        :host(.is-dragging) #splitter {
          background: var(--primary, #3b82f6);
          border-color: var(--primary, #3b82f6);
        }

        #splitter:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.35);
        }

        :host(.is-dragging) {
          cursor: col-resize;
          user-select: none;
        }
      </style>
      <div class="pane" part="left"><slot name="left"></slot></div>
      <div id="splitter" role="separator" aria-orientation="vertical" tabindex="0"></div>
      <div class="pane" part="right"><slot name="right"></slot></div>
    `;

    this._splitter = shadow.getElementById('splitter');
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this._userSet = false;
  }

  connectedCallback() {
    this._assignSlots();
    this._mo = new MutationObserver(() => this._assignSlots());
    this._mo.observe(this, { childList: true });

    this._applyInitialWidth();
    this._updateAria();

    this._splitter.addEventListener('pointerdown', this._onPointerDown);
    this._splitter.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    this._mo && this._mo.disconnect();
    this._splitter.removeEventListener('pointerdown', this._onPointerDown);
    this._splitter.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  attributeChangedCallback(name) {
    if (name === 'initial-width' && !this._userSet) {
      this._applyInitialWidth();
    }
    this._updateAria();
  }

  _assignSlots() {
    let idx = 0;
    for (const child of Array.from(this.children)) {
      if (child.slot === 'left' || child.slot === 'right') { idx++; continue; }
      if (idx === 0) child.slot = 'left';
      else if (idx === 1) child.slot = 'right';
      idx++;
    }
  }

  _applyInitialWidth() {
    const w = this.getAttribute('initial-width') || '260px';
    this.style.setProperty('--_w', w);
  }

  _minWidth() {
    const v = parseFloat(this.getAttribute('min-width'));
    return Number.isFinite(v) ? v : 80;
  }

  _maxWidth() {
    const v = parseFloat(this.getAttribute('max-width'));
    return Number.isFinite(v) ? v : Infinity;
  }

  _splitterWidth() {
    return this._splitter.getBoundingClientRect().width || 6;
  }

  _clamp(x, hostRect) {
    const splitterW = this._splitterWidth();
    const minW = this._minWidth();
    const maxW = Math.min(this._maxWidth(), Math.max(minW, hostRect.width - splitterW - minW));
    return Math.max(minW, Math.min(maxW, x));
  }

  _currentWidth() {
    const cs = getComputedStyle(this).getPropertyValue('--_w').trim();
    const px = parseFloat(cs);
    if (Number.isFinite(px)) return px;
    return this.getBoundingClientRect().width * 0.3;
  }

  _setWidth(px) {
    this.style.setProperty('--_w', px + 'px');
    this._userSet = true;
    this._updateAria(px);
  }

  _updateAria(currentPx) {
    this._splitter.setAttribute('aria-valuemin', String(this._minWidth()));
    const max = this._maxWidth();
    if (Number.isFinite(max)) {
      this._splitter.setAttribute('aria-valuemax', String(max));
    } else {
      this._splitter.removeAttribute('aria-valuemax');
    }
    const v = Number.isFinite(currentPx) ? currentPx : this._currentWidth();
    if (Number.isFinite(v)) {
      this._splitter.setAttribute('aria-valuenow', String(Math.round(v)));
    }
  }

  _onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { this._splitter.setPointerCapture(e.pointerId); } catch (_) {}
    this.classList.add('is-dragging');
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp, { once: true });
  }

  _onPointerMove(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    this._setWidth(this._clamp(x, rect));
  }

  _onPointerUp() {
    this.classList.remove('is-dragging');
    window.removeEventListener('pointermove', this._onPointerMove);
  }

  _onKeyDown(e) {
    let dir = 0;
    if (e.key === 'ArrowLeft') dir = -1;
    else if (e.key === 'ArrowRight') dir = 1;
    else if (e.key === 'Home') {
      e.preventDefault();
      this._setWidth(this._clamp(this._minWidth(), this.getBoundingClientRect()));
      return;
    } else if (e.key === 'End') {
      e.preventDefault();
      const rect = this.getBoundingClientRect();
      this._setWidth(this._clamp(rect.width - this._splitterWidth() - this._minWidth(), rect));
      return;
    } else {
      return;
    }
    e.preventDefault();
    const step = (e.shiftKey ? 32 : 8) * dir;
    const rect = this.getBoundingClientRect();
    this._setWidth(this._clamp(this._currentWidth() + step, rect));
  }
}

if (!customElements.get('ui-resizable-box')) {
  customElements.define('ui-resizable-box', UIResizableBox);
}
