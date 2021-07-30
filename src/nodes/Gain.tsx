import React, { useMemo } from 'react';
import useAudio, { BaseNodeProps, CustomNode } from '../audioContext';
import useParam, { AudioParamSequence } from '../hooks/param';

export interface GainNodeProps extends BaseNodeProps {
	gain: number;
	gainSequence?: AudioParamSequence
}

export default function GainNode(props: GainNodeProps): JSX.Element | null {
	const {
		gain,
		gainSequence,
		...baseNodeProps
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
			type="node"
			node={node}
			{...baseNodeProps}
		/>
	);
}
