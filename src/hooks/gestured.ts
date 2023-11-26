import { useEffect, useState } from 'react';

let ready = false;
export const promise = new Promise((resolve) => {
	document.addEventListener('click', resolve);
	document.addEventListener('touchstart', resolve);
	document.addEventListener('keydown', resolve);
}).then(() => {
	ready = true;
});

export default function useGestured(): boolean {
	const [state, setState] = useState(ready);

	useEffect(() => {
		if (state) return;
		promise.then(() => {
			setState(true);
		});
	}, [state]);

	return state;
}
