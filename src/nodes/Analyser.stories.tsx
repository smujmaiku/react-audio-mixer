import React, { useCallback, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { AudioProvider, FFT_MIN } from '../audio';
import Debugger from '../labs/Debugger';
import AnalyserNode from './Analyser';

export default {
	title: 'Nodes/Analyser',
	component: AnalyserNode,
	argTypes: {
		type: {
			description: 'The Analyser value of the interface',
			control: 'inline-radio',
			options: ['frequency', 'waveform'],
			defaultValue: 'frequency',
		},
		fftSize: {
			defaultValue: FFT_MIN,
			control: 'number',
		},
		interval: {
			defaultValue: 500,
			control: { type: 'range', min: 100, max: 2000, step: 100 },
		},
		smoothing: {
			defaultValue: 0,
			control: { type: 'range', min: 0, max: 1, step: 0.1 },
		},
		min: {
			defaultValue: -100,
			control: { type: 'range', min: -100, max: 0, step: 1 },
		},
		max: {
			defaultValue: 0,
			control: { type: 'range', min: -100, max: 0, step: 1 },
		},
		floatBuffer: {
			control: 'boolean',
			defaultValue: false,
		},
		onUpdate: {
			description: 'reasons',
		},
	},
} as ComponentMeta<typeof AnalyserNode>;

const Template: ComponentStory<typeof AnalyserNode> = (args) => {
	return (
		<AudioProvider>
			<Debugger name="tone" />
			<AnalyserNode
				{...args}
				type="frequency"
				onUpdate={action('onUpdate')}
				listen="tone"
			/>
		</AudioProvider>
	);
};

export const Basic = Template.bind({});
Basic.args = {};
