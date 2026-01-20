'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, Repeat, CheckCircle } from 'lucide-react'
import { getTodaysWorkout, generateWeeklyWorkout } from '@/lib/workout-generator'
import { Exercise } from '@/lib/types'

interface Workout {
  id: string
  name: string
  exercises: Exercise[]
}

export default function WorkoutPage() {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchWorkout()
  }, [])

  const fetchWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Generate workout if needed
        await generateWeeklyWorkout(user.id, profile)

        // Fetch today's workout
        const todaysWorkout = await getTodaysWorkout(user.id)
        if (todaysWorkout) {
          setWorkout({
            id: todaysWorkout.id,
            name: todaysWorkout.exercises?.length > 0 ? `Treino - ${new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}` : 'Dia de Descanso',
            exercises: todaysWorkout.exercises || []
          })
        }
      }
    } catch (error) {
      console.error('Error fetching workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const markExerciseComplete = async (exerciseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !workout) return

      // Update local state
      setCompletedExercises(prev => new Set([...prev, exerciseId]))

      // Save to database
      await supabase
        .from('workout_progress')
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          exercise_id: exerciseId,
          completed: true,
          completed_at: new Date().toISOString()
        })

    } catch (error) {
      console.error('Error marking exercise complete:', error)
    }
  }

  const finishWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mark workout as completed for today
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('daily_goals')
        .upsert({
          user_id: user.id,
          date: today,
          workout_completed: true
        }, { onConflict: 'user_id,date' })

      alert('Treino finalizado com sucesso!')
    } catch (error) {
      console.error('Error finishing workout:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando treino...</div>
  }

  if (!workout || workout.exercises.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dia de Descanso</h1>
        <p className="text-gray-600">Hoje é seu dia de recuperação. Descanse e recupere as energias!</p>
        <Button onClick={() => window.location.reload()}>Verificar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {workout.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Execute os exercícios abaixo na ordem indicada
        </p>
      </div>

      <div className="space-y-4">
        {workout.exercises.map((exercise, index) => (
          <Card key={exercise.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Badge variant="outline" className="mr-3">
                    {index + 1}
                  </Badge>
                  {exercise.name}
                  {completedExercises.has(exercise.id) && (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                  )}
                </CardTitle>
                {!completedExercises.has(exercise.id) && (
                  <Button
                    size="sm"
                    onClick={() => markExerciseComplete(exercise.id)}
                  >
                    Concluído
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Repeat className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="font-semibold">{exercise.sets} séries</span>
                </div>
                <div className="flex flex-col items-center">
                  <Play className="h-5 w-5 text-green-500 mb-1" />
                  <span className="font-semibold">{exercise.reps} reps</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-5 w-5 text-orange-500 mb-1" />
                  <span className="font-semibold">{exercise.rest} descanso</span>
                </div>
              </div>

              <p className="text-gray-700">{exercise.description}</p>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Músculos trabalhados:</span>
                {exercise.muscles?.map((muscle, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                Como Executar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" className="px-8" onClick={finishWorkout}>
          Finalizar Treino
        </Button>
      </div>
    </div>
  )
}