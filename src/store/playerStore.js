import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'

  playTrack: async (track, queue = []) => {
    const q = queue.length ? queue : [track]
    const idx = q.findIndex(t => t.id === track.id)
    set({ currentTrack: track, queue: q, queueIndex: idx >= 0 ? idx : 0, isPlaying: true })
    // Increment play count
    await supabase.rpc('increment_plays', { track_id: track.id })
  },

  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
  setVolume: (v) => set({ volume: v }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => ({
    repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off'
  })),

  nextTrack: () => {
    const { queue, queueIndex, shuffle, repeat } = get()
    if (!queue.length) return
    let next
    if (shuffle) {
      next = Math.floor(Math.random() * queue.length)
    } else {
      next = queueIndex + 1
      if (next >= queue.length) next = repeat === 'all' ? 0 : queueIndex
    }
    set({ currentTrack: queue[next], queueIndex: next, isPlaying: true })
  },

  prevTrack: () => {
    const { queue, queueIndex } = get()
    const prev = Math.max(0, queueIndex - 1)
    set({ currentTrack: queue[prev], queueIndex: prev, isPlaying: true })
  }
}))