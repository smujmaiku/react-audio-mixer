import React, { useEffect, useMemo } from 'react';
import useAudio, { BaseOutNodeProps, CustomNode } from '../audioContext';
import { useOutputDevices } from '../hooks/devices';

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
}

export default function SpeakerNode(props: SpeakerNodeProps): JSX.Element | null {
	const {
		deviceId,
		onError,
		...baseNodeProps
	} = props;
	const { context, ready } = useAudio();

	const [devices] = useOutputDevices();
	const isDeviceKnown = !deviceId || devices.some((row) => row.deviceId === deviceId);

	const audio = useMemo(() => {
		const audio = new Audio();
		audio.muted = true;
		return audio;
	}, []);

	const node = useMemo(() => {
		try {
			const node = context.createMediaStreamDestination();
			audio.srcObject = node.stream;
			return node;
		} catch (e) { }
	}, [context, audio]);

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
				onError?.(error);
			}

			if (cancel) return;
			audio.muted = false;
		}

		if (canSinkId) {
			setBySinkId();
		} else if (deviceId) {
			onError?.(new Error(SETDEVICEID_ERROR_MSG))
		} else {
			audio.muted = false;
		}

		return () => {
			cancel = true;
		};
	}, [audio, node, deviceId, ready, isDeviceKnown, onError]);

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
