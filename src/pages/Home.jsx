import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePlayerStore } from '../store/playerStore'
import TrackCard from '../components/music/TrackCard'
import styles from './Home.module.css'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [recent, setRecent] = useState([])
  const playTrack = usePlayerStore(s => s.playTrack)

  useEffect(() => {
    fetchFeatured()
    fetchRecent()
  }, [])

  const fetchFeatured = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('*, profiles(display_name, avatar_url)')
      .eq('is_public', true)
      .order('plays', { ascending: false })
      .limit(6)
    setFeatured(data || [])
  }

  const fetchRecent = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('*, profiles(display_name, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20)
    setRecent(data || [])
  }

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className={styles.page}>
      <h1 className={styles.greeting}>{greeting}</h1>

      {/* Featured Grid */}
      <div className={styles.featuredGrid}>
        {featured.map(track => (
          <button
            key={track.id}
            className={styles.featuredCard}
            onClick={() => playTrack(track, featured)}
          >
            <img src={track.cover_url || '/placeholder.jpg'} className={styles.featuredImg} alt="" />
            <span className={styles.featuredTitle}>{track.title}</span>
          </button>
        ))}
      </div>

      {/* New Releases */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>New Releases</h2>
          <button className={styles.showAll}>Show all</button>
        </div>
        <div className={styles.trackList}>
          <div className={styles.listHeader}>
            <span>#</span>
            <span>Title</span>
            <span>Album</span>
            <span>Duration</span>
          </div>
          {recent.map((track, i) => (
            <TrackCard key={track.id} track={track} queue={recent} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}