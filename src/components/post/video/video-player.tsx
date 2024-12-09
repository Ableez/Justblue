"use client";

import { PlayIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactPlayer = dynamic(() => import("react-player/lazy"), {
  ssr: false,
});

interface VideoPlayerProps {
  url: string;
}

export const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const [ended, setIsEnded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleEnded = () => {
    setIsEnded(true);
  };

  const handleReady = () => {
    setPlaying(true);
    setIsEnded(false);
  };

  const handlePlay = () => {
    setPlaying(true);
    setIsEnded(false);
  };

  return (
    <div className="relative h-[80dvh] w-full border dark:border-neutral-900 rounded-md dark:hover:bg-blue-950/5">
      <ReactPlayer
        url={url}
        controls={true}
        width={"100%"}
        onReady={handleReady}
        onEnded={handleEnded}
        onPlay={handlePlay}
        height={"100%"}
        playsinline
        playing={playing}
        playIcon={<PlayIcon className="h-10 w-10" />}
        style={{
          aspectRatio: 9 / 16,
          height: "100%",
          maxHeight: "80dvh",
        }}
        stopOnUnmount
        wrapper={({ children }) => (
          <div className="relative h-full w-full">{children}</div>
        )}
        light={true}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              disablePictureInPicture: true,
            },
          },
        }}
        onClickPreview={(e) => {
          console.log("clicked", e);
        }}
        className="rounded-md"
      />
      {!playing && ended ? (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black/20 backdrop-blur-sm">
          <p className="text-white">Video ended</p>
        </div>
      ) : null}
    </div>
  );
};
