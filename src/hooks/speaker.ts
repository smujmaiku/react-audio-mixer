import { useEffect, useMemo } from 'react';
import useAudio from '../audioContext';
import { useOutputDevices } from './devices';
import useErrorCallback, { ErrorCallback } from './errorCallback'

declare global {
	// Add sinkId for Chrome
	interface HTMLMediaElement {
		sinkId: string;
		setSinkId: (id: string) => Promise<void>;
	}
}

const SETDEVICEID_ERROR_MSG = 'Cannot set deviceId as your browser does not support this feature';

export const canSinkId = ('sinkId' in HTMLMediaElement.prototype);

export default function useSpeaker(deviceId?: string, onError?: ErrorCallback): HTMLAudioElement {
	const { ready } = useAudio();

	const handleError = useErrorCallback(onError);

	const [devices] = useOutputDevices();
	const isDeviceKnown = !deviceId || devices.some((row) => row.deviceId === deviceId);

	const audio = useMemo(() => {
		const audio = new Audio();
		audio.muted = true;
		return audio;
		// Reload audio element when device is recovered
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDeviceKnown]);

	useEffect(() => () => {
		audio.muted = true;
		audio.srcObject = null;
		audio.pause();
	}, [audio]);

	useEffect(() => {
		if (!ready) return;
		audio.play();
	}, [audio, ready]);

	useEffect(() => {
		if (!audio || !ready) return;

		let cancel = false;
		audio.muted = true;

		const setBySinkId = async () => {
			if (!canSinkId) return;

			try {
				await audio.setSinkId('');
				if (cancel || !isDeviceKnown) return;

				if (deviceId && deviceId !== 'default') {
					await audio.setSinkId(deviceId);
				}
			} catch (error) {
				handleError(error);
			}

			if (cancel) return;
			audio.muted = false;
		}

		if (canSinkId) {
			setBySinkId();
		} else if (deviceId) {
			handleError(new Error(SETDEVICEID_ERROR_MSG))
		} else {
			audio.muted = false;
		}

		return () => {
			cancel = true;
		};
	}, [audio, deviceId, ready, isDeviceKnown, handleError]);

	return audio;
}
