import React, { useCallback } from 'react';
import HzAnalyserNode, {
	AnalyserToneT,
	HzAnalyserNodeProps,
	joinToneGroups,
} from './HzAnalyser';

export const noteNames = [
	'C',
	'C#,Db',
	'D',
	'D#,Eb',
	'E',
	'F',
	'F#,Gb',
	'G',
	'G#,Ab',
	'A',
	'A#,Bb',
	'B',
];
export const hz440 = [
	// Standard 440 hz
	16.35, 17.32, 18.35, 19.45, 20.6, 21.83, 23.12, 24.5, 25.96, 27.5, 29.14,
	30.87, 32.7, 34.65, 36.71, 38.89, 41.2, 43.65, 46.25, 49.0, 51.91, 55.0,
	58.27, 61.74, 65.41, 69.3, 73.42, 77.78, 82.41, 87.31, 92.5, 98.0, 103.83,
	110.0, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.0,
	196.0, 207.65, 220.0, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63,
	349.23, 369.99, 392.0, 415.3, 440.0, 466.16, 493.88, 523.25, 554.37, 587.33,
	622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880.0, 932.33, 987.77, 1046.5,
	1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22,
	1760.0, 1864.66, 1975.53, 2093.0, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83,
	2959.96, 3135.96, 3322.44, 3520.0, 3729.31, 3951.07, 4186.01, 4434.92,
	4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040.0,
	7458.62, 7902.13,
];

export type NoteList = Record<string, number>;

export function createNoteList(hz: number[]): NoteList {
	return hz.reduce((list, value, index) => {
		const name = noteNames[index % noteNames.length];
		const octive = Math.floor(index / noteNames.length);
		const octiveName = name.replace(/^|,/, (v) => `${octive}${v}`);
		return {
			...list,
			[octiveName]: value,
		};
	}, {});
}

export function getNote(list: NoteList, hz: number): [string, number] {
	const min = Object.values(list)
		.slice(0, 2)
		.reduce((a, b) => 2 * a - b);
	const max = Object.values(list)
		.slice(-2)
		.reduce((a, b) => 2 * b - a);

	if (hz < min) return ['', 0];
	if (hz > max) return ['', 0];

	let note = '4C';
	for (const [name, noteHz] of Object.entries(list)) {
		if (Math.abs(hz - noteHz) < Math.abs(hz - (list[note] || 0))) {
			note = name;
		}
	}

	return [note, hz - list[note]];
}

export function combineByNotes(
	noteList: NoteList,
	tones: AnalyserToneT[]
): AnalyserToneT[] {
	const notes: Record<string, AnalyserToneT[]> = {};

	for (const tone of tones) {
		const [hz] = tone;
		const [note] = getNote(noteList, hz);
		notes[note] = [...(notes[note] || []), tone];
	}

	return Object.values(notes).map((tone) => joinToneGroups(tone));
}

export type AnalyserNoteT = [
	note: string,
	volume: number,
	offset: number,
	jitter: number
];

export interface NoteAnalyserNodeProps
	extends Omit<HzAnalyserNodeProps, 'onUpdate'> {
	noteList?: NoteList;
	onUpdate: (notes: AnalyserNoteT[]) => void;
}

const noteListDefault = createNoteList(hz440);

export default function NoteAnalyserNode(
	props: NoteAnalyserNodeProps
): JSX.Element | null {
	const {
		noteList = noteListDefault,
		onUpdate,
		...hzAnalyserNodeProps
	} = props;

	const handleUpdate = useCallback(
		(hzList: AnalyserToneT[]) => {
			const tones: AnalyserToneT[] = combineByNotes(noteList, hzList);

			const notes: AnalyserNoteT[] = tones.map((tone) => {
				const [hz, volume, jitter] = tone;
				const [note, offset] = getNote(noteList, hz);
				return [note, volume, offset, jitter];
			});

			onUpdate(notes);
		},
		[noteList, onUpdate]
	);

	return <HzAnalyserNode onUpdate={handleUpdate} {...hzAnalyserNodeProps} />;
}
