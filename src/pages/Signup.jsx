import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', username: '', display_name: '', role: 'listener' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          display_name: form.display_name,
          role: form.role
        }
      }
    })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Account created! Check your email.')
    navigate('/login')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🎵</div>
        <h1 className={styles.title}>Create your account</h1>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Username</label>
            <input value={form.username} onChange={e => update('username', e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label>Display Name</label>
            <input value={form.display_name} onChange={e => update('display_name', e.target.value)} required />
          </div>

          {/* Account type */}
          <div className={styles.field}>
            <label>Account Type</label>
            <div className={styles.roleSelector}>
              <button
                type="button"
                className={`${styles.roleBtn} ${form.role === 'listener' ? styles.selectedRole : ''}`}
                onClick={() => update('role', 'listener')}
              >
                🎧 Listener
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${form.role === 'artist' ? styles.selectedRole : ''}`}
                onClick={() => update('role', 'artist')}
              >
                🎤 Artist / Uploader
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  )
}