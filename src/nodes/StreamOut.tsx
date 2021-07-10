import React, { useMemo } from 'react';
import useAudio, { CustomNode } from '../audioContext';

export interface StreamOutNodeProps {
	name: string;
	connect?: string[] | string;
	stream: MediaStream;
	onError?: (error: Error) => void;
}

export default function StreamOutNode(props: StreamOutNodeProps): JSX.Element | null {
	const { name, connect, stream, onError } = props;
	const { context } = useAudio();

	const node = useMemo(() => {
		try {
			const node = context.createMediaStreamSource(stream);
			return node;
		} catch (e) { }
	}, [context, stream]);

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
