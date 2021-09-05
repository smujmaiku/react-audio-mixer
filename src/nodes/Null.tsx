import React, { useMemo } from 'react';
import useAudio, { BaseNodeProps, CustomNode } from '../audioContext';

export type NullNodeProps = BaseNodeProps;

export default function NullNode(props: NullNodeProps): JSX.Element | null {
	const { context } = useAudio();

	const node = useMemo(() => {
		try {
			// I'd use `new AudioNode()` if I could but gain is simple enough
			const node = context.createGain();
			node.gain.value = 1;
			return node;
		} catch (e) { }
	}, [context]);

	if (!node) return null;

	return (
		<CustomNode
			type="node"
			node={node}
			{...props}
		/>
	);
}
