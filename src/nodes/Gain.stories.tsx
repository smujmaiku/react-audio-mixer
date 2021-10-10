import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { AudioProvider } from '../audio';
import Debugger from '../labs/Debugger';
import GainNode from './Gain';

export default {
	title: 'Nodes/Gain',
	component: GainNode,
	argTypes: {
		gain: {
			description: 'The gain value of the interface',
			control: { type: 'range', min: 0, max: 2, step: 0.1 },
			defaultValue: 1,
		},
		gainSequence: {
			description: 'An Array `AudioParamSequence` of gain events',
			control: 'array',
			defaultValue: undefined,
		},
	},
} as ComponentMeta<typeof GainNode>;

const Template: ComponentStory<typeof GainNode> = (args) => {
	const gainSequence = args.gainSequence instanceof Array ? args.gainSequence : undefined;
	return (
		<AudioProvider>
			<Debugger name="tone" listen="gain" />
			<GainNode
				{...args}
				gainSequence={gainSequence}
				name="gain"
				listen="tone"
			/>
		</AudioProvider>
	);
};

export const Basic = Template.bind({});

export const LinearRamp = Template.bind({});
LinearRamp.args = {
	gain: 0,
	gainSequence: [
		["linearRamp", 1, 5],
		["linearRamp", 0, 10],
		["linearRamp", 1, 15],
		["linearRamp", 0, 20],
	],
};
