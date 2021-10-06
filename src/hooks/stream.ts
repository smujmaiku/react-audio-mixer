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

	const [state, setState] = useState<MediaStream | undefined>();

	useEffect(() => {
		setState(undefined);

		if (!ready) return;

		let cancel = false;
		let stream: MediaStream | undefined;

		const update = async () => {
			if (stream?.active) return;

			const res = await getStreamClean(constraints);

			// Prevent rapid events setting state
			if (cancel || stream?.active) return;

			stream = res;
			setState(stream);
		}

		update();
		navigator.mediaDevices.addEventListener('devicechange', update);

		return () => {
			cancel = true;
			navigator.mediaDevices.removeEventListener('devicechange', update);
		};
	}, [ready, constraints]);

	return state;
}
