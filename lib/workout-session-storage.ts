// Workout session persistence for maintaining state across navigation

interface WorkoutSessionExercise {
  id: string
  name: string
  category: string
  sets: Array<{
    reps: number
    weight: number
    completed: boolean
  }>
}

interface WorkoutSession {
  id: string
  workoutName: string
  exercises: WorkoutSessionExercise[]
  isWorkoutActive: boolean
  workoutStartTime: string | null
  workoutDuration: number
  templateId: string | null
  createdAt: string
  lastModified: string
}

const WORKOUT_SESSION_KEY = 'fittracker_active_workout_session'

export function saveWorkoutSession(session: Omit<WorkoutSession, 'id' | 'createdAt' | 'lastModified'>) {
  try {
    const existingSession = getWorkoutSession()
    const sessionData: WorkoutSession = {
      id: existingSession?.id || `session-${Date.now()}`,
      ...session,
      createdAt: existingSession?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    localStorage.setItem(WORKOUT_SESSION_KEY, JSON.stringify(sessionData))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('workoutSessionSaved', { 
      detail: sessionData 
    }))
    
    return sessionData
  } catch (error) {
    console.error('Error saving workout session:', error)
    return null
  }
}

export function getWorkoutSession(): WorkoutSession | null {
  try {
    const sessionData = localStorage.getItem(WORKOUT_SESSION_KEY)
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData) as WorkoutSession
    
    // Validate session data structure
    if (!session.id || !Array.isArray(session.exercises)) {
      console.warn('Invalid workout session data, clearing...')
      clearWorkoutSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error loading workout session:', error)
    return null
  }
}

export function clearWorkoutSession() {
  try {
    localStorage.removeItem(WORKOUT_SESSION_KEY)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('workoutSessionCleared'))
    
    return true
  } catch (error) {
    console.error('Error clearing workout session:', error)
    return false
  }
}

export function hasActiveWorkoutSession(): boolean {
  const session = getWorkoutSession()
  return session !== null && session.exercises.length > 0
}

export function getWorkoutSessionSummary() {
  const session = getWorkoutSession()
  if (!session) return null
  
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = session.exercises.reduce((acc, ex) => 
    acc + ex.sets.filter(set => set.completed).length, 0
  )
  const progressPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
  
  return {
    id: session.id,
    workoutName: session.workoutName,
    exerciseCount: session.exercises.length,
    totalSets,
    completedSets,
    progressPercentage,
    duration: session.workoutDuration,
    isActive: session.isWorkoutActive,
    lastModified: session.lastModified
  }
}

// Auto-save hook for React components
export function useWorkoutSessionAutoSave() {
  const saveSession = (sessionData: Omit<WorkoutSession, 'id' | 'createdAt' | 'lastModified'>) => {
    // Only save if there's meaningful data (exercises or active state)
    if (sessionData.exercises.length > 0 || sessionData.isWorkoutActive) {
      return saveWorkoutSession(sessionData)
    }
    return null
  }
  
  return { saveSession }
}

// Utility to check if session is stale (older than 24 hours)
export function isWorkoutSessionStale(): boolean {
  const session = getWorkoutSession()
  if (!session) return false
  
  const lastModified = new Date(session.lastModified)
  const now = new Date()
  const hoursDiff = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60)
  
  return hoursDiff > 24 // Consider stale after 24 hours
}

// Clean up stale sessions
export function cleanupStaleWorkoutSession() {
  if (isWorkoutSessionStale()) {
    console.log('Cleaning up stale workout session')
    clearWorkoutSession()
    return true
  }
  return false
}
