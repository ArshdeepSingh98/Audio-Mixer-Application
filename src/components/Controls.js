import { useState, useEffect, useRef, useCallback } from "react";

// icons
import {
    IoPlayBackSharp,
    IoPlayForwardSharp,
    IoPlaySharp,
    IoPauseSharp,
} from "react-icons/io5";

import { IoMdVolumeHigh, IoMdVolumeOff, IoMdVolumeLow } from "react-icons/io";

const Controls = ({ audioRef, progressBarRef, duration, setTimeProgress }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(60);
    const [muteVolume, setMuteVolume] = useState(false);

    const togglePlayPause = () => {
        console.log("handle play");
        setIsPlaying((prev) => !prev);
    };

    const playAnimationRef = useRef();

    const repeat = useCallback(() => {
        const currentTime = audioRef.current.currentTime;
        setTimeProgress(currentTime);
        progressBarRef.current.value = currentTime;
        progressBarRef.current.style.setProperty(
            "--range-progress",
            `${(progressBarRef.current.value / duration) * 100}%`
        );

        playAnimationRef.current = requestAnimationFrame(repeat);
    }, [audioRef, duration, progressBarRef, setTimeProgress]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
        playAnimationRef.current = requestAnimationFrame(repeat);
    }, [isPlaying, audioRef, repeat]);

    const skipForward = () => {
        audioRef.current.currentTime += 15;
    };

    const skipBackward = () => {
        audioRef.current.currentTime -= 15;
    };

    useEffect(() => {
        if (audioRef) {
            audioRef.current.volume = volume / 100;
            audioRef.current.muted = muteVolume;
        }
    }, [volume, audioRef, muteVolume]);

    return (
        <div className="controls-wrapper">
            <div className="controls">
                <button onClick={skipBackward}>
                    <IoPlayBackSharp />
                </button>
                <button onClick={togglePlayPause}>
                    {isPlaying ? <IoPauseSharp /> : <IoPlaySharp />}
                </button>
                <button onClick={skipForward}>
                    <IoPlayForwardSharp />
                </button>
            </div>
            <div className="volume">
                <button onClick={() => setMuteVolume((prev) => !prev)}>
                    {muteVolume || volume < 5 ? (
                        <IoMdVolumeOff />
                    ) : volume < 40 ? (
                        <IoMdVolumeLow />
                    ) : (
                        <IoMdVolumeHigh />
                    )}
                </button>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    style={{
                        background: `linear-gradient(to right, #f50 ${volume}%, #ccc ${volume}%)`,
                    }}
                />
            </div>
        </div>
    );
};

export default Controls;
