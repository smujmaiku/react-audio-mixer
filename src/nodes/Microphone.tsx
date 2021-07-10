import React, { useEffect, useMemo, useState } from 'react';
import useAudio, { CustomNode } from '../audioContext';

export interface MicrophoneNodeProps {
	name: string;
	deviceId?: string;
	echoCancellation?: boolean;
	noiseSuppression?: boolean;
	autoGainControl?: boolean;
	onError?: (error: Error) => void;
}

export default function MicrophoneNode(props: MicrophoneNodeProps): JSX.Element | null {
	const {
		name,
		deviceId,
		echoCancellation,
		noiseSuppression,
		autoGainControl,
		onError,
	} = props;
	const { context } = useAudio();

	const [device, setDevice] = useState<MediaStream | undefined>();
	useEffect(() => {
		let cancel = false;

		(async () => {
			const value = await navigator.mediaDevices.getUserMedia({
				audio: {
					deviceId: !deviceId || deviceId === 'default' ? deviceId : { exact: deviceId },
					echoCancellation,
					noiseSuppression,
					autoGainControl,
				},
			});
			if (cancel) return;
			setDevice(value);
		})().catch(() => {
			if (cancel) return;
			setDevice(undefined);
		});

		return () => {
			cancel = true;
		};
	}, [deviceId, echoCancellation, noiseSuppression, autoGainControl]);

	const node = useMemo(() => {
		if (!device) return;
		try {
			return context.createMediaStreamSource(device);
		} catch (e) { }
	}, [context, device]);

	if (!node) return null;

	return (
		<CustomNode
			name={name}
			type="input"
			node={node}
			onError={onError}
		/>
	);
}
