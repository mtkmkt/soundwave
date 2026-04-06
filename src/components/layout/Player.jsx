import { useEffect, useRef, useState } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Repeat, Repeat1, Volume2, VolumeX, Heart, Maximize2, ListMusic
} from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import styles from './Player.module.css'

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function Player() {
  const audioRef = useRef(null)
  const [liked, setLiked] = useState(false)

  const {
    currentTrack, isPlaying, volume, progress, duration, shuffle, repeat,
    togglePlay, setVolume, setProgress, setDuration, nextTrack, prevTrack,
    toggleShuffle, cycleRepeat
  } = usePlayerStore()

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause()
  }, [isPlaying, currentTrack])

  // Load new track
  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audio_url) return
    audioRef.current.src = currentTrack.audio_url
    audioRef.current.play().catch(() => {})
  }, [currentTrack])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  if (!currentTrack) return (
    <div className={styles.playerEmpty}>
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Select a song to start playing
      </span>
    </div>
  )

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        onTimeUpdate={e => setProgress(e.target.currentTime)}
        onLoadedMetadata={e => setDuration(e.target.duration)}
        onEnded={() => {
          if (repeat === 'one') { audioRef.current.currentTime = 0; audioRef.current.play() }
          else nextTrack()
        }}
      />

      {/* Track info */}
      <div className={styles.trackInfo}>
        <img
          src={currentTrack.cover_url || '/placeholder.jpg'}
          className={styles.cover}
          alt={currentTrack.title}
        />
        <div className={styles.meta}>
          <span className={styles.trackTitle}>{currentTrack.title}</span>
          <span className={styles.trackArtist}>{currentTrack.artist_name}</span>
        </div>
        <button
          className={`${styles.iconBtn} ${liked ? styles.liked : ''}`}
          onClick={() => setLiked(l => !l)}
        >
          <Heart size={16} fill={liked ? 'var(--accent)' : 'none'} stroke={liked ? 'var(--accent)' : 'currentColor'} />
        </button>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlBtns}>
          <button
            className={`${styles.iconBtn} ${shuffle ? styles.activeBtn : ''}`}
            onClick={toggleShuffle}
          >
            <Shuffle size={16} />
          </button>

          <button className={styles.iconBtn} onClick={prevTrack}>
            <SkipBack size={20} />
          </button>

          <button className={styles.playBtn} onClick={togglePlay}>
            {isPlaying ? <Pause size={20} fill="black"/> : <Play size={20} fill="black" />}
          </button>

          <button className={styles.iconBtn} onClick={nextTrack}>
            <SkipForward size={20} />
          </button>

          <button
            className={`${styles.iconBtn} ${repeat !== 'off' ? styles.activeBtn : ''}`}
            onClick={cycleRepeat}
          >
            {repeat === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className={styles.progressRow}>
          <span className={styles.time}>{formatTime(progress)}</span>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              className={styles.progressInput}
              onChange={e => {
                if (audioRef.current) audioRef.current.currentTime = e.target.value
                setProgress(Number(e.target.value))
              }}
            />
          </div>
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className={styles.extras}>
        <button className={styles.iconBtn}>
          <ListMusic size={16} />
        </button>
        <button className={styles.iconBtn} onClick={() => setVolume(volume > 0 ? 0 : 0.8)}>
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className={styles.volumeTrack}>
          <div className={styles.volumeFill} style={{ width: `${volume * 100}%` }} />
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            className={styles.progressInput}
            onChange={e => setVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}