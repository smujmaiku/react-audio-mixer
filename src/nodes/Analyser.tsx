import React, { useEffect, useMemo } from 'react';
import useAudio, { CustomNode, FFT_MIN } from '../audioContext';

export interface AnalyserNodeProps {
	name: string;
	connect?: string[] | string;
	fftSize?: number;
	interval?: number;
	onUpdate: (data: Float32Array) => void;
	onError?: (error: Error) => void;
}

export default function AnalyserNode(props: AnalyserNodeProps): JSX.Element | null {
	const {
		name,
		connect,
		fftSize = FFT_MIN,
		interval = 500,
		onUpdate,
		onError,
	} = props;
	const { context, ready } = useAudio();

	const node = useMemo(() => {
		try {
			const node = context.createAnalyser();
			node.smoothingTimeConstant = interval / 1000;
			node.fftSize = fftSize;
			return node;
		} catch (e) { }
	}, [context, fftSize, interval]);

	useEffect(() => {
		if (!node || !ready) return;

		const buffer = new Float32Array(node.frequencyBinCount);

		const update = () => {
			node.getFloatFrequencyData(buffer);
			onUpdate(buffer);
		};

		const timer = setInterval(update, interval);

		return () => {
			clearInterval(timer);
		};
	}, [node, ready, interval, onUpdate]);

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
