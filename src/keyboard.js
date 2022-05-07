import Key from './key';
import { keyMapEntries } from './key-map-entries';

export default class Keyboard {
  isCapslock = false;

  isEnglish = true;

  isShift = false;

  constructor() {
    this.keyboardElement = document.createElement('div');
    this.keyboardElement.classList.add('keyboard', 'english', 'capslock-false');
    document.body.append(this.keyboardElement);

    this.spanElement = document.querySelector('.key__item');

    this.keyMap = new Map(keyMapEntries);
    this.textSelection = {
      start: 0,
      end: 0,
    };
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('keyboard__wrapper');
    this.keyMap.forEach((config) => {
      const key = new Key(config, this.keyDown.bind(this));
      wrapper.append(key.htmlElement);
    });
    this.keyboardElement.append(wrapper);

    this.textarea = document.createElement('textarea');
    this.textarea.classList.add('keyboard__textarea');
    this.keyboardElement.prepend(this.textarea);
  }

  keyDown(config) {
    // document.dispatchEvent(
    //   new KeyboardEvent('keydown', config),
    // );
    if (config.which === 20) {
      this.isCapslock = !this.isCapslock;
      this.keyboardElement.classList.toggle('capslock-true', this.isCapslock);
      this.keyboardElement.classList.toggle('capslock-false', !this.isCapslock);
      return;
    }

    if (config.which === 13) {
      this.textarea.value += '\n';
      return;
    }

    if (config.which === 9) {
      this.textarea.value += '\t';
      return;
    }

    if (config.which === 16) {
      this.isShift = config.shiftKey;
      return;
    }

    if (config.which === 17 || config.which === 18) {
      if (config.altKey && config.ctrlKey) {
        this.isEnglish = !this.isEnglish;
        this.keyboardElement.classList.toggle('russian', !this.isEnglish);
        this.keyboardElement.classList.toggle('english', this.isEnglish);
      }
      return;
    }

    this.textSelection = {
      start: this.textarea.selectionStart,
      end: this.textarea.selectionEnd,
    };

    let text;

    if (this.isEnglish) {
      if (this.isCapslock) {
        text = this.textProcessor(config.otherKey);
      } else {
        text = this.textProcessor(config.key);
      }
    } else if (this.isCapslock) {
      text = this.textProcessor(config.otherRuKey);
    } else {
      text = this.textProcessor(config.ruKey);
    }
    this.textarea.value = text;
  }

  textProcessor(symbol) {
    let result;
    const str = this.textarea.value;
    const { start, end } = this.textSelection;

    console.log(str.length, start, end);

    if (str.length + 1 === start) {
      result = str + symbol;
      this.textarea.selectionStart = start + 1;
    } else if (symbol === 'Backspace') {
      if (!end || end === start) {
        result = str.slice(0, start - 1) + str.slice(start);
        this.textarea.selectionStart = start - 1;
      } else {
        result = str.slice(0, start) + str.slice(end);
        this.textarea.selectionStart = start;
      }
    } else if (symbol === 'Delete') {
      if (end === start) {
        result = str.slice(0, start) + str.slice(end + 1);
        this.textarea.selectionStart = start;
      }
    } else {
      result = str.slice(0, start) + symbol + str.slice(end ?? start);
      this.textarea.selectionStart = start + 1;
    }
    this.textarea.selectionEnd = this.textarea.selectionStart;
    return result;
  }
}
