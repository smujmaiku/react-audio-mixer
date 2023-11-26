import React, { useEffect, useState } from 'react';
import useAudio, { BaseNodeProps } from '../audioContext';
import AudioProvider from '../audioProvider';
import NullNode from './Null';
import useErrorCallback from '../hooks/errorCallback';
import useNodeLink from '../hooks/nodeLink';

export interface GroupNodeProps extends BaseNodeProps {
	children?: React.ReactNode;
	inputName?: string;
	outputName?: string;
}

export default function GroupNode(props: GroupNodeProps): JSX.Element {
	const {
		children,
		inputName = 'input',
		outputName = 'output',
		listen,
		onNode,
		onError,
		...baseProps
	} = props;
	const { context } = useAudio();

	const handleError = useErrorCallback(onError);

	const [outerInput, setOuterInput] = useState<AudioNode | undefined>();
	const [innerInput, setInnerInput] = useState<AudioNode | undefined>();
	const [innerOutput, setInnerOutput] = useState<AudioNode | undefined>();
	const [outerOutput, setOuterOutput] = useState<AudioNode | undefined>();

	useEffect(() => {
		if (!outerOutput || !onNode) return;
		onNode(outerOutput);
	}, [outerOutput, onNode]);

	useNodeLink(outerInput, innerInput, handleError);
	useNodeLink(innerOutput, outerOutput, handleError);

	return (
		<>
			<NullNode listen={listen} onNode={setOuterInput} onError={handleError} />
			<AudioProvider context={context}>
				<NullNode
					name={inputName}
					onNode={setInnerInput}
					onError={handleError}
				/>
				<NullNode
					listen={outputName}
					onNode={setInnerOutput}
					onError={handleError}
				/>
				{children}
			</AudioProvider>
			<NullNode {...baseProps} onNode={setOuterOutput} onError={handleError} />
		</>
	);
}
