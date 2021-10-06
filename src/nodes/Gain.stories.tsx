import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { AudioProvider } from '../audio';
import GainNode from './Gain';

export default {
	title: 'Nodes/Gain',
	component: GainNode,
	argTypes: {
		gain: { control: { type: 'range', min: 0, max: 2, step: 0.1 } }
	},
} as ComponentMeta<typeof GainNode>;

const Template: ComponentStory<typeof GainNode> = (args) => (
	<AudioProvider>
		<GainNode {...args} />
	</AudioProvider>
);

export const Basic = Template.bind({});
Basic.args = {
	gain: 1,
};
