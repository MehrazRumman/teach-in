import { useSetAtom } from 'jotai';
import { memo, useEffect, useState } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { videoCurrentTime } from '~/atoms/videoCurrentTime';
import { playerOptions } from '~/constants';
import useLecture from '~/contexts/LearningContext';

function LearningVideo() {
  const setVideoCurrentTime = useSetAtom(videoCurrentTime);

  const lectureCtx = useLecture();
  const [player, setPlayer] = useState(null);

  const onStateChange = (event: { data: any }) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      const interval = setInterval(() => {
        // Add a null check for the player before calling getCurrentTime()
        if (player) {
          setVideoCurrentTime(parseInt(player.getCurrentTime()));
        }
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  };

  return (
    <div className="responsive-youtube-container">
      <YouTube
        onReady={(event) => setPlayer(event.target)}
        onStateChange={onStateChange}
        opts={{
          playerVars: {
            autoplay: 1,
          },
        }}
        videoId={
          lectureCtx?.currentLecture
            ? lectureCtx?.currentLecture?.resources.find(
                (rsc) => rsc.type === 'youtube',
              )?.youtubeVideoId
            : ''
        }
      />
    </div>
  );
}

export default memo(LearningVideo);

// https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4
