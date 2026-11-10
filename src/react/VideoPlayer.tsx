import { useEffect, useRef, useState, type CSSProperties, type VideoHTMLAttributes } from 'react';
import { IconButton } from './Button.js';
import { Select } from './Field.js';
import { Icon } from './icons.js';
import { cx } from './utils/cx.js';
import { geometryStyle, type ComponentGeometry } from './utils/geometry.js';

export interface VideoPlayerProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'controls'>, ComponentGeometry {
  /** Use browser controls by default, or opt into Utkristi controls. */
  controls?: boolean | 'custom';
  aspectRatio?: CSSProperties['aspectRatio'];
  /** Class for the frame around the video and custom controls. */
  frameClassName?: string;
}

function formatTime(seconds: number) {
  const total = Math.floor(Math.max(0, seconds));
  const minutes = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, '0');
  return minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}

type VideoAttributes = VideoHTMLAttributes<HTMLVideoElement>;
const initialPlayback = { time: 0, duration: 0, paused: true, muted: false, failed: false };
const playbackEvents = ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'volumechange', 'emptied', 'error'];

function CustomVideo({ geometry, frameClassName, ...props }: VideoAttributes & {
  geometry?: CSSProperties;
  frameClassName?: string;
}) {
  const media = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playback, setPlayback] = useState(initialPlayback);
  const [captions, setCaptions] = useState<TextTrack[]>([]);
  const [activeCaption, setActiveCaption] = useState(-1);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const { time, duration, paused, muted, failed } = playback;

  useEffect(() => {
    const video = media.current;
    const player = frame.current;
    if (!video || !player) return;
    const document = player.ownerDocument;
    const tracks = video.textTracks;
    const syncPlayback = (event?: Event) => {
      setPlayback({ time: video.currentTime, duration: Number.isFinite(video.duration) ? video.duration : 0,
        paused: video.paused || video.ended, muted: video.muted || video.volume === 0, failed: Boolean(video.error) });
      if (event?.type === 'play' || event?.type === 'emptied') setNotice('');
    };
    const syncTracks = () => {
      const options = Array.from(tracks ?? []).filter(({ kind }) => kind === 'captions' || kind === 'subtitles');
      setCaptions(options);
      setActiveCaption(options.findIndex(({ mode }) => mode === 'showing'));
    };
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === player);
    playbackEvents.forEach((event) => video.addEventListener(event, syncPlayback));
    tracks?.addEventListener?.('addtrack', syncTracks);
    tracks?.addEventListener?.('removetrack', syncTracks);
    tracks?.addEventListener?.('change', syncTracks);
    document.addEventListener('fullscreenchange', syncFullscreen);
    setCanFullscreen(Boolean(document.fullscreenEnabled && player.requestFullscreen));
    syncPlayback();
    syncTracks();
    syncFullscreen();
    return () => {
      playbackEvents.forEach((event) => video.removeEventListener(event, syncPlayback));
      tracks?.removeEventListener?.('addtrack', syncTracks);
      tracks?.removeEventListener?.('removetrack', syncTracks);
      tracks?.removeEventListener?.('change', syncTracks);
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  }, []);

  async function togglePlayback() {
    const video = media.current;
    if (!video) return;
    if (!video.paused && !video.ended) { video.pause(); return; }
    try { await video.play(); }
    catch (error) {
      if (media.current === video && !(error instanceof DOMException && error.name === 'AbortError')) {
        setNotice('Playback could not start.');
      }
    }
  }

  async function toggleFullscreen() {
    const player = frame.current;
    if (!player) return;
    try {
      if (player.ownerDocument.fullscreenElement === player) await player.ownerDocument.exitFullscreen();
      else await player.requestFullscreen();
      setNotice('');
    } catch { setNotice('Fullscreen is unavailable.'); }
  }

  return <div ref={frame} className={cx('video-frame', frameClassName)} style={fullscreen ? undefined : geometry}>
    {/* The source and caption tracks are supplied by the caller. */}
    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
    <video {...props} ref={media} controls={false} playsInline={props.playsInline ?? true} />
    <div className="video-controls" role="group" aria-label="Video controls">
      <IconButton className="video-play" label={paused ? 'Play' : 'Pause'} disabled={failed} onClick={() => void togglePlayback()}>
        <Icon name={paused ? 'run' : 'pause'} />
      </IconButton>
      <input type="range" className="video-seek" aria-label="Seek"
        aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`} min={0} max={duration || 1} step="any"
        disabled={!duration || failed} value={duration ? Math.min(time, duration) : 0}
        onChange={(event) => {
          const video = media.current;
          if (!video) return;
          video.currentTime = event.currentTarget.valueAsNumber;
          setPlayback((current) => ({ ...current, time: video.currentTime }));
        }} />
      <span className="video-time" aria-hidden="true">{formatTime(time)} / {duration ? formatTime(duration) : '–:––'}</span>
      <div className="video-actions">
        <IconButton label={muted ? 'Unmute' : 'Mute'} onClick={() => {
          const video = media.current;
          if (!video) return;
          if (muted && video.volume === 0) video.volume = 1;
          video.muted = !muted;
        }}><Icon name={muted ? 'volume-mute' : 'volume-up'} /></IconButton>
        {captions.length > 0 && <Select aria-label="Captions" value={activeCaption}
          onChange={(event) => {
            const selected = Number(event.currentTarget.value);
            captions.forEach((track, index) => { track.mode = index === selected ? 'showing' : 'disabled'; });
            setActiveCaption(selected);
          }}>
          <option value={-1}>CC off</option>
          {captions.map((track, index) => <option key={index} value={index}>{track.label || track.language || `Track ${index + 1}`}</option>)}
        </Select>}
        {canFullscreen && <IconButton label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => void toggleFullscreen()}>
          <Icon name={fullscreen ? 'fullscreen-exit' : 'fullscreen'} />
        </IconButton>}
      </div>
    </div>
    {(failed || notice) && <p className="video-notice" role="status">{failed ? 'The video could not be loaded.' : notice}</p>}
  </div>;
}

export function VideoPlayer({
  className, controls = true, radius, inlineSize, aspectRatio, frameClassName, style, ...props
}: VideoPlayerProps) {
  const classes = cx('kit-video', className);
  const videoStyle = aspectRatio === undefined ? style : { aspectRatio, ...style };
  if (controls === 'custom') {
    return <CustomVideo {...props} className={classes} style={videoStyle} frameClassName={frameClassName}
      geometry={geometryStyle({ radius, inlineSize }, undefined)} />;
  }
  // Consumers supply language-appropriate caption tracks with their video source.
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video {...props} controls={controls} className={classes} style={geometryStyle({ radius, inlineSize }, videoStyle)} />;
}
