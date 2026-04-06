import { Play, MoreHorizontal, Heart } from 'lucide-react'
import { usePlayerStore } from '../../store/playerStore'
import styles from './TrackCard.module.css'

export default function TrackCard({ track, queue = [], index }) {
  const playTrack = usePlayerStore(s => s.playTrack)
  const currentTrack = usePlayerStore(s => s.currentTrack)
  const isActive = currentTrack?.id === track.id

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onDoubleClick={() => playTrack(track, queue)}
    >
      <span className={styles.index}>
        {isActive ? (
          <span className={styles.nowPlaying}>
            <span/><span/><span/>
          </span>
        ) : (
          <span className={styles.indexNum}>{index + 1}</span>
        )}
        <button
          className={styles.playBtn}
          onClick={() => playTrack(track, queue)}
        >
          <Play size={14} fill="white"/>
        </button>
      </span>

      <img src={track.cover_url || '/placeholder.jpg'} className={styles.cover} alt="" />

      <div className={styles.info}>
        <span className={styles.title}>{track.title}</span>
        <span className={styles.artist}>{track.artist_name || track.profiles?.display_name}</span>
      </div>

      <span className={styles.album}>{track.albums?.title || ''}</span>

      <div className={styles.actions}>
        <button className={styles.actionBtn}><Heart size={14}/></button>
        <span className={styles.duration}>{formatTime(track.duration)}</span>
        <button className={styles.actionBtn}><MoreHorizontal size={14}/></button>
      </div>
    </div>
  )
}

function formatTime(s) {
  if (!s) return '—'
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}