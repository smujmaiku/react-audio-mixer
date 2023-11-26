import React, { useMemo } from 'react';
import useAudio, { BaseOutNodeProps, CustomNode } from '../audioContext';
import useSpeaker from '../hooks/speaker';
import useErrorCallback from '../hooks/errorCallback';

export interface SpeakerNodeProps extends BaseOutNodeProps {
	deviceId?: string;
}

export default function SpeakerNode(
	props: SpeakerNodeProps
): JSX.Element | null {
	const { deviceId, onError, ...baseNodeProps } = props;
	const { context } = useAudio();

	const handleError = useErrorCallback(onError);

	const audio = useSpeaker({ deviceId, onError });

	const node = useMemo(() => {
		try {
			const sNode = context.createMediaStreamDestination();
			audio.srcObject = sNode.stream;
			return sNode;
		} catch (error) {
			handleError(error);
			return undefined;
		}
	}, [context, audio, handleError]);

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
