import { supabase } from '@/lib/supabase'
import { UserProfile, Exercise, Workout } from '@/lib/types'

// Função para gerar treino semanal baseado no perfil
export async function generateWeeklyWorkout(userId: string, profile: UserProfile): Promise<void> {
  try {
    // Buscar exercícios disponíveis baseados no nível e tipo de treino
    const { data: availableExercises, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('difficulty', profile.level)
      .or(`equipment.cs.{},equipment.ov.{${profile.workout_type === 'casa' ? 'barra,banco,máquina' : ''}}`)

    if (error) throw error

    // Obter a semana atual
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))

    // Para cada dia da semana baseado na frequência
    const workoutDays = getWorkoutDays(profile.frequency)

    for (const day of workoutDays) {
      // Selecionar exercícios apropriados para o dia
      const dayExercises = selectExercisesForDay(availableExercises || [], day, profile.goal)

      // Criar workout para o dia
      const workoutData = {
        user_id: userId,
        week: currentWeek,
        day: day,
        name: getWorkoutName(day, profile.goal),
        exercises: dayExercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          sets: getSetsForGoal(profile.goal, profile.level),
          reps: getRepsForGoal(profile.goal, profile.level),
          rest: getRestForGoal(profile.goal),
          description: ex.description,
          muscles: ex.muscles,
          video_url: ex.video_url,
          image_url: ex.image_url
        }))
      }

      await supabase
        .from('workouts')
        .upsert(workoutData, { onConflict: 'user_id,week,day' })
    }
  } catch (error) {
    console.error('Error generating weekly workout:', error)
  }
}

// Função auxiliar para determinar dias de treino
function getWorkoutDays(frequency: number): number[] {
  const days = [1, 3, 5] // Segunda, Quarta, Sexta (padrão)
  return days.slice(0, frequency)
}

// Função para selecionar exercícios apropriados para o dia
function selectExercisesForDay(exercises: any[], day: number, goal: string): any[] {
  // Lógica simplificada de seleção de exercícios
  const muscleGroups = {
    1: ['peito', 'tríceps'], // Dia 1: Peito e Tríceps
    3: ['costas', 'bíceps'], // Dia 3: Costas e Bíceps
    5: ['pernas', 'ombros'] // Dia 5: Pernas e Ombros
  }

  const targetMuscles = muscleGroups[day as keyof typeof muscleGroups] || ['peito', 'costas']

  return exercises
    .filter(ex => ex.muscles.some((m: string) => targetMuscles.includes(m)))
    .slice(0, 4) // Máximo 4 exercícios por dia
}

// Função para obter nome do treino
function getWorkoutName(day: number, goal: string): string {
  const dayNames = {
    1: 'Segunda-feira',
    3: 'Quarta-feira',
    5: 'Sexta-feira'
  }

  const goalNames = {
    'emagrecer': 'Queima de Gordura',
    'ganhar_massa': 'Ganho de Massa',
    'manter': 'Manutenção'
  }

  return `${goalNames[goal as keyof typeof goalNames]} - ${dayNames[day as keyof typeof dayNames]}`
}

// Função para determinar séries baseado no objetivo e nível
function getSetsForGoal(goal: string, level: string): number {
  if (goal === 'ganhar_massa') return level === 'iniciante' ? 3 : 4
  if (goal === 'emagrecer') return level === 'iniciante' ? 3 : 4
  return 3 // manter
}

// Função para determinar repetições baseado no objetivo e nível
function getRepsForGoal(goal: string, level: string): string {
  if (goal === 'ganhar_massa') return level === 'iniciante' ? '8-12' : '6-10'
  if (goal === 'emagrecer') return level === 'iniciante' ? '12-15' : '10-12'
  return '10-12' // manter
}

// Função para determinar descanso baseado no objetivo
function getRestForGoal(goal: string): string {
  if (goal === 'ganhar_massa') return '90s'
  if (goal === 'emagrecer') return '60s'
  return '75s' // manter
}

// Função para buscar treino do dia atual
export async function getTodaysWorkout(userId: string): Promise<Workout | null> {
  try {
    const today = new Date().getDay() || 7 // 0 = Domingo -> 7
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .eq('week', currentWeek)
      .eq('day', today)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found

    return data ? {
      id: data.id,
      user_id: data.user_id,
      week: data.week,
      day: data.day,
      exercises: data.exercises,
      created_at: data.created_at
    } : null
  } catch (error) {
    console.error('Error fetching today\'s workout:', error)
    return null
  }
}

// Função para calcular metas diárias baseadas no perfil
export function calculateDailyGoals(profile: UserProfile) {
  // Cálculo simplificado de TMB (Taxa Metabólica Basal) usando fórmula de Mifflin-St Jeor
  const tmb = profile.goal === 'emagrecer'
    ? (10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5) * 1.2 - 500
    : profile.goal === 'ganhar_massa'
    ? (10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5) * 1.2 + 300
    : (10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5) * 1.2

  const proteinGoal = profile.weight * (profile.goal === 'ganhar_massa' ? 2.2 : 1.8) // g/kg

  return {
    calorieGoal: Math.round(tmb),
    proteinGoal: Math.round(proteinGoal)
  }
}