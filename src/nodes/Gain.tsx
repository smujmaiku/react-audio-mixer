import React, { useMemo } from 'react';
import useAudio, { CustomNode } from '../audioContext';
import useParam, { AudioParamSequence } from '../param';

export interface GainNodeProps {
	name: string;
	connect?: string[] | string;
	gain: number;
	gainSequence?: AudioParamSequence
	onError?: (error: Error) => void;
}

export default function GainNode(props: GainNodeProps): JSX.Element | null {
	const {
		name,
		connect,
		gain,
		gainSequence,
		onError,
	} = props;
	const { context } = useAudio();

	const node = useMemo(() => {
		try {
			const node = context.createGain();
			return node;
		} catch (e) { }
	}, [context]);

	useParam(node?.gain, gain, gainSequence);

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
