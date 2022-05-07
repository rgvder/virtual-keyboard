import { metaWhich } from './key-map-entries';

export default class Key {
  constructor(config, callbackDown, callbackUp) {
    const {
      key, ruKey, otherKey, otherRuKey, code, which, shiftKey, location, styles,
    } = config;
    this.key = key;
    this.ruKey = ruKey;
    this.otherKey = otherKey;
    this.otherRuKey = otherRuKey;
    this.code = code;
    this.which = which;
    this.shiftKey = shiftKey;
    this.location = location;
    this.styles = styles;
    this.config = config;

    this.htmlElement = this.getElement();
    this.callbackDown = callbackDown;
    this.callbackUp = callbackUp;

    this.addListeners();
  }

  getElement() {
    const item = document.createElement('div');
    item.classList.add('key');

    if (this.styles) {
      item.classList.add(...this.styles);
    }

    item.innerHTML = `
    <div class="language engKey">
    <span class="key__item item">${this.key}</span>
    <span class="key__item item_up">${this.otherKey}</span>
    </div>
    <div class="language ruKey">
    <span class="key__item item">${this.ruKey}</span>
    <span class="key__item item_up">${this.otherRuKey}</span>
    </div>`;

    return item;
  }

  addListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.which !== this.which || event.location !== this.location) {
        return;
      }

      event.preventDefault();

      this.htmlElement.classList.add('active');

      this.callbackDown({
        ...this.config, ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey,
      });
    });

    document.addEventListener('keyup', (event) => {
      this.htmlElement.classList.remove('active');

      this.callbackUp({
        ...this.config, ctrlKey: event.ctrlKey, altKey: event.altKey, shiftKey: event.shiftKey,
      });
    });

    this.htmlElement.addEventListener('mousedown', () => {
      this.htmlElement.classList.add('active');
      this.callbackDown(this.config);
    });

    this.htmlElement.addEventListener('mouseup', () => {
      this.htmlElement.classList.remove('active');
    });
  }
}
