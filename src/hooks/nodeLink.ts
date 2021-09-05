import { useEffect } from "react";
import useErrorCallback, { ErrorCallback } from "./errorCallback";

export default function useNodeLink(
	source: AudioNode | undefined,
	destination: AudioNode | undefined,
	onError?: ErrorCallback,
): void {
	const handleError = useErrorCallback(onError);

	useEffect(() => {
		if (!source || !destination) return;

		try {
			source.connect(destination);

			return () => {
				try {
					source.disconnect(destination);
				} catch (error: unknown) {
					handleError(error);
				}
			};
		} catch (error) {
			handleError(error);
		}
	}, [source, destination, handleError]);
}
