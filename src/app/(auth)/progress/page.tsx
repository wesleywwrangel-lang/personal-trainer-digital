'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, Target, Award } from 'lucide-react'

interface ProgressData {
  weeks: number
  workoutFrequency: number
  averageCalories: number
  consistencyScore: number
  achievements: string[]
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Mock progress data - in real app, calculate from actual data
      const mockProgress: ProgressData = {
        weeks: 4,
        workoutFrequency: 4.2,
        averageCalories: 1850,
        consistencyScore: 85,
        achievements: [
          'Primeira semana completa',
          'Meta calórica atingida 5 dias',
          'Treino consistente'
        ]
      }

      setProgress(mockProgress)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando progresso...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Seu Progresso
        </h1>
        <p className="text-gray-600 mt-2">
          Acompanhe sua evolução semanal
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semanas de Treino</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.weeks}</div>
            <p className="text-xs text-muted-foreground">
              semanas consecutivas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.workoutFrequency}</div>
            <p className="text-xs text-muted-foreground">
              treinos por semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calorias Médias</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.averageCalories}</div>
            <p className="text-xs text-muted-foreground">
              kcal por dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistência</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.consistencyScore}%</div>
            <p className="text-xs text-muted-foreground">
              score geral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback da Semana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">🎉 Boa consistência esta semana!</p>
            <p className="text-green-700 text-sm">Você manteve uma frequência de treino excelente.</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">📈 Seu treino evoluiu!</p>
            <p className="text-blue-700 text-sm">Aumentamos a intensidade baseada no seu progresso.</p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-800 font-medium">🥗 Alimentação equilibrada</p>
            <p className="text-purple-700 text-sm">Média calórica consistente com suas metas.</p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Conquistas</CardTitle>
          <CardDescription>
            Suas conquistas recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress?.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Badge variant="secondary" className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  Conquista
                </Badge>
                <span className="text-sm">{achievement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Evolution Chart (Mock) */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Semanal</CardTitle>
          <CardDescription>
            Seu progresso ao longo das semanas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 70, 75, 80].map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${value}%` }}
                ></div>
                <span className="text-xs mt-2">Semana {index + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center mt-4">
            Consistência de treino (%)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}