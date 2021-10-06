import React, { useEffect, useMemo } from 'react';
import useAudio, { BaseOutNodeProps, CustomNode } from '../audioContext';
import { useOutputDevices } from '../hooks/devices';
import useErrorCallback from '../hooks/errorCallback'

declare global {
	// Add sinkId for Chrome
	interface HTMLMediaElement {
		sinkId: string;
		setSinkId: (id: string) => Promise<void>;
	}
}

const SETDEVICEID_ERROR_MSG = 'Cannot set deviceId as your browser does not support this feature';

export const canSinkId = ('sinkId' in HTMLMediaElement.prototype);

export interface SpeakerNodeProps extends BaseOutNodeProps {
	deviceId?: string;
	onAudio: (audio: HTMLAudioElement) => void;
}

export default function SpeakerNode(props: SpeakerNodeProps): JSX.Element | null {
	const {
		deviceId,
		onAudio,
		onError,
		...baseNodeProps
	} = props;
	const { context, ready } = useAudio();

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

	useEffect(() => {
		if (!onAudio) return;
		onAudio(audio);
	}, [audio, onAudio]);

	useEffect(() => () => {
		audio.muted = true;
		audio.srcObject = null;
		audio.pause();
	}, [audio]);

	useEffect(() => {
		if (!ready) return;
		audio.play();
	}, [audio, ready]);

	const node = useMemo(() => {
		try {
			const node = context.createMediaStreamDestination();
			audio.srcObject = node.stream;
			return node;
		} catch (error) {
			handleError(error);
		}
	}, [context, audio, handleError]);

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
	}, [audio, node, deviceId, ready, isDeviceKnown, handleError]);

	if (!node) return null;

	return (
		<CustomNode
			type="output"
			node={node}
			onError={onError}
			{...baseNodeProps}
		/>
	);
}
