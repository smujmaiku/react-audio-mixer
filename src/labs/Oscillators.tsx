import React, { useCallback } from 'react';
import { BaseInNodeProps, GroupNode, OscillatorNode, GainNode } from '../audio';
import useErrorCallback from '../hooks/errorCallback';

export interface OscillatorsNodeProps extends BaseInNodeProps {
	type?: OscillatorType;
	frequencies: number[];
	gain?: number;
	start?: number;
	end?: number;
	onEnded?: () => void;
}

export default function OscillatorsNode(props: OscillatorsNodeProps): JSX.Element | null {
	const {
		type = 'sine',
		frequencies,
		gain = 1,
		start,
		end,
		onEnded,
		onError,
		...baseNodeProps
	} = props;

	const handleError = useErrorCallback(onError);

	const handleEnded = useCallback(() => {
		// TODO: count things here probably with a reducer
	}, []);

	return (
		<GroupNode
			onError={onError}
			{...baseNodeProps}
		>
			{frequencies.map((frequency, index) => (
				<OscillatorNode
					key={index}
					name="beeps"
					type={type}
					frequency={frequency}
					start={start}
					end={end}
					onEnded={handleEnded}
					onError={handleError}
				/>
			))}
			<GainNode name="output" listen="beeps" gain={gain} />
		</GroupNode>
	);
}
