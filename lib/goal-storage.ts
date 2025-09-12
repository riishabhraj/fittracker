export interface Goal {
  id: string
  title: string
  description?: string
  type: 'strength' | 'habit' | 'consistency' | 'bodyweight'
  target: number
  current: number
  unit: string
  category: string
  createdDate: string
  targetDate?: string
  completed: boolean
  completedDate?: string
  icon: string
  color?: string
}

export interface StrengthGoal extends Goal {
  type: 'strength'
  exerciseName: string
  metric: 'weight' | 'reps' | 'volume'
}

export interface HabitGoal extends Goal {
  type: 'habit'
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  lastCompletedDate?: string
}

const STORAGE_KEY = 'fittracker_goals'

// Goal operations
export const saveGoal = (goal: Goal): void => {
  try {
    const goals = getGoals()
    const existingIndex = goals.findIndex(g => g.id === goal.id)
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal
    } else {
      goals.push(goal)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('goalDataChanged'))
  } catch (error) {
    console.error('Failed to save goal:', error)
  }
}

export const getGoals = (): Goal[] => {
  try {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get goals:', error)
    return []
  }
}

export const getGoalById = (id: string): Goal | null => {
  const goals = getGoals()
  return goals.find(g => g.id === id) || null
}

export const deleteGoal = (id: string): void => {
  try {
    const goals = getGoals().filter(g => g.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    window.dispatchEvent(new CustomEvent('goalDataChanged'))
  } catch (error) {
    console.error('Failed to delete goal:', error)
  }
}

export const updateGoalProgress = (id: string, newProgress: number): void => {
  try {
    const goals = getGoals()
    const goalIndex = goals.findIndex(g => g.id === id)
    
    if (goalIndex >= 0) {
      const goal = goals[goalIndex]
      goal.current = newProgress
      
      // Check if goal is completed
      if (newProgress >= goal.target && !goal.completed) {
        goal.completed = true
        goal.completedDate = new Date().toISOString()
      } else if (newProgress < goal.target && goal.completed) {
        goal.completed = false
        goal.completedDate = undefined
      }
      
      goals[goalIndex] = goal
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
      window.dispatchEvent(new CustomEvent('goalDataChanged'))
    }
  } catch (error) {
    console.error('Failed to update goal progress:', error)
  }
}

export const getGoalsByType = (type: Goal['type']): Goal[] => {
  return getGoals().filter(goal => goal.type === type)
}

export const getActiveGoals = (): Goal[] => {
  return getGoals().filter(goal => !goal.completed)
}

export const getCompletedGoals = (): Goal[] => {
  return getGoals().filter(goal => goal.completed)
}

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Predefined goal templates
export const strengthGoalTemplates = [
  {
    title: "Bench Press 135 lbs",
    description: "Achieve a 135 lb bench press",
    target: 135,
    unit: "lbs",
    exerciseName: "Bench Press",
    metric: "weight" as const,
    icon: "💪",
    color: "#ef4444"
  },
  {
    title: "Squat Body Weight",
    description: "Squat your body weight",
    target: 150, // Example target
    unit: "lbs",
    exerciseName: "Squat",
    metric: "weight" as const,
    icon: "🏋️",
    color: "#3b82f6"
  },
  {
    title: "Deadlift 225 lbs",
    description: "Achieve a 225 lb deadlift",
    target: 225,
    unit: "lbs",
    exerciseName: "Deadlift",
    metric: "weight" as const,
    icon: "💥",
    color: "#8b5cf6"
  },
  {
    title: "100 Push-ups",
    description: "Complete 100 push-ups in one session",
    target: 100,
    unit: "reps",
    exerciseName: "Push-up",
    metric: "reps" as const,
    icon: "⚡",
    color: "#f59e0b"
  }
]

export const habitGoalTemplates = [
  {
    title: "Workout 4x per week",
    description: "Maintain consistent workout schedule",
    target: 4,
    unit: "workouts",
    frequency: "weekly" as const,
    icon: "🎯",
    color: "#10b981"
  },
  {
    title: "Daily cardio",
    description: "30 minutes of cardio every day",
    target: 30,
    unit: "minutes",
    frequency: "daily" as const,
    icon: "🏃",
    color: "#f59e0b"
  },
  {
    title: "Track meals daily",
    description: "Log all meals for better nutrition",
    target: 1,
    unit: "entries",
    frequency: "daily" as const,
    icon: "🍎",
    color: "#ef4444"
  },
  {
    title: "10k steps daily",
    description: "Walk 10,000 steps every day",
    target: 10000,
    unit: "steps",
    frequency: "daily" as const,
    icon: "👟",
    color: "#6366f1"
  }
]

// Auto-track goals based on workout data
export const updateGoalsFromWorkout = (workout: any): void => {
  try {
    const goals = getGoals()
    let updated = false
    
    goals.forEach(goal => {
      if (goal.type === 'strength') {
        const strengthGoal = goal as StrengthGoal
        
        // Find matching exercise in workout
        const exercise = workout.exercises.find((ex: any) => 
          ex.name.toLowerCase().includes(strengthGoal.exerciseName.toLowerCase())
        )
        
        if (exercise) {
          let maxValue = 0
          
          exercise.sets.forEach((set: any) => {
            if (set.completed) {
              if (strengthGoal.metric === 'weight' && set.weight > maxValue) {
                maxValue = set.weight
              } else if (strengthGoal.metric === 'reps' && set.reps > maxValue) {
                maxValue = set.reps
              }
            }
          })
          
          if (maxValue > goal.current) {
            goal.current = maxValue
            
            if (maxValue >= goal.target && !goal.completed) {
              goal.completed = true
              goal.completedDate = new Date().toISOString()
            }
            
            updated = true
          }
        }
      } else if (goal.type === 'habit') {
        const habitGoal = goal as HabitGoal
        
        if (habitGoal.category === 'workout' && habitGoal.frequency === 'weekly') {
          // This would be handled by the weekly workout tracking logic
          // Implementation depends on specific habit tracking requirements
        }
      }
    })
    
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
      window.dispatchEvent(new CustomEvent('goalDataChanged'))
    }
  } catch (error) {
    console.error('Failed to update goals from workout:', error)
  }
}

export const clearAllGoals = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('goalDataChanged'))
  } catch (error) {
    console.error('Failed to clear goals:', error)
  }
}

// Data export/import for goals
export const exportGoalData = (): string => {
  const data = {
    goals: getGoals(),
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  }
  return JSON.stringify(data, null, 2)
}

export const importGoalData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData)
    if (data.goals && Array.isArray(data.goals)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.goals))
      window.dispatchEvent(new CustomEvent('goalDataChanged'))
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to import goal data:', error)
    return false
  }
}
