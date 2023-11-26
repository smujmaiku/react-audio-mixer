import React, { useMemo } from 'react';
import useAudio, { BaseNodeProps, CustomNode } from '../audioContext';

export type NullNodeProps = BaseNodeProps;

export default function NullNode(props: NullNodeProps): JSX.Element | null {
	const { context } = useAudio();

	const node = useMemo(() => {
		try {
			// I'd use `new AudioNode()` if I could but gain is simple enough
			const nNode = context.createGain();
			nNode.gain.value = 1;
			return nNode;
		} catch (e) {
			return undefined;
		}
	}, [context]);

	if (!node) return null;

	return <CustomNode type="node" node={node} {...props} />;
}
