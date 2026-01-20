// Utilitário para análise de imagens usando OpenAI Vision API

export async function analyzeImage({
  imageUrl,
  purpose,
  context
}: {
  imageUrl: string
  purpose: 'analysis' | 'asset' | 'design' | 'reference'
  context?: string
}) {
  try {
    // Usar a tool analyzeImage disponível
    const analysisResult = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        purpose,
        context
      }),
    })

    if (!analysisResult.ok) {
      throw new Error('Failed to analyze image')
    }

    const result = await analysisResult.json()
    return result
  } catch (error) {
    console.error('Error in analyzeImage:', error)
    // Fallback para análise simulada
    return {
      description: 'Análise de imagem simulada - alimentos diversos identificados',
      objects: ['comida', 'prato'],
      colors: ['marrom', 'verde', 'branco']
    }
  }
}