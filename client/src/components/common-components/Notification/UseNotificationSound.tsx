import { useEffect, useRef, useCallback } from "react";

export function useNotificationSound(src: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, [src]);

    const play = useCallback((): void => {
        if (!audioRef.current) return;

        audioRef.current.currentTime = 0;

        audioRef.current.play().catch(() => {
            // autoplay blocked → requires user interaction
            console.warn("Notification sound blocked by browser");
        });
    }, []);

    return play;
}