/**
 * DialoguePanel
 * DOM-based dialogue modal matching the curated parchment/wood aesthetic.
 * Displays 128x128 character bust portraits, speaker details, 1–3 lines of narrative text,
 * interactive response choices (>=44px touch-friendly), and handles input freeze.
 */
export class DialoguePanel {
  constructor(containerEl, onOptionSelected, onDialogueStateChange) {
    this.containerEl = containerEl || document.getElementById('app-container');
    this.onOptionSelected = onOptionSelected;
    this.onDialogueStateChange = onDialogueStateChange;
    this.active = false;
    this.currentOptions = [];
    this.keydownHandler = null;

    this.createDOM();
  }

  createDOM() {
    this.element = document.createElement('div');
    this.element.id = 'dialogue-modal-container';
    this.element.innerHTML = `
      <div class="dialogue-card" role="dialog" aria-modal="true" aria-label="Percakapan">
        <div class="dialogue-portrait-pane">
          <div class="dialogue-portrait-frame">
            <img class="dialogue-portrait-img" id="dialogue-portrait" src="" alt="Potret Karakter" />
          </div>
          <div class="dialogue-affinity-badge" id="dialogue-affinity">Sahabat Lembah</div>
        </div>
        <div class="dialogue-content-pane">
          <div class="dialogue-speaker-header">
            <span class="dialogue-speaker-name" id="dialogue-speaker">Nama NPC</span>
            <span class="dialogue-speaker-title" id="dialogue-title">Gelar NPC</span>
          </div>
          <div class="dialogue-text-body" id="dialogue-text">
            Naskah percakapan akan muncul di sini.
          </div>
          <div class="dialogue-options-list" id="dialogue-options">
            <!-- Dynamic option buttons -->
          </div>
        </div>
      </div>
    `;

    this.containerEl.appendChild(this.element);

    this.portraitEl = this.element.querySelector('#dialogue-portrait');
    this.affinityEl = this.element.querySelector('#dialogue-affinity');
    this.speakerEl = this.element.querySelector('#dialogue-speaker');
    this.titleEl = this.element.querySelector('#dialogue-title');
    this.textEl = this.element.querySelector('#dialogue-text');
    this.optionsEl = this.element.querySelector('#dialogue-options');
  }

  isOpen() {
    return this.active;
  }

  show({ speaker = '', title = '', portraitUrl = '', affinityText = '', text = '', options = [] }) {
    this.speakerEl.textContent = speaker;
    this.titleEl.textContent = title;
    this.portraitEl.src = portraitUrl || 'asset/characters/portraits/joni_bust.png';
    this.affinityEl.textContent = affinityText || 'Warga Lembah';
    this.textEl.textContent = text;

    this.currentOptions = options.length > 0 ? options : [{ text: 'Lanjut [Space / E]', next: null }];
    this.renderOptions(this.currentOptions);

    this.element.classList.add('active');
    this.active = true;

    if (this.onDialogueStateChange) {
      this.onDialogueStateChange(true);
    }

    this.bindKeyboard();
  }

  renderOptions(options) {
    this.optionsEl.innerHTML = '';
    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-option-btn';
      btn.type = 'button';
      
      const keyBadge = document.createElement('span');
      keyBadge.className = 'dialogue-option-key';
      keyBadge.textContent = `${idx + 1}`;

      const textSpan = document.createElement('span');
      textSpan.textContent = opt.text;

      btn.appendChild(keyBadge);
      btn.appendChild(textSpan);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectOption(idx);
      });

      this.optionsEl.appendChild(btn);
    });
  }

  selectOption(index) {
    if (!this.active) return;
    const selected = this.currentOptions[index];
    if (this.onOptionSelected) {
      this.onOptionSelected(selected, index);
    }
  }

  bindKeyboard() {
    this.unbindKeyboard();

    this.keydownHandler = (e) => {
      if (!this.active) return;

      // Number keys 1-9
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= this.currentOptions.length) {
        e.preventDefault();
        e.stopPropagation();
        this.selectOption(keyNum - 1);
        return;
      }

      // Space or Enter or E key triggers the default/first option
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        e.stopPropagation();
        this.selectOption(0);
        return;
      }

      // Escape closes dialogue safely
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    };

    window.addEventListener('keydown', this.keydownHandler, true);
  }

  unbindKeyboard() {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler, true);
      this.keydownHandler = null;
    }
  }

  close() {
    if (!this.active) return;
    this.active = false;
    this.unbindKeyboard();
    this.element.classList.remove('active');

    if (this.onDialogueStateChange) {
      this.onDialogueStateChange(false);
    }
  }

  destroy() {
    this.close();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
