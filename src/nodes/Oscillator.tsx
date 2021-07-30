import React, { useEffect, useMemo, useRef } from 'react';
import useAudio, { BaseInNodeProps, CustomNode } from '../audioContext';
import useParam, { AudioParamSequence } from '../hooks/param'

export interface OscillatorNodeProps extends BaseInNodeProps {
	type?: OscillatorType;
	frequency: number;
	frequencySequence?: AudioParamSequence;
	detune?: number;
	detuneSequence?: AudioParamSequence;
	start?: number;
	end?: number;
	onEnded?: () => void;
}

export default function OscillatorNode(props: OscillatorNodeProps): JSX.Element | null {
	const {
		type = 'sine',
		frequency,
		frequencySequence,
		detune = 0,
		detuneSequence,
		start,
		end,
		onEnded,
		...baseNodeProps
	} = props;
	const { context, ready } = useAudio();

	const onEndedRef = useRef<(() => void) | undefined>(undefined);
	onEndedRef.current = onEnded;

	const node = useMemo(() => {
		if (!ready) return undefined;

		try {
			const node = context.createOscillator();

			if (start) {
				node.start(start);
			} else {
				node.start();
			}

			if (end) {
				node.stop(end);
			}

			return node;
		} catch (e) { }
	}, [ready, context, start, end]);

	useEffect(() => {
		if (!node) return;

		const handleEnded = () => {
			if (!onEndedRef.current) return;
			onEndedRef.current();
		}
		node.addEventListener('ended', handleEnded);

		return () => {
			node.removeEventListener('ended', handleEnded);
			node.stop();
		}
	}, [node]);

	useEffect(() => {
		if (!node) return;
		node.type = type;
	}, [node, type])

	useParam(node?.frequency, frequency, frequencySequence);
	useParam(node?.detune, detune, detuneSequence);

	if (!node) return null;

	return (
		<CustomNode
			type="input"
			node={node}
			{...baseNodeProps}
		/>
	);
}
