import { useEffect, useState } from 'react';
import useAudio from '../audioContext';

export type UseDevicesT = [MediaDeviceInfo[], boolean]

export default function useDevices(): UseDevicesT {
	const { context } = useAudio();
	const [allowed, setAllowed] = useState(false);
	const [ready, setReady] = useState(false);
	const [state, setState] = useState<MediaDeviceInfo[]>([]);

	useEffect(() => {
		if (!context) {
			setAllowed(false);
			setReady(false);
			setState([]);
			return () => { return; };
		}

		let cancel = false;

		if (!allowed) {
			navigator.mediaDevices.getUserMedia({ video: false, audio: true })
				.then(() => true, () => false)
				.then((value) => {
					if (cancel) return;
					setAllowed(value);
				});
		}

		const updateDevices = async () => {
			const list = await navigator.mediaDevices.enumerateDevices();
			if (cancel) return;

			setState(list);
		};

		navigator.mediaDevices.addEventListener('devicechange', updateDevices);
		updateDevices();

		return () => {
			cancel = true;
			navigator.mediaDevices.removeEventListener('devicechange', updateDevices);
		};
	}, [context, allowed]);

	return [state, ready];
}

export function useInputDevices(): UseDevicesT {
	const [devices, ready] = useDevices();
	const inputDevices = devices.filter(({ kind }) => kind === 'audioinput');
	return [inputDevices, ready];
}

export function useOutputDevices(): UseDevicesT {
	const [devices, ready] = useDevices();
	const outputDevices = devices.filter(({ kind }) => kind === 'audiooutput');
	return [outputDevices, ready];
}
