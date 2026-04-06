import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Upload, Music, BarChart3, Disc } from 'lucide-react'
import styles from './ArtistDashboard.module.css'

export default function ArtistDashboard() {
  const { profile } = useAuthStore()
  const [tracks, setTracks] = useState([])
  const [stats, setStats] = useState({ totalPlays: 0, totalTracks: 0 })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tab, setTab] = useState('overview')
  const [form, setForm] = useState({ title: '', genre: '', album_id: '' })
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)

  useEffect(() => { fetchTracks() }, [])

  const fetchTracks = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('*, albums(title)')
      .eq('artist_id', profile.id)
      .order('created_at', { ascending: false })
    setTracks(data || [])
    const totalPlays = (data || []).reduce((acc, t) => acc + (t.plays || 0), 0)
    setStats({ totalPlays, totalTracks: (data || []).length })
  }

  const { getRootProps: getAudioProps, getInputProps: getAudioInput } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.flac', '.m4a'] },
    maxFiles: 1,
    onDrop: files => setAudioFile(files[0])
  })

  const { getRootProps: getCoverProps, getInputProps: getCoverInput } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: files => setCoverFile(files[0])
  })

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!audioFile) return toast.error('Please select an audio file')
    if (!form.title) return toast.error('Track title is required')

    setUploading(true)
    setUploadProgress(10)

    try {
      // Upload audio
      const audioExt = audioFile.name.split('.').pop()
      const audioPath = `${profile.id}/${Date.now()}.${audioExt}`
      const { error: audioErr } = await supabase.storage
        .from('audio-tracks')
        .upload(audioPath, audioFile)
      if (audioErr) throw audioErr
      setUploadProgress(50)

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('audio-tracks')
        .getPublicUrl(audioPath)

      // Upload cover if provided
      let coverUrl = null
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop()
        const coverPath = `${profile.id}/${Date.now()}.${coverExt}`
        await supabase.storage.from('album-art').upload(coverPath, coverFile)
        const { data: { publicUrl } } = supabase.storage.from('album-art').getPublicUrl(coverPath)
        coverUrl = publicUrl
      }
      setUploadProgress(80)

      // Get audio duration
      const duration = await getAudioDuration(audioFile)

      // Insert track record
      const { error: dbErr } = await supabase.from('tracks').insert({
        artist_id: profile.id,
        title: form.title,
        genre: form.genre,
        audio_url: audioUrl,
        cover_url: coverUrl,
        duration: Math.round(duration),
        is_public: true
      })
      if (dbErr) throw dbErr

      setUploadProgress(100)
      toast.success('Track uploaded successfully!')
      setForm({ title: '', genre: '', album_id: '' })
      setAudioFile(null)
      setCoverFile(null)
      fetchTracks()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Artist Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {profile?.display_name}</p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <Music size={24} color="var(--accent)" />
          <div>
            <div className={styles.statNum}>{stats.totalTracks}</div>
            <div className={styles.statLabel}>Tracks</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <BarChart3 size={24} color="var(--accent)" />
          <div>
            <div className={styles.statNum}>{stats.totalPlays.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Plays</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['overview', 'upload', 'tracks'].map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {tab === 'upload' && (
        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <h2 className={styles.sectionTitle}>Upload a Track</h2>

          {/* Audio drop */}
          <div {...getAudioProps()} className={`${styles.dropzone} ${audioFile ? styles.hasFile : ''}`}>
            <input {...getAudioInput()} />
            {audioFile ? (
              <div>
                <Music size={32} color="var(--accent)" />
                <p>{audioFile.name}</p>
                <span>{(audioFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div>
                <Upload size={32} />
                <p>Drop your audio file here</p>
                <span>MP3, WAV, FLAC, M4A up to 50MB</span>
              </div>
            )}
          </div>

          {/* Cover drop */}
          <div {...getCoverProps()} className={`${styles.coverDrop} ${coverFile ? styles.hasFile : ''}`}>
            <input {...getCoverInput()} />
            {coverFile ? (
              <img src={URL.createObjectURL(coverFile)} className={styles.coverPreview} alt=""/>
            ) : (
              <div>
                <Disc size={24} />
                <p>Add cover art</p>
              </div>
            )}
          </div>

          <div className={styles.formFields}>
            <div className={styles.field}>
              <label>Track Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))}
                placeholder="Enter track title"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Genre</label>
              <select
                value={form.genre}
                onChange={e => setForm(f => ({...f, genre: e.target.value}))}
              >
                <option value="">Select genre</option>
                {['Pop','Hip-Hop','Rock','Electronic','R&B','Jazz','Classical','Country','Indie'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {uploading && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <button type="submit" className={styles.uploadBtn} disabled={uploading}>
            {uploading ? `Uploading... ${uploadProgress}%` : 'Publish Track'}
          </button>
        </form>
      )}

      {/* Tracks Tab */}
      {tab === 'tracks' && (
        <div className={styles.tracksList}>
          <h2 className={styles.sectionTitle}>Your Tracks</h2>
          {tracks.map(track => (
            <div key={track.id} className={styles.trackRow}>
              <img src={track.cover_url || '/placeholder.jpg'} className={styles.trackCover} alt="" />
              <div>
                <div className={styles.trackName}>{track.title}</div>
                <div className={styles.trackMeta}>{track.genre} · {track.plays} plays</div>
              </div>
              <div className={styles.trackActions}>
                <button className={styles.deleteBtn} onClick={async () => {
                  await supabase.from('tracks').delete().eq('id', track.id)
                  fetchTracks()
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getAudioDuration(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.onloadedmetadata = () => { resolve(audio.duration); URL.revokeObjectURL(url) }
    audio.onerror = () => resolve(0)
  })
}