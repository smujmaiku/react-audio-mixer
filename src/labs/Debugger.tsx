import React, {
	useEffect, useState,
} from 'react';
import useAudio, { SpeakerNode } from '../audio';
import OscillatorsNode from './Oscillators';
import CanvasAnalyser from './CanvasAnalyser';

const FREQS = [261.63, 329.63, 392.00];

export interface DebuggerNodeProps {
	name?: string;
	listen?: string;
}

export default function DebuggerNode(props: DebuggerNodeProps): JSX.Element {
	const { name, listen } = props;
	const { context, ready } = useAudio();

	const [monitor, setMonitor] = useState(false);
	const handleMonitor = () => { setMonitor(v => !v); };

	const [currentTime, setCurrentTime] = useState(0);
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(context.currentTime);
		}, 100);
		return () => {
			clearInterval(timer);
		}
	}, [context]);

	return (
		<div>
			{name && <OscillatorsNode
				type="triangle"
				name={name}
				frequencies={FREQS}
				gain={0.3}
			/>}
			<p>{ready ? 'Ready' : 'Pending interaction'}</p>
			<p>{`currentTime: ${currentTime?.toFixed(1)}`}</p>
			{listen && (<>
				<CanvasAnalyser
					height={100}
					width={300}
					listen={listen}
					interval={100}
					fftSize={256}
					smoothing={0.1}
					max={0}
				/>
				{monitor && (
					<SpeakerNode
						listen={listen}
					/>
				)}
				<p>
					<label>
						<input
							type="checkbox"
							checked={monitor}
							onChange={handleMonitor}
						/>
						Monitor
					</label>
				</p>
			</>)}
		</div>
	);
}
