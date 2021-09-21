import React, { useEffect, useMemo } from 'react';
import useAudio, { BaseInNodeProps, CustomNode } from '../audioContext';
import useStream from '../hooks/stream';

export interface MicrophoneNodeProps extends BaseInNodeProps {
	deviceId?: string;
	echoCancellation?: boolean;
	noiseSuppression?: boolean;
	autoGainControl?: boolean;
	onStream?: (stream: MediaStream | undefined) => void;
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
		onStream,
		...baseNodeProps
	} = props;
	const { context } = useAudio();

	const constraints = useMemo<MediaStreamConstraints>(() => ({
		audio: {
			deviceId: parseDeviceId(deviceId),
			echoCancellation,
			noiseSuppression,
			autoGainControl,
		}
	}), [deviceId, echoCancellation, noiseSuppression, autoGainControl])

	const stream = useStream(constraints);

	useEffect(() => {
		if (!onStream) return;
		onStream(stream);
	}, [stream, onStream]);

	const node = useMemo(() => {
		if (!stream) return;
		try {
			return context.createMediaStreamSource(stream);
		} catch (e) { }
	}, [context, stream]);

	if (!node) return null;

	return (
		<CustomNode
			type="input"
			node={node}
			{...baseNodeProps}
		/>
	);
}
