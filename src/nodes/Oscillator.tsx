import React, { useEffect, useMemo, useRef } from 'react';
import useAudio, { CustomNode } from '../audioContext';
import useParam, { AudioParamSequence } from '../param'

export interface OscillatorProps {
	name: string;
	type?: OscillatorType;
	frequency: number;
	frequencySequence?: AudioParamSequence;
	detune?: number;
	detuneSequence?: AudioParamSequence;
	start?: number;
	end?: number;
	onEnded?: () => void;
	onError?: (error: Error) => void;
}

export default function OscillatorNode(props: OscillatorProps): JSX.Element | null {
	const {
		name,
		type = 'sine',
		frequency,
		frequencySequence,
		detune = 0,
		detuneSequence,
		start,
		end,
		onEnded,
		onError
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
			name={name}
			type="input"
			node={node}
			onError={onError}
		/>
	);
}
