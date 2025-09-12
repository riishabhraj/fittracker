export interface Workout {
  id: string
  date: string
  name: string
  exercises: Exercise[]
  duration: number
  totalSets: number
  totalReps: number
  totalWeight: number
}

export interface Exercise {
  id: string
  name: string
  category: string
  sets: Set[]
}

export interface Set {
  reps: number
  weight: number
  completed: boolean
  restTime?: number
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  exercises: Omit<Exercise, 'sets'>[]
  color: string
  icon: string
}

// Storage keys
const STORAGE_KEYS = {
  WORKOUTS: 'fittracker_workouts',
  SETTINGS: 'fittracker_settings',
  TEMPLATES: 'fittracker_templates'
}

// Workout operations
export const saveWorkout = (workout: Workout): void => {
  try {
    const workouts = getWorkouts()
    const existingIndex = workouts.findIndex(w => w.id === workout.id)
    
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout
    } else {
      workouts.push(workout)
    }
    
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('workoutDataChanged'))
  } catch (error) {
    console.error('Failed to save workout:', error)
  }
}

export const getWorkouts = (): Workout[] => {
  try {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get workouts:', error)
    return []
  }
}

export const getWorkoutById = (id: string): Workout | null => {
  const workouts = getWorkouts()
  return workouts.find(w => w.id === id) || null
}

export const deleteWorkout = (id: string): void => {
  try {
    const workouts = getWorkouts().filter(w => w.id !== id)
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts))
    window.dispatchEvent(new CustomEvent('workoutDataChanged'))
  } catch (error) {
    console.error('Failed to delete workout:', error)
  }
}

// Statistics
export const getWorkoutStats = () => {
  const workouts = getWorkouts()
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= startOfWeek)
  
  return {
    totalWorkouts: workouts.length,
    weeklyWorkouts: thisWeekWorkouts.length,
    totalSets: workouts.reduce((sum, w) => sum + w.totalSets, 0),
    totalReps: workouts.reduce((sum, w) => sum + w.totalReps, 0),
    totalWeight: workouts.reduce((sum, w) => sum + w.totalWeight, 0),
    totalHours: Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / 60),
    currentStreak: calculateStreak(workouts),
    weeklyGoal: 4, // You can make this configurable
    avgDuration: workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0
  }
}

// Helper functions
const calculateStreak = (workouts: Workout[]): number => {
  if (workouts.length === 0) return 0
  
  const sortedDates = workouts
    .map(w => new Date(w.date).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  let streak = 0
  let currentDate = new Date()
  
  for (let i = 0; i < sortedDates.length; i++) {
    const workoutDate = new Date(sortedDates[i])
    const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak + 1) {
      break
    }
  }
  
  return streak
}

export const getRecentWorkouts = (limit: number = 5): Workout[] => {
  return getWorkouts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export const getWorkoutsByDateRange = (startDate: Date, endDate: Date): Workout[] => {
  return getWorkouts().filter(workout => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= startDate && workoutDate <= endDate
  })
}

export const getWorkoutsByWeek = (weekOffset: number = 0): Workout[] => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (weekOffset * 7)))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return getWorkoutsByDateRange(startOfWeek, endOfWeek)
}

// Generate unique IDs
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Personal Records
export const getPersonalRecords = () => {
  const workouts = getWorkouts()
  const records: { [exerciseName: string]: { weight: number, reps: number, date: string } } = {}
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          const current = records[exercise.name]
          if (!current || set.weight > current.weight || 
              (set.weight === current.weight && set.reps > current.reps)) {
            records[exercise.name] = {
              weight: set.weight,
              reps: set.reps,
              date: workout.date
            }
          }
        }
      })
    })
  })
  
  return records
}

// Date utilities
export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isThisWeek = (date: Date): boolean => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return date >= startOfWeek && date <= endOfWeek
}

// Data export/import
export const exportWorkoutData = (): string => {
  const data = {
    workouts: getWorkouts(),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }
  return JSON.stringify(data, null, 2)
}

export const importWorkoutData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData)
    if (data.workouts && Array.isArray(data.workouts)) {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(data.workouts))
      window.dispatchEvent(new CustomEvent('workoutDataChanged'))
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}

// Clear all data
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.WORKOUTS)
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    localStorage.removeItem(STORAGE_KEYS.TEMPLATES)
    window.dispatchEvent(new CustomEvent('workoutDataChanged'))
  } catch (error) {
    console.error('Failed to clear data:', error)
  }
}
