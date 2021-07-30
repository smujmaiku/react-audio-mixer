import React, { useMemo } from 'react';
import useAudio, { BaseOutNodeProps, CustomNode } from '../audioContext';

export interface StreamOutNodeProps extends BaseOutNodeProps {
	stream: MediaStream;
}

export default function StreamOutNode(props: StreamOutNodeProps): JSX.Element | null {
	const {
		stream,
		...baseNodeProps
	} = props;
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
			type="output"
			node={node}
			{...baseNodeProps}
		/>
	);
}
