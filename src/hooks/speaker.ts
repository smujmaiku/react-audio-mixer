import { useEffect, useMemo, useRef } from 'react';
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

export interface UseSpeakerOptions {
	deviceId?: string;
	onError?: ErrorCallback;
}

export default function useSpeaker(deviceId?: string): HTMLAudioElement;
export default function useSpeaker(options: UseSpeakerOptions): HTMLAudioElement;
export default function useSpeaker(options?: string | UseSpeakerOptions): HTMLAudioElement {
	let opts: UseSpeakerOptions = {};
	if (typeof options === 'string') {
		opts.deviceId = options;
	} else if (options) {
		opts = options;
	}
	const { deviceId, onError } = opts;

	const { ready } = useAudio();

	const handleError = useErrorCallback(onError);

	const [devices] = useOutputDevices();
	const isDeviceKnown = !deviceId || devices.some((row) => row.deviceId === deviceId);

	const audio = useMemo(() => {
		const audio = new Audio();
		audio.muted = true;
		audio.autoplay = isDeviceKnown;
		return audio;
		// Reload audio element when device is recovered
	}, [isDeviceKnown]);

	useEffect(() => () => {
		audio.muted = true;
		audio.srcObject = null;
		audio.pause();
	}, [audio]);

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
