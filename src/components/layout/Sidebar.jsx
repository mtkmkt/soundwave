import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Search, Library, PlusSquare, Heart, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Your Library' },
]

export default function Sidebar() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--accent)">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.2-.51.2-.71 0C14.15 14.87 11.13 14 8 14c-1.4 0-2.74.18-4 .5-.27.07-.55-.1-.62-.37s.1-.55.37-.62C5.16 13.17 6.56 13 8 13c3.42 0 6.71.93 9.35 2.94.21.16.25.45.09.65l-.79.06z"/>
          <path d="M17.55 11.62c-.25.25-.65.25-.9 0C14.65 9.62 11.21 8.5 8 8.5c-1.74 0-3.4.28-4.93.77-.33.11-.68-.07-.79-.4s.07-.68.4-.79C4.35 7.58 6.13 7.3 8 7.3c3.6 0 7.37 1.22 10.1 3.41.26.22.29.6.07.86l-.62.05zM18.95 8.35c-.3.3-.77.3-1.07 0C15.38 5.85 11.38 4.5 8 4.5c-2.06 0-4.01.38-5.8 1.06-.37.13-.77-.06-.9-.43s.06-.77.43-.9C3.74 3.53 5.82 3.1 8 3.1c3.77 0 8.1 1.48 11.02 4.19.3.28.32.74.04 1.06H18.95z"/>
        </svg>
        <span className={styles.logoText}>SoundWave</span>
      </div>

      {/* Main Nav */}
      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Library section */}
      <div className={styles.librarySection}>
        <div className={styles.libraryHeader}>
          <button className={styles.libraryBtn}>
            <PlusSquare size={20} />
            <span>Create Playlist</span>
          </button>
          <button className={`${styles.libraryBtn} ${styles.liked}`}>
            <Heart size={20} />
            <span>Liked Songs</span>
          </button>
        </div>
      </div>

      {/* Artist Dashboard shortcut */}
      {profile?.role === 'artist' && (
        <button
          className={styles.dashboardBtn}
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard size={16} />
          Artist Dashboard
        </button>
      )}

      {/* Profile */}
      <div className={styles.profile}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} className={styles.avatar} alt=""/>
        ) : (
          <div className={styles.avatarPlaceholder}>
            {profile?.display_name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className={styles.profileName}>{profile?.display_name}</span>
      </div>
    </aside>
  )
}