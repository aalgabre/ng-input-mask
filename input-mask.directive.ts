import { Directive, OnInit, ElementRef, Input, HostListener } from '@angular/core';
import * as _ from 'lodash';
import { SPECIAL_CHARACTERS, ACCEPTED_CHARACTERS, overWriteCharAtPosition, KEYBOARD, MASK_CHARACTER } from "app/shared/directives/input-mask/input-mask.util";
import { maskDigitValidators, neverValidator } from "app/shared/directives/input-mask/digit-validator";

@Directive({ selector: '[input-mask]' })
export class InputMaskDirective implements OnInit {


  @Input('input-mask')
  mask = '';

  input: HTMLInputElement;
  fullFieldSelected = false;

  constructor(element: ElementRef) {
    this.input = element.nativeElement;
  }

  ngOnInit() {

  }

  @HostListener('focus', ['$event'])
  onFocus($event) {
    if (this.input.value) return;
    this.input.value = this.buildPlaceholder();
    this.setCursorToFirstPlaceholderPosition();
  }

  @HostListener('blur', ['$event'])
  onBlur($event) {
    if (_.findIndex(this.input.value, char => char === '_') !== -1) {
      this.input.value = ''
    }
  }

  @HostListener('paste', ['$event'])
  onPaste($event: ClipboardEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    const pasted = $event.clipboardData.getData('text/plain');
    this.input.value = this.handlePaste(pasted, this.mask);
    this.setCursorToFirstPlaceholderPosition();

  }

  setCursorToFirstPlaceholderPosition() {
    const firstPlacerholderPosition = _.findIndex(this.input.value, char => char === '_');
    this.input.setSelectionRange(firstPlacerholderPosition, firstPlacerholderPosition);
  }

  handlePaste(pastedText: string, mask: string): string {
    var reg = new RegExp(this.convertMaskToRegex(mask));
    if (reg.test(pastedText)) {
      return pastedText;
    }

    let value = "",
      index = 0,
      maskIndex = 0;

    _.map(this.buildPlaceholder(), (char) => {
      if (_.includes(SPECIAL_CHARACTERS, char)) {
        value += char;
      }
      if (char === '_') {
        if (this.isCharValid(pastedText[index], mask[maskIndex])) {
          value += pastedText[index]
          index++;
        }
        else {
          value += '_'
          this.input.setSelectionRange(index, index);
        }
      }
      maskIndex++;
    })
    return value;
  }

  isCharValid(char, maskChar) {
    if (!char || !maskChar) return false;
    let regex = new RegExp(this.convertMaskCharToRegex(maskChar))
    return regex.test(char)
  }

  convertMaskToRegex(mask: string) {
    let regex = "";
    _.map(mask, character => {
      if (_.includes(SPECIAL_CHARACTERS, character)) {
        regex += "\\" + _.find(SPECIAL_CHARACTERS, char => character === char)
      }
      if (_.includes(ACCEPTED_CHARACTERS, character)) {
        regex += this.convertMaskCharToRegex(character)
      }
    })
    return regex;
  }

  convertMaskCharToRegex(char) {
    switch (char) {
      case MASK_CHARACTER.NUMERIC_1:
      case MASK_CHARACTER.NUMERIC_2:
      case MASK_CHARACTER.NUMERIC_3:
      case MASK_CHARACTER.NUMERIC_4:
      case MASK_CHARACTER.NUMERIC_5:
      case MASK_CHARACTER.NUMERIC_6:
      case MASK_CHARACTER.NUMERIC_7:
      case MASK_CHARACTER.NUMERIC_8:
      case MASK_CHARACTER.NUMERIC_9:
        return "[0-9]"
      case MASK_CHARACTER.LOWERCASE:
        return "[a-z]"
      case MASK_CHARACTER.UPPERCASE:
        return "[A-Z]"
      case MASK_CHARACTER.ANY:
        return "."
    }
  }


  @HostListener('select', ['$event'])
  onSelect($event: UIEvent) {
    this.fullFieldSelected = this.input.selectionStart == 0 &&
      this.input.selectionEnd === this.input.value.length
  }

  @HostListener('keydown', ['$event', '$event.keyCode'])
  onKeyDown($event: KeyboardEvent, keyCode) {
    if ($event.metaKey || $event.ctrlKey) {
      return
    }
    if (keyCode !== KEYBOARD.TAB) {
      $event.preventDefault();
    }

    console.log(keyCode)

    const key = String.fromCharCode(keyCode);
    const cursorPos = this.input.selectionStart;

    if (this.fullFieldSelected) {
      this.input.value = this.buildPlaceholder();
      const firstPlacerholderPosition = _.findIndex(this.input.value, char => char === '_');
      this.input.setSelectionRange(firstPlacerholderPosition, firstPlacerholderPosition);
    }

    switch (keyCode) {
      case KEYBOARD.LEFT_ARROW:
        this.handleLeftArrow(cursorPos);
        return
      case KEYBOARD.RIGHT_ARROW:
        this.handleRightArrow(cursorPos);
        return
      case KEYBOARD.BACKSPACE:
        this.handleBackspace(cursorPos);
        return
      case KEYBOARD.DELETE:
        this.handleDelete(cursorPos);

    }

    const maskDigit = this.mask.charAt(cursorPos);
    const digitValidator = maskDigitValidators[maskDigit] || neverValidator;

    if (digitValidator(key)) {
      overWriteCharAtPosition(this.input, cursorPos, key);

      this.handleRightArrow(cursorPos);
    }

  }

  calculatePreviousCursorPosition(cursorPos) {
    const valueBeforeCursor = this.input.value.slice(0, cursorPos)
    return _.findLastIndex(valueBeforeCursor, char => !_.includes(SPECIAL_CHARACTERS, char))
  }

  calculateAfterCursorPosition(cursorPos) {
    const valueAfterCursor = this.input.value.slice(cursorPos + 1);
    return _.findIndex(valueAfterCursor, char => !_.includes(SPECIAL_CHARACTERS, char))
  }

  handleDelete(cursorPos) {
    const nextPos = this.calculateAfterCursorPosition(cursorPos);
    if (nextPos >= 0) {
      overWriteCharAtPosition(this.input, nextPos, '_');
      this.input.setSelectionRange(cursorPos, cursorPos);
    }

  }

  handleBackspace(cursorPos) {
    const previousPos = this.calculatePreviousCursorPosition(cursorPos);
    if (previousPos >= 0) {
      overWriteCharAtPosition(this.input, previousPos, '_');
      this.input.setSelectionRange(previousPos, previousPos);
    }
  }

  handleLeftArrow(cursorPos) {
    const previousPos = this.calculatePreviousCursorPosition(cursorPos);
    if (previousPos >= 0) {
      this.input.setSelectionRange(previousPos, previousPos);
    }
  }

  handleRightArrow(cursorPos) {
    const nextPos = this.calculateAfterCursorPosition(cursorPos);
    if (nextPos >= 0) {
      const newCursorPos = cursorPos + nextPos + 1;
      this.input.setSelectionRange(newCursorPos, newCursorPos);
    }
  }

  buildPlaceholder() {
    const chars = this.mask.split('');
    return chars.reduce((result, char) => {
      return result += _.includes(SPECIAL_CHARACTERS, char) ? char : '_';
    }, '');
  }


}