export interface UserProfile {
  id: string
  name: string
  age: number
  weight: number
  height: number
  goal: 'emagrecer' | 'ganhar_massa' | 'manter'
  level: 'iniciante' | 'intermediario'
  frequency: number // 3-5 dias por semana
  workout_type: 'academia' | 'casa'
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  week: number
  day: number
  exercises: Exercise[]
  created_at: string
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: string // e.g., "10-12"
  rest: string // e.g., "60s"
  description: string
  muscles: string[]
  video_url?: string
  image_url?: string
}

export interface Meal {
  id: string
  user_id: string
  date: string
  image_url: string
  estimated_calories: number
  estimated_protein: number
  created_at: string
}

export interface DailyStats {
  date: string
  total_calories: number
  total_protein: number
  workout_completed: boolean
  meals_logged: number
}