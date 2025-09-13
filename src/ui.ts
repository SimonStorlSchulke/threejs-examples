const ui = document.querySelector('#ui-elements')!;

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

export function addButton(name: string, callback: () => void) {
  const button = document.createElement('button');
  button.innerText = name;
  button.onclick = callback;
  ui.append(button);
}

export function addSlider(name: string, min: number, max: number, value: number, callback: (value: number) => void, type: 'range' | 'number' = 'range', isInt = false) {
  const input = document.createElement('input');
  input.setAttribute('type', type);
  input.setAttribute('min', min.toString());
  input.setAttribute('min', min.toString());
  input.setAttribute('max', max.toString());
  input.setAttribute('step', isInt ? '1' : '0.001');
  input.setAttribute('value', value.toString());
  input.id = name;
  input.setAttribute('name', name);
  let label = `${name} ${value.toString()}`;

  const debouncedCallback = debounce((val: string) => {
    label = `${name} ${val}`;
    callback(+val);
    ui.querySelector(`#label-${name}`)!.innerHTML = label;
  },
    20);


  input.addEventListener("input", (event) => {
    debouncedCallback((event.target as HTMLInputElement).value);
  });
  ui.append(formGroup(name, input));
  ui.querySelector(`#label-${name}`)!.innerHTML = label;
}


function formGroup(label: string, inputElement: HTMLElement) {
  const container = document.createElement('div');
  container.classList.add('form-group');
  const labelElement = document.createElement('label');
  labelElement.id = "label-" + label;
  labelElement.setAttribute('for', label);
  labelElement.innerText = label;
  container.append(labelElement, inputElement);
  return container;
}
