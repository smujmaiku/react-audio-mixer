import { useEffect } from "react";
import useErrorCallback from "./errorCallback";

export default function useNodeLink(
	source: AudioNode | undefined,
	destination: AudioNode | undefined,
	onError?: (error: Error) => void,
): void {
	const handleError = useErrorCallback(onError);

	useEffect(() => {
		if (!source || !destination) return;

		try {
			source.connect(destination);

			return () => {
				try {
					source.disconnect(destination);
				} catch (error) {
					handleError(error);
				}
			};
		} catch (error) {
			handleError(error);
		}
	}, [source, destination, handleError]);
}
