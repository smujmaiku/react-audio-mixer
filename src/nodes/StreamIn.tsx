import React, { useEffect, useMemo } from 'react';
import useAudio, { CustomNode } from '../audioContext';

export interface StreamInNodeProps {
	name: string;
	stream: MediaProvider;
	onError?: (error: Error) => void;
}

export default function StreamInNode(props: StreamInNodeProps): JSX.Element | null {
	const { name, stream, onError } = props;
	const { context, ready } = useAudio();

	const audio = useMemo(() => new Audio(), []);

	const node = useMemo(() => {
		try {
			const node = context.createMediaElementSource(audio);
			return node;
		} catch (e) { }
	}, [context, audio]);

	useEffect(() => {
		if (!ready) return;

		audio.srcObject = stream;
		audio.pause();
	}, [audio, node, stream, ready]);

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
