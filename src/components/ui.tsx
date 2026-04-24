import React from "react";
import useSettingsStore from "@/stores/settings-store";

const UI = () => {
  const { bpm, isPlaying, songPath, setIsPlaying, setBpm, setSongPath } =
    useSettingsStore();

  const song = React.useRef<HTMLAudioElement | null>(null);

  function handleBpmChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newBpm = Number(event.target.value);

    if (isNaN(newBpm)) return;

    setBpm(newBpm);
  }

  function handlePlaySong() {
    console.log(song.current);

    if (isPlaying) {
      song.current?.pause();
    } else {
      if (song.current) {
        song.current.currentTime = 0;
        song.current.play();
      } else {
        console.log(songPath);

        const newSong = new Audio(songPath);
        song.current = newSong;
        newSong.play();
      }
    }

    setIsPlaying(!isPlaying);
  }

  function handleSongChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setSongPath(result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="user-interface__bar">
      <input
        type="text"
        disabled={isPlaying}
        value={bpm}
        onChange={handleBpmChange}
      />
      <button className="user-interface__bar-button" onClick={handlePlaySong}>
        {isPlaying ? "Stop" : "Play"}
      </button>
      {!songPath && (
        <input type="file" accept=".mp3" onChange={handleSongChange} />
      )}
    </div>
  );
};

export default UI;
