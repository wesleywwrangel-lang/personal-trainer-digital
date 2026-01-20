'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogOut, Save } from 'lucide-react'

interface Profile {
  id: string
  name: string
  age: number
  weight: number
  height: number
  goal: string
  level: string
  frequency: number
  workout_type: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          age: profile.age,
          weight: profile.weight,
          height: profile.height,
          goal: profile.goal,
          level: profile.level,
          frequency: profile.frequency,
          workout_type: profile.workout_type
        })
        .eq('id', profile.id)

      if (error) throw error

      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>
  }

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Perfil não encontrado</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Meu Perfil
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas informações pessoais
        </p>
      </div>

      <form onSubmit={updateProfile} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Dados básicos para personalização do treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="goal">Objetivo</Label>
                <Select
                  value={profile.goal}
                  onValueChange={(value) => setProfile({ ...profile, goal: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emagrecer">Emagrecer</SelectItem>
                    <SelectItem value="ganhar_massa">Ganhar Massa</SelectItem>
                    <SelectItem value="manter">Manter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferências de Treino</CardTitle>
            <CardDescription>
              Configure seu nível e frequência de treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Nível</Label>
                <Select
                  value={profile.level}
                  onValueChange={(value) => setProfile({ ...profile, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequência Semanal</Label>
                <Select
                  value={profile.frequency.toString()}
                  onValueChange={(value) => setProfile({ ...profile, frequency: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="4">4 dias</SelectItem>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="6">6 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="workout_type">Tipo de Treino</Label>
              <Select
                value={profile.workout_type}
                onValueChange={(value) => setProfile({ ...profile, workout_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academia">Academia</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={saving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </form>
    </div>
  )
}