'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Calendar, Flame, Target } from 'lucide-react'
import Link from 'next/link'
import { getTodaysWorkout, calculateDailyGoals } from '@/lib/workout-generator'
import { getDailyStats } from '@/lib/meal-analyzer'

interface Profile {
  name: string
  goal: string
  level: string
  frequency: number
  weight: number
  height: number
  age: number
}

interface DailyStatus {
  workout_completed: boolean
  nutrition_logged: boolean
  calories_consumed: number
  protein_consumed: number
  calorie_goal: number
  protein_goal: number
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Calculate daily goals
        const goals = calculateDailyGoals(profileData)

        // Fetch today's workout
        const todaysWorkout = await getTodaysWorkout(user.id)
        const workoutCompleted = todaysWorkout ? false : false // TODO: check actual completion

        // Fetch today's meals
        const today = new Date().toISOString().split('T')[0]
        const mealStats = await getDailyStats(user.id, today)

        setDailyStatus({
          workout_completed: workoutCompleted,
          nutrition_logged: mealStats.meals_logged > 0,
          calories_consumed: mealStats.total_calories,
          protein_consumed: mealStats.total_protein,
          calorie_goal: goals.calorieGoal,
          protein_goal: goals.proteinGoal
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {profile?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Vamos treinar e nos alimentar bem hoje?
        </p>
      </div>

      {/* Daily Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treino do Dia</CardTitle>
            {dailyStatus?.workout_completed ? (
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 ml-auto" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyStatus?.workout_completed ? 'Concluído' : 'Pendente'}
            </div>
            <p className="text-xs text-muted-foreground">
              Treino de hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alimentação</CardTitle>
            {dailyStatus?.nutrition_logged ? (
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 ml-auto" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyStatus?.nutrition_logged ? 'Registrada' : 'Pendente'}
            </div>
            <p className="text-xs text-muted-foreground">
              Refeições de hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Resumo do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Flame className="h-5 w-5 text-orange-500 mr-2" />
              <span className="font-medium">Calorias Consumidas</span>
            </div>
            <span className="text-2xl font-bold">{dailyStatus?.calories_consumed || 0} / {dailyStatus?.calorie_goal || 0} kcal</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">Proteína Estimada</span>
            </div>
            <span className="text-2xl font-bold">{dailyStatus?.protein_consumed || 0}g / {dailyStatus?.protein_goal || 0}g</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {dailyStatus && dailyStatus.calories_consumed > dailyStatus.calorie_goal
              ? 'Você ultrapassou a meta diária!'
              : 'Você está dentro da meta!'}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/workout">
          <Button className="w-full h-16 text-lg">
            Ver Treino
          </Button>
        </Link>
        <Link href="/nutrition">
          <Button variant="outline" className="w-full h-16 text-lg">
            Registrar Refeição
          </Button>
        </Link>
        <Link href="/progress">
          <Button variant="outline" className="w-full h-16 text-lg">
            Ver Progresso
          </Button>
        </Link>
      </div>
    </div>
  )
}