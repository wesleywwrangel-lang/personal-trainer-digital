'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Camera, Upload, Flame, Target, AlertCircle } from 'lucide-react'
import { analyzeMealImage, saveMeal, getDailyStats } from '@/lib/meal-analyzer'
import { calculateDailyGoals } from '@/lib/workout-generator'

interface MealAnalysis {
  calories: number
  protein: number
  foods: string[]
  confidence: number
}

export default function NutritionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null)
  const [dailyCalories, setDailyCalories] = useState(0)
  const [dailyProtein, setDailyProtein] = useState(0)
  const [calorieGoal, setCalorieGoal] = useState(2000)
  const [proteinGoal, setProteinGoal] = useState(150)
  const [userProfile, setUserProfile] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
        const goals = calculateDailyGoals(profile)
        setCalorieGoal(goals.calorieGoal)
        setProteinGoal(goals.proteinGoal)

        // Get today's stats
        const today = new Date().toISOString().split('T')[0]
        const stats = await getDailyStats(user.id, today)
        setDailyCalories(stats.total_calories)
        setDailyProtein(stats.total_protein)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeMeal = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    try {
      // Upload image to Supabase Storage first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName)

      // Analyze the image
      const analysisResult = await analyzeMealImage(publicUrl)
      setAnalysis(analysisResult)

    } catch (error) {
      console.error('Error analyzing meal:', error)
      alert('Erro ao analisar a refeição. Tente novamente.')
    } finally {
      setAnalyzing(false)
    }
  }

  const saveMealToDb = async () => {
    if (!analysis || !preview) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Save meal data
      await saveMeal(user.id, preview, analysis)

      // Update daily totals
      setDailyCalories(prev => prev + analysis.calories)
      setDailyProtein(prev => prev + analysis.protein)

      // Reset form
      setSelectedFile(null)
      setPreview(null)
      setAnalysis(null)

      alert('Refeição salva com sucesso!')

    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Erro ao salvar refeição. Tente novamente.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Controle de Alimentação
        </h1>
        <p className="text-gray-600 mt-2">
          Tire uma foto da sua refeição para estimar calorias automaticamente
        </p>
      </div>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Diário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center">
                <Flame className="h-5 w-5 text-orange-500 mr-2" />
                Calorias
              </span>
              <span className="font-bold">{dailyCalories} / {calorieGoal} kcal</span>
            </div>
            <Progress value={(dailyCalories / calorieGoal) * 100} className="h-3" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center">
                <Target className="h-5 w-5 text-blue-500 mr-2" />
                Proteína
              </span>
              <span className="font-bold">{dailyProtein}g / {proteinGoal}g</span>
            </div>
            <Progress value={(dailyProtein / proteinGoal) * 100} className="h-3" />
          </div>

          <p className="text-sm text-gray-600 text-center">
            {dailyCalories > calorieGoal ? 'Você ultrapassou a meta diária!' : 'Você está dentro da meta!'}
          </p>
        </CardContent>
      </Card>

      {/* Meal Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Refeição</CardTitle>
          <CardDescription>
            Tire uma foto do seu prato para análise automática com IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Meal preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                    setAnalysis(null)
                  }}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div
                className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  Clique para tirar uma foto ou fazer upload
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Escolher Arquivo
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
              >
                <Camera className="h-4 w-4 mr-2" />
                Tirar Foto
              </Button>
            </div>
          </div>

          {selectedFile && !analysis && (
            <Button
              onClick={analyzeMeal}
              disabled={analyzing}
              className="w-full"
            >
              {analyzing ? 'Analisando...' : 'Analisar Refeição'}
            </Button>
          )}

          {analyzing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Analisando sua refeição com IA...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Análise</CardTitle>
            <CardDescription>
              Estimativa baseada na imagem (valores aproximados)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Estes valores são estimativas aproximadas baseadas em padrões comuns de alimentos.
                Para precisão nutricional, consulte um profissional.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.calories} kcal
                </div>
                <p className="text-sm text-gray-600">Calorias estimadas</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.protein}g
                </div>
                <p className="text-sm text-gray-600">Proteína estimada</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Alimentos identificados:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.foods.map((food, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={saveMealToDb} className="w-full">
              Salvar Refeição
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}