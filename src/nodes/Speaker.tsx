import React, { useEffect, useMemo } from 'react';
import useAudio, { CustomNode } from '../audioContext';
import { useOutputDevices } from '../devices';

declare global {
	// Add setSinkId for chrome
	interface HTMLAudioElement {
		setSinkId?: (id: string) => Promise<void>;
	}
}

export interface SpeakerNodeProps {
	name: string;
	connect?: string[] | string;
	deviceId?: string;
	onError?: (error: Error) => void;
}

export default function SpeakerNode(props: SpeakerNodeProps): JSX.Element | null {
	const { name, connect, deviceId, onError } = props;
	const { context, ready } = useAudio();

	const [devices] = useOutputDevices();
	const isDeviceUnknown = devices.some((row) => row.deviceId === deviceId);

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
		let cancel;

		(async () => {
			if (!audio || !ready) return;
			audio.muted = true;

			// TODO: make this work for everybody or send feedback
			if (audio.setSinkId) {
				await audio.setSinkId('');
				if (cancel || isDeviceUnknown) return;

				if (deviceId && deviceId !== 'default') {
					await audio.setSinkId(deviceId);
					if (cancel) return;
				}
			}

			audio.muted = false;
		})().catch(() => { return; });

		return () => {
			cancel = true;
		};
	}, [audio, node, deviceId, ready, isDeviceUnknown]);

	if (!node) return null;

	return (
		<CustomNode
			name={name}
			connect={connect}
			type="output"
			node={node}
			onError={onError}
		/>
	);
}
