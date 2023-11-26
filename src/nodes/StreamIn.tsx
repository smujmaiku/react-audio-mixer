import React, { useEffect, useMemo } from 'react';
import useAudio, { BaseInNodeProps, CustomNode } from '../audioContext';

export interface StreamInNodeProps extends BaseInNodeProps {
	stream: MediaProvider;
}

export default function StreamInNode(
	props: StreamInNodeProps
): JSX.Element | null {
	const { stream, ...baseNodeProps } = props;
	const { context, ready } = useAudio();

	const audio = useMemo(() => new Audio(), []);

	const node = useMemo(() => {
		try {
			return context.createMediaElementSource(audio);
		} catch (e) {
			return undefined;
		}
	}, [context, audio]);

	useEffect(() => {
		if (!ready) return;

		audio.srcObject = stream;
		audio.pause();
	}, [audio, node, stream, ready]);

	if (!node) return null;

	return <CustomNode type="input" node={node} {...baseNodeProps} />;
}
