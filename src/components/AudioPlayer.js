import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Controls from "./Controls";
import ProgressBar from "./ProgressBar";

const AudioPlayer = () => {
    const [audioFiles, setAudioFiles] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [timeProgress, setTimeProgress] = useState(0);
    const [newSongPositon, setNewSongPosition] = useState(0);
    const [currentSelectedSongPosition, setCurrentSelectedSongPosition] =
        useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef();
    const progressBarRef = useRef();

    // TODO: This is merging audio buffers but browser/OS not working with this

    // const interleavedBuffers = (buffer) => {
    //     const interleaved = new Float32Array(
    //         buffer.length * buffer.numberOfChannels
    //     );
    //     const channels = [];
    //     for (let i = 0; i < buffer.numberOfChannels; i++) {
    //         channels.push(buffer.getChannelData(i));
    //     }
    //     for (let sample = 0; sample < buffer.length; sample++) {
    //         for (
    //             let channel = 0;
    //             channel < buffer.numberOfChannels;
    //             channel++
    //         ) {
    //             interleaved[sample * buffer.numberOfChannels + channel] =
    //                 channels[channel][sample];
    //         }
    //     }
    //     return interleaved;
    // };

    // const audioBufferToWav = (buffer) => {
    //     // Example audioBufferToWav function (you may need a more robust implementation)
    //     const interleaved = interleavedBuffers(buffer);
    //     const wavBlob = new Blob([interleaved], { type: "audio/wav" });
    //     return wavBlob;
    // };

    // useEffect(() => {
    //     const concatenateBuffers = async () => {
    //         if (audioFiles.length > 0) {
    //             const audioContext = new (window.AudioContext ||
    //                 window.webkitAudioContext)();
    //             const audioBuffers = await Promise.all(
    //                 audioFiles.map(async (file) => {
    //                     const arrayBuffer = await file.arrayBuffer();
    //                     return await audioContext.decodeAudioData(arrayBuffer);
    //                 })
    //             );

    //             const mergedBuffer = audioContext.createBuffer(
    //                 audioBuffers[0].numberOfChannels,
    //                 audioBuffers.reduce(
    //                     (total, buffer) => total + buffer.length,
    //                     0
    //                 ),
    //                 audioBuffers[0].sampleRate
    //             );

    //             let offset = 0;
    //             audioBuffers.forEach((buffer) => {
    //                 mergedBuffer
    //                     .getChannelData(0)
    //                     .set(buffer.getChannelData(0), offset);
    //                 offset += buffer.length;
    //             });

    //             const mergedAudioBlob = audioBufferToWav(mergedBuffer); // Use audioBufferToWav function

    //             setCurrentTrack({
    //                 title: "merged_song",
    //                 src: URL.createObjectURL(mergedAudioBlob),
    //             });
    //         }
    //     };

    //     concatenateBuffers();
    // }, [audioFiles]);

    // For handling uploading for files
    const handleUpload = (e) => {
        console.log("uploading: ", e.target.files[0]);
        const newAudioFiles = [...audioFiles, e.target.files[0]];
        console.log("new audio files: ", newAudioFiles);
        setCurrentTrack({
            title: "merged_song",
            src: URL.createObjectURL(e.target.files[0]),
        });
        setCurrentSelectedSongPosition(audioFiles.length + 1);
        setAudioFiles(newAudioFiles);
    };

    // For handling recorded audio
    const createAudioFromMic = () => {};

    // Repeat after finishing the song
    const handleRepeat = () => {
        audioRef.current.currentTime = 0;
    };

    // For getting the new song position
    const handleDropdownChange = (e) => {
        setNewSongPosition(e.target.value);
    };

    // For getting the current selected song
    const handleTrackDropdownChange = (e) => {
        setCurrentSelectedSongPosition(e.target.value);
    };

    // Generate dynamic dropdown options
    const generateOptions = () => {
        const options = [];
        for (let i = 1; i <= audioFiles.length; i++) {
            options.push(
                <option key={i} value={i - 1}>
                    {i}
                </option>
            );
        }
        return options;
    };

    const generateTrackOptions = () => {
        const options = [];
        if (audioFiles && audioFiles.length > 0) {
            for (let i = 0; i < audioFiles.length; i++) {
                options.push(
                    <option key={i} value={i}>
                        {audioFiles[i].name}
                    </option>
                );
            }
            return options;
        }
        return undefined;
    };

    // To calculate the total duration of songs after a new song is added to the list
    useEffect(() => {
        // Calculate total durations when audio files change
        const durations = audioFiles.map((file, index) => {
            const audio = new Audio(URL.createObjectURL(file));
            return new Promise((resolve) => {
                audio.onloadedmetadata = () => {
                    resolve(audio.duration);
                };
            });
        });

        Promise.all(durations).then((totalDurations) => {
            // console.log("set total duration: ", totalDurations);
            let total = 0;
            totalDurations.forEach((duration) => {
                total += duration;
            });
            setDuration(total);
            progressBarRef.current.max = total;
        });
    }, [audioFiles]);

    // To swap the song from one positio to another
    useEffect(() => {
        console.log("old position", currentSelectedSongPosition);
        console.log("new position: ", newSongPositon);

        if (audioFiles && audioFiles.length > 0) {
            const newAudioFiles = [...audioFiles];

            const temp = newAudioFiles[currentSelectedSongPosition];
            newAudioFiles[currentSelectedSongPosition] =
                newAudioFiles[newSongPositon];
            newAudioFiles[newSongPositon] = temp;
            setAudioFiles(newAudioFiles);
        }
    }, [newSongPositon]);

    // console.log("current track: ", currentTrack.src);
    // console.log("duration: ", duration);
    // console.log("current song: ", currentTrack.src);

    return (
        <>
            <Container>
                <div className="container">
                    <TopMenuBar>
                        <input type="file" onChange={handleUpload} />
                        <button>Record</button>
                    </TopMenuBar>

                    <SongDisplay>
                        <Text>
                            Select current Track:{" "}
                            <select
                                id="dropdown"
                                value={currentSelectedSongPosition}
                                onChange={handleTrackDropdownChange}
                            >
                                <option value="">Track</option>
                                {generateTrackOptions()}
                            </select>
                        </Text>
                        <SongImage>
                            <audio
                                src={currentTrack.src}
                                ref={audioRef}
                                onEnded={handleRepeat}
                            />
                            Song
                        </SongImage>
                        <Controls
                            audioRef={audioRef}
                            duration={duration}
                            setTimeProgress={setTimeProgress}
                            progressBarRef={progressBarRef}
                        ></Controls>
                        <Text>
                            Reorder current track to Posn:
                            <select
                                id="dropdown"
                                value={newSongPositon}
                                onChange={handleDropdownChange}
                            >
                                <option value="">Select</option>
                                {generateOptions()}
                            </select>
                        </Text>
                    </SongDisplay>

                    <ProgressBar
                        progressBarRef={progressBarRef}
                        audioRef={audioRef}
                        timeProgress={timeProgress}
                        duration={duration}
                    />
                </div>
            </Container>
        </>
    );
};

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    align-items: center;
    background-color: #ffffff;
    .container {
        height: 40vh;
        min-width: 300px;
        background-color: #fffbbb;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 2em;
        border-radius: 2em;
        border: 2px solid rgba(0, 0, 0, 0.5);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);
    }
`;

const TopMenuBar = styled.div`
    height: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #a29700;
`;

const SongDisplay = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const SongImage = styled.p`
    height: 120px;
    width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: black;
    color: white;
`;

const Text = styled.p`
    font-size: 12px;
`;

export default AudioPlayer;
