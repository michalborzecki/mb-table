export function fillIn(inputElement: HTMLInputElement, value: string) {
  inputElement.value = value;
  inputElement.dispatchEvent(new Event('input'));
  inputElement.dispatchEvent(new Event('keyup'));
}

export function toggleCheckbox(inputElement: HTMLInputElement) {
  inputElement.dispatchEvent(new Event('change'));
}
