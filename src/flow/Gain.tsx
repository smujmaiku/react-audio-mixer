import React, { useCallback } from 'react';
import { GainNode } from '../audio';

export default function GainFlow(props) {
	const {
		name,
		listen,
		gain = 1,
		patchNode
	} = props;

	const handleGainChange = useCallback((ev) => {
		patchNode({
			name,
			gain: ev.value,
		})
	}, [name, patchNode]);

	return (
		<div
			className="nodrag"
		>
			<h4>
				Gain: {name}
			</h4>
			<input
				type="range"
				min="0"
				max="2"
				step="0.1"
				value={gain}
				onChange={handleGainChange}
			/>
			<GainNode
				name={name}
				listen={listen}
				gain={gain}
			/>
		</div>
	);
}