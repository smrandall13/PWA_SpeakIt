// My Config
export function MyButton(props = {}) {
	const element = document.createElement('div');
	element.textContent = props.text || 'Button';
	element.classList.add('app-button');
	if (props.className) {
		element.classList.add(props.className);
	}
	if (props.styles) {
		element.style.cssText = props.styles;
	}

	return element;
}
