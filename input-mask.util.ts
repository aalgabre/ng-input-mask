export const SPECIAL_CHARACTERS = [" ", "/", "(", ")", "+", "\/", "-", "."];
export const ACCEPTED_CHARACTERS = ["A", "a", "9", "*"];

export enum MASK_CHARACTER {
    NUMERIC_1 = <any>"1",
    NUMERIC_2 = <any>"2",
    NUMERIC_3 = <any>"3",
    NUMERIC_4 = <any>"4",
    NUMERIC_5 = <any>"5",
    NUMERIC_6 = <any>"6",
    NUMERIC_7 = <any>"7",
    NUMERIC_8 = <any>"8",
    NUMERIC_9 = <any>"9",
    LOWERCASE = <any>"a",
    UPPERCASE = <any>"A",
    ANY = <any>"*"
}

export const enum KEYBOARD {
    TAB = 9,
    LEFT_ARROW = 37,
    RIGHT_ARROW = 39,
    BACKSPACE = 8,
    DELETE = 46
}

export function overWriteCharAtPosition(input: HTMLInputElement, position: number, key: string) {
    const currentValue = input.value;
    input.value = currentValue.slice(0, position) + key + currentValue.slice(position + 1);
}