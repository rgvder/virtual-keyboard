import Key from './key';
import { keyMapEntries } from './key-map-entries';

export default class Keyboard {
  constructor() {
    this.isCapslock = false;

    const savedLanguage = localStorage.getItem('savedLanguage') === 'true';
    this.isEnglish = savedLanguage ?? true;

    this.isShift = false;

    this.isCtrl = false;

    this.isAlt = false;

    this.keyboardElement = document.createElement('div');
    this.keyboardElement.classList.add('keyboard', 'capslock-false');
    this.keyboardElement.classList.add(this.isEnglish ? 'english' : 'russian');
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
      const key = new Key(config, this.keyDown.bind(this), this.keyUp.bind(this));
      wrapper.append(key.htmlElement);
    });
    this.keyboardElement.append(wrapper);

    this.textarea = document.createElement('textarea');
    this.textarea.classList.add('keyboard__textarea');
    this.keyboardElement.prepend(this.textarea);

    this.textarea.addEventListener('focus', () => {
      setTimeout(() => {
        this.textarea.selectionStart = this.textSelection.start;
        this.textarea.selectionEnd = this.textSelection.end;
      }, 0);
    });

    const info = document.createElement('div');
    info.classList.add('keyboard__info');
    this.keyboardElement.append(info);
    info.innerHTML = `<p>Операционная система Windows</p>
        <p>Комбинация для переключения языка: <span>CTRL</span> + <span>ALT</span> </p>`;
  }

  keyUp(config) {
    if (config.which === 16) {
      this.isShift = false;
      this.keyboardElement.classList.remove('shift-true');
      return;
    }

    if (!config.shiftKey) {
      this.isShift = false;
      this.keyboardElement.classList.remove('shift-true');
    }

    if (config.which === 17) {
      this.isCtrl = false;
      return;
    }

    if (config.which === 18) {
      this.isAlt = false;
    }
  }

  keyDown(config) {
    let text;

    if (config.which === 20) {
      this.isCapslock = !this.isCapslock;
      this.keyboardElement.classList.toggle('capslock-true', this.isCapslock);
      this.keyboardElement.classList.toggle('capslock-false', !this.isCapslock);
      return;
    }

    if (config.which === 13) {
      text = this.textProcessor('\n');
    }

    if (config.which === 9) {
      text = this.textProcessor('\t');
    }

    if (config.which === 16) {
      this.isShift = true;
      this.keyboardElement.classList.add('shift-true');
      return;
    }

    if (config.which === 17) {
      this.isCtrl = true;
    }

    if (config.which === 18) {
      this.isAlt = true;
    }

    if (config.which === 91) {
      return;
    }

    if (config.which === 17 || config.which === 18) {
      if (this.isAlt && this.isCtrl) {
        this.isEnglish = !this.isEnglish;
        this.keyboardElement.classList.toggle('russian', !this.isEnglish);
        this.keyboardElement.classList.toggle('english', this.isEnglish);
        localStorage.setItem('savedLanguage', this.isEnglish);
      }
      return;
    }

    if (document.activeElement.tagName === 'TEXTAREA' && config.which !== 13 && config.which !== 9) {
      this.textSelection = {
        start: this.textarea.selectionStart,
        end: this.textarea.selectionEnd,
      };
    }

    if (!text) {
      if (this.isEnglish) {
        if (this.isCapslock !== this.isShift) {
          text = this.textProcessor(config.otherKey);
        } else {
          text = this.textProcessor(config.key);
        }
      } else if (this.isCapslock !== this.isShift) {
        text = this.textProcessor(config.otherRuKey);
      } else {
        text = this.textProcessor(config.ruKey);
      }
    }

    this.textarea.value = text;
    this.textarea.selectionStart = this.textSelection.start;
    this.textarea.selectionEnd = this.textSelection.end;
  }

  textProcessor(symbol) {
    let result;
    const str = this.textarea.value;
    const { start, end } = this.textSelection;

    if (symbol === 'BACKSPACE') {
      if (!end && start === 0) {
        result = str;
      } else if (!end || end === start) {
        result = str.slice(0, start - 1) + str.slice(start);
        this.textSelection.start = start - 1;
      } else {
        result = str.slice(0, start) + str.slice(end);
        this.textSelection.start = start;
      }
    } else if (symbol === 'DEL') {
      if (start === str.length + 1) {
        result = str;
      } else if (!end || end === start) {
        result = str.slice(0, start) + str.slice(end + 1);
        this.textSelection.start = start;
      } else {
        result = str.slice(0, start) + str.slice(end);
        this.textSelection.start = start;
      }
    } else if (symbol === '\t' || symbol === '\n') {
      result = str.slice(0, start) + symbol + str.slice(end ?? start);
      this.textSelection.start = start + 2;
    } else {
      result = str.slice(0, start) + symbol + str.slice(end ?? start);
      this.textSelection.start = start + 1;
    }
    this.textSelection.end = this.textSelection.start;

    return result;
  }
}
