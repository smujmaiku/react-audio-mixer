import React, { useEffect, useMemo } from 'react';
import useAudio, { CustomNode } from '../audioContext';

export interface GainNodeProps {
	name: string;
	connect?: string[] | string;
	gain: number;
	onError?: (error: Error) => void;
}

export default function GainNode(props: GainNodeProps): JSX.Element | null {
	const { name, connect, gain, onError } = props;
	const { context, ready } = useAudio();

	const node = useMemo(() => {
		try {
			const node = context.createGain();
			return node;
		} catch (e) { }
	}, [context]);

	useEffect(() => {
		if (!node || !ready) return;
		node.gain.value = gain;
	}, [node, ready, gain]);

	if (!node) return null;

	return (
		<CustomNode
			name={name}
			connect={connect}
			type="node"
			node={node}
			onError={onError}
		/>
	);
}
