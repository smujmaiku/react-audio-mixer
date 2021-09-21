import { useEffect, useState } from "react";
import useAudio from '../audioContext';

async function getStreamClean(constraints?: MediaStreamConstraints | undefined): Promise<MediaStream | undefined> {
	try {
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		return stream;
	} catch (e) { }
	return undefined
}

export default function useStream(constraints?: MediaStreamConstraints | undefined): MediaStream | undefined {
	const { ready } = useAudio();

	const [stream, setStream] = useState<MediaStream | undefined>();

	useEffect(() => {
		setStream(undefined);

		if (!ready) return;

		let cancel = false;
		let value: MediaStream | undefined;

		const update = async () => {
			if (value?.active) return;
			value = await getStreamClean(constraints);

			if (cancel) return;
			setStream(value);
		}

		update();
		navigator.mediaDevices.addEventListener('devicechange', update);

		return () => {
			cancel = true;
			navigator.mediaDevices.removeEventListener('devicechange', update);
		};
	}, [ready, constraints]);

	return stream;
}