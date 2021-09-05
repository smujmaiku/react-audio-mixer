import React, { useEffect, useMemo, useState } from 'react';
import useAudio, { BaseInNodeProps, CustomNode } from '../audioContext';

export interface MicrophoneNodeProps extends BaseInNodeProps {
	deviceId?: string;
	echoCancellation?: boolean;
	noiseSuppression?: boolean;
	autoGainControl?: boolean;
}

function parseDeviceId(deviceId: string | undefined): ConstrainDOMString {
	if (!deviceId || deviceId === 'default') return '';
	return { exact: deviceId };
}

export default function MicrophoneNode(props: MicrophoneNodeProps): JSX.Element | null {
	const {
		deviceId,
		echoCancellation,
		noiseSuppression,
		autoGainControl,
		...baseNodeProps
	} = props;
	const { context } = useAudio();

	const [device, setDevice] = useState<MediaStream | undefined>();
	useEffect(() => {
		let cancel = false;

		(async () => {
			const value = await navigator.mediaDevices.getUserMedia({
				audio: {
					deviceId: parseDeviceId(deviceId),
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
			type="input"
			node={node}
			{...baseNodeProps}
		/>
	);
}
