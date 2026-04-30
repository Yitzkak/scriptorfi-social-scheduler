'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { parseStrategy } from '../lib/parser'
import { DayContent, PlatformContent } from '../lib/types'
import { 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Copy, 
  Download, 
  Sparkles, 
  ImageIcon, 
  Instagram, 
  Music2, 
  Globe, 
  CheckCircle2, 
  Circle, 
  Menu,
  X,
  Settings,
  ArrowUpRight,
  LayoutDashboard,
  Palette,
  FileText,
  Sun,
  Moon,
} from 'lucide-react'

type Platform = 'instagram' | 'tiktok' | 'bluesky'

const PLATFORM_CONFIG: Record<Platform, { icon: any; label: string; color: string; gradient: string }> = {
  instagram: { icon: Instagram, label: 'Instagram', color: 'from-pink-500 via-red-500 to-yellow-500', gradient: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500' },
  tiktok: { icon: Music2, label: 'TikTok', color: 'from-cyan-400 via-pink-400 to-purple-500', gradient: 'bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-500' },
  bluesky: { icon: Globe, label: 'Bluesky', color: 'from-blue-400 to-blue-600', gradient: 'bg-gradient-to-r from-blue-400 to-blue-600' },
}

type Tab = 'content' | 'preview' | 'images'

export default function Home() {
  const [days, setDays] = useState<DayContent[]>([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram')
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [showUpload, setShowUpload] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Record<string, string[]>>({})
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [openaiKey, setOpenaiKey] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved state
  useEffect(() => {
    const savedDays = localStorage.getItem('scriptorfi-days')
    const savedImages = localStorage.getItem('scriptorfi-images')
    const savedCompleted = localStorage.getItem('scriptorfi-completed')
    const savedKey = localStorage.getItem('scriptorfi-openai-key')
    if (savedDays) {
      try {
        const parsed = JSON.parse(savedDays)
        setDays(parsed)
        setShowUpload(false)
        return
      } catch {}
    }
    if (savedImages) setGeneratedImages(JSON.parse(savedImages))
    if (savedCompleted) setCompletedTasks(JSON.parse(savedCompleted))
    if (savedKey) setOpenaiKey(savedKey)

    // Preload default strategy
    fetch('/default-strategy.md')
      .then(r => r.text())
      .then(handleFileUpload)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (days.length > 0) localStorage.setItem('scriptorfi-days', JSON.stringify(days))
  }, [days])
  useEffect(() => {
    localStorage.setItem('scriptorfi-images', JSON.stringify(generatedImages))
  }, [generatedImages])
  useEffect(() => {
    localStorage.setItem('scriptorfi-completed', JSON.stringify(completedTasks))
  }, [completedTasks])

  // Auto-hide messages
  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(null); setSuccess(null) }, 4000)
      return () => clearTimeout(t)
    }
  }, [error, success])

  const currentDay = days[selectedDay]
  const currentPlatform = currentDay?.[activePlatform]
  const completedCount = currentDay ? ['instagram', 'tiktok', 'bluesky'].filter(p => completedTasks.includes(`${selectedDay}-${p}`)).length : 0

  const handleFileUpload = useCallback((content: string) => {
    try {
      const parsed = parseStrategy(content)
      if (parsed.length === 0) {
        setError('Could not parse any days. Check the format.')
        return
      }
      setDays(parsed)
      setSelectedDay(0)
      setShowUpload(false)
      setSuccess(`Loaded ${parsed.length} days of content!`)
    } catch (e) {
      setError('Failed to parse: ' + (e as Error).message)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => handleFileUpload(e.target?.result as string)
      reader.readAsText(file)
    }
  }, [handleFileUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => handleFileUpload(e.target?.result as string)
      reader.readAsText(file)
    }
  }, [handleFileUpload])

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1500)
    } catch {}
  }, [])

  const generateImage = useCallback(async (prompt: string) => {
    if (!openaiKey) {
      setError('Set your OpenAI API key in Settings (⚙️)')
      setShowSettings(true)
      return
    }
    
    const key = `${selectedDay}-${activePlatform}-${Date.now()}`
    setGenerating(key)
    setError(null)

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openai-key': openaiKey,
        },
        body: JSON.stringify({
          prompt: `Social media graphic for Scriptorfi (human-reviewed transcription service). ${prompt}. Brand colors: teal #0FFCBE and black #000000. Clean, modern, minimalist design. Professional.`,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }

      const data = await res.json()
      const imageUrl = data.data[0].url
      
      setGeneratedImages(prev => ({
        ...prev,
        [`${selectedDay}-${activePlatform}`]: [
          ...(prev[`${selectedDay}-${activePlatform}`] || []),
          imageUrl
        ]
      }))
      setSuccess('Image generated! 🎉')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(null)
    }
  }, [openaiKey, selectedDay, activePlatform])

  const downloadImage = useCallback(async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {}
  }, [])

  const toggleComplete = useCallback((taskKey: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskKey) 
        ? prev.filter(t => t !== taskKey) 
        : [...prev, taskKey]
    )
  }, [])

  const resetAll = useCallback(() => {
    localStorage.clear()
    setDays([])
    setGeneratedImages({})
    setCompletedTasks([])
    setShowUpload(true)
    setSelectedDay(0)
    setError(null)
  }, [])

  if (showUpload) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-black via-gray-950 to-black">
        <div 
          className="w-full max-w-lg text-center animate-fade-in"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/20 flex items-center justify-center">
            <FileText className="w-10 h-10 text-teal" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="gradient-text">Social Scheduler</span>
          </h1>
          <p className="text-gray-500 mb-2 text-lg">for Scriptorfi</p>
          <p className="text-gray-600 mb-10 text-sm">
            Upload your strategy markdown to generate and schedule 14 days of content
          </p>

          <label className="border-2 border-dashed border-gray-800 rounded-2xl p-12 md:p-16 
                       hover:border-teal/30 hover:bg-teal/[0.02] transition-all duration-300 cursor-pointer
                       group block"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="w-16 h-16 text-gray-700 group-hover:text-teal/50 mx-auto mb-6 transition-colors" />
            <p className="text-gray-500 text-sm mb-2">
              Drop your strategy file here
            </p>
            <p className="text-gray-700 text-xs">
              or click to browse &nbsp;·&nbsp; <code className="text-teal bg-teal/10 px-2 py-0.5 rounded text-xs">.md</code>
            </p>
          </label>

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm animate-fade-in">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Toast notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-[100] bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-3 text-sm shadow-2xl backdrop-blur-sm animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 z-[100] bg-teal/10 border border-teal/30 text-teal rounded-xl px-5 py-3 text-sm shadow-2xl backdrop-blur-sm animate-fade-in">
          {success}
        </div>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 z-50 h-screen bg-[#0a0a0a] border-r border-gray-800/80 transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 md:w-64 -translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-800/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal/20 border border-teal/30 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-teal" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Scheduler</h2>
              <p className="text-[10px] text-gray-500">{days.length} days loaded</p>
            </div>
          </div>
          <button className="md:hidden text-gray-500 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Day grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {days.map((day, i) => {
              const dayCompleted = ['instagram', 'tiktok', 'bluesky'].filter(
                p => completedTasks.includes(`${i}-${p}`)
              ).length
              
              return (
                <button
                  key={day.day}
                  onClick={() => { setSelectedDay(i); setSidebarOpen(false) }}
                  className={`day-card ${i === selectedDay ? 'active' : dayCompleted === 3 ? 'completed' : 'inactive'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${i === selectedDay ? 'text-teal' : 'text-gray-400'}`}>
                      Day {day.day}
                    </span>
                    {dayCompleted === 3 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                    ) : dayCompleted > 0 ? (
                      <div className="flex gap-0.5">
                        {['instagram', 'tiktok', 'bluesky'].map((p, pi) => {
                          const Icon = PLATFORM_CONFIG[p as Platform].icon
                          return (
                            <Icon key={p} className={`w-2.5 h-2.5 ${completedTasks.includes(`${i}-${p}`) ? 'text-teal' : 'text-gray-700'}`} />
                          )
                        })}
                      </div>
                    ) : (
                      <Circle className="w-3 h-3 text-gray-700" />
                    )}
                  </div>
                  <div className={`text-[10px] ${i === selectedDay ? 'text-teal/70' : 'text-gray-600'}`}>
                    {day.date}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-800/50 space-y-2 flex-shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full btn-ghost text-xs flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            {showSettings ? 'Hide Settings' : 'Settings'}
          </button>

          {showSettings && (
            <div className="card p-3 animate-fade-in">
              <div className="text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wider">OpenAI API Key</div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => {
                  setOpenaiKey(e.target.value)
                  localStorage.setItem('scriptorfi-openai-key', e.target.value)
                }}
                placeholder="sk-..."
                className="input-field text-xs"
              />
              <p className="text-[10px] text-gray-600 mt-1.5">
                Needed for image generation. Stored locally.
              </p>
            </div>
          )}

          <button
            onClick={resetAll}
            className="w-full text-[10px] text-gray-600 hover:text-gray-400 py-1.5 transition-colors"
          >
            Upload new strategy
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {currentDay && (
          <>
            {/* Top bar */}
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-gray-800/50">
              <div className="flex items-center justify-between px-4 md:px-8 py-3">
                <div className="flex items-center gap-3">
                  <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                      disabled={selectedDay === 0}
                      className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-center min-w-[120px]">
                      <h1 className="font-bold text-lg leading-tight">Day {currentDay.day}</h1>
                      <p className="text-[11px] text-gray-500">{currentDay.date}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDay(Math.min(days.length - 1, selectedDay + 1))}
                      disabled={selectedDay >= days.length - 1}
                      className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${completedCount === 3 ? 'text-teal' : 'text-gray-700'}`} />
                    <span>{completedCount}/3 platforms</span>
                  </div>
                </div>
              </div>

              {/* Platform tabs */}
              <div className="flex gap-1 px-4 md:px-8 pb-3 overflow-x-auto">
                {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((platform) => {
                  const { icon: Icon, label } = PLATFORM_CONFIG[platform]
                  const isComplete = completedTasks.includes(`${selectedDay}-${platform}`)
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => setActivePlatform(platform)}
                      className={`platform-tab whitespace-nowrap ${activePlatform === platform ? 'active' : 'inactive'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                      {isComplete && <Check className="w-3 h-3 ml-1" />}
                    </button>
                  )
                })}
              </div>

              {/* Sub tabs */}
              <div className="flex gap-4 px-4 md:px-8 border-t border-gray-800/50">
                {(['content', 'preview', 'images'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-1 py-3 text-xs font-medium border-b-2 transition-all capitalize ${
                      activeTab === tab
                        ? 'border-teal text-teal'
                        : 'border-transparent text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {tab === 'content' ? '✏️ Content' : tab === 'preview' ? '📱 Preview' : '🖼️ Images'}
                  </button>
                ))}
              </div>
            </header>

            {/* Content area */}
            <div className="p-4 md:p-8 max-w-4xl">
              {activeTab === 'content' && currentPlatform && (
                <ContentTab
                  platform={currentPlatform}
                  platformName={activePlatform}
                  dayIndex={selectedDay}
                  copiedField={copiedField}
                  copyToClipboard={copyToClipboard}
                  toggleComplete={toggleComplete}
                  isComplete={completedTasks.includes(`${selectedDay}-${activePlatform}`)}
                  generating={generating}
                  generateImage={generateImage}
                  openaiKey={openaiKey}
                />
              )}

              {activeTab === 'preview' && currentPlatform && (
                <PreviewTab
                  platform={currentPlatform}
                  platformName={activePlatform}
                />
              )}

              {activeTab === 'images' && (
                <ImagesTab
                  images={generatedImages[`${selectedDay}-${activePlatform}`] || []}
                  dayIndex={selectedDay}
                  platformName={activePlatform}
                  downloadImage={downloadImage}
                  generateImage={currentPlatform?.imagePrompt ? () => generateImage(currentPlatform.imagePrompt!) : undefined}
                  generating={generating}
                  hasPrompt={!!currentPlatform?.imagePrompt}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

/* === Content Tab === */
function ContentTab({
  platform,
  platformName,
  dayIndex,
  copiedField,
  copyToClipboard,
  toggleComplete,
  isComplete,
  generating,
  generateImage,
  openaiKey,
}: {
  platform: PlatformContent
  platformName: Platform
  dayIndex: number
  copiedField: string | null
  copyToClipboard: (text: string, field: string) => void
  toggleComplete: (key: string) => void
  isComplete: boolean
  generating: string | null
  generateImage: (prompt: string) => void
  openaiKey: string
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Image Prompt */}
      {platform.imagePrompt && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-teal" />
              <h3 className="font-semibold text-sm">Image Prompt</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(platform.imagePrompt!, `img-${dayIndex}`)}
                className="btn-ghost p-1.5"
                title="Copy prompt"
              >
                {copiedField === `img-${dayIndex}` ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => generateImage(platform.imagePrompt!)}
                disabled={generating !== null || !openaiKey}
                className="btn-primary text-xs h-8"
              >
                {generating?.startsWith(`${dayIndex}-${platformName}`) ? (
                  <div className="loading-spinner !w-3.5 !h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Generate
              </button>
            </div>
          </div>
          <div className="p-4">
            <pre className="text-sm text-gray-400 bg-black/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-sans leading-relaxed">
              {platform.imagePrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Caption */}
      {platform.caption && (
        <CopyField
          label="Caption & Hashtags"
          value={platform.caption}
          fieldKey={`cap-${dayIndex}`}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
        />
      )}

      {/* Script */}
      {platform.script && (
        <CopyField
          label="Video Script"
          value={platform.script}
          fieldKey={`scr-${dayIndex}`}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
        />
      )}

      {/* Text */}
      {platform.text && (
        <CopyField
          label="Post Content"
          value={platform.text}
          fieldKey={`txt-${dayIndex}`}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
        />
      )}

      {/* Fallback */}
      {!platform.caption && !platform.script && !platform.text && !platform.imagePrompt && (
        <CopyField
          label="Full Content"
          value={platform.raw}
          fieldKey={`raw-${dayIndex}`}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
        />
      )}

      {/* Mark complete */}
      <button
        onClick={() => toggleComplete(`${dayIndex}-${platformName}`)}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all text-sm font-medium ${
          isComplete
            ? 'bg-teal/10 border-teal/30 text-teal'
            : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-teal/20 hover:text-gray-300'
        }`}
      >
        {isComplete ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Posted ✓</span>
          </>
        ) : (
          <>
            <Circle className="w-4 h-4" />
            <span>Mark as posted</span>
          </>
        )}
      </button>
    </div>
  )
}

/* === Preview Tab === */
function PreviewTab({
  platform,
  platformName,
}: {
  platform: PlatformContent
  platformName: Platform
}) {
  const config = PLATFORM_CONFIG[platformName]

  return (
    <div className="animate-fade-in">
      <div className="max-w-sm mx-auto bg-black rounded-3xl border border-gray-800 shadow-2xl shadow-teal/5 overflow-hidden">
        {/* Phone header */}
        <div className="bg-gray-900/80 px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${config.gradient} flex items-center justify-center shadow-lg`}>
              <config.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">scriptorfi</p>
              <p className="text-[10px] text-gray-500">{config.label} · Sponsored</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-600" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {platform.caption && (
            <div className="text-sm text-gray-200 whitespace-pre-wrap mb-5 leading-relaxed">{platform.caption}</div>
          )}
          {platform.script && (
            <div className="bg-gray-900/80 rounded-xl p-4 mb-4 border border-gray-800/50">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 font-medium">Script</p>
              <p className="text-sm text-gray-400 whitespace-pre-wrap line-clamp-6 leading-relaxed">{platform.script}</p>
            </div>
          )}
          {platform.text && (
            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{platform.text}</div>
          )}
          {platform.imagePrompt && (
            <div className="bg-gray-900/80 rounded-xl p-8 flex items-center justify-center aspect-square border border-gray-800/50">
              <div className="text-center">
                <ImageIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-xs text-gray-600">Generate image to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800/50 px-4 py-3 flex items-center gap-4">
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full bg-gray-800" />
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex gap-1">
            {[1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* === Images Tab === */
function ImagesTab({
  images,
  dayIndex,
  platformName,
  downloadImage,
  generateImage,
  generating,
  hasPrompt,
}: {
  images: string[]
  dayIndex: number
  platformName: string
  downloadImage: (url: string, filename: string) => void
  generateImage?: () => void
  generating: string | null
  hasPrompt: boolean
}) {
  return (
    <div className="animate-fade-in">
      {images.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium mb-1">No images generated yet</p>
          <p className="text-gray-600 text-sm mb-6">
            {hasPrompt ? 'Go to the Content tab and click "Generate"' : 'No image prompt for this post'}
          </p>
          {generateImage && hasPrompt && (
            <button
              onClick={generateImage}
              disabled={generating !== null}
              className="btn-primary text-sm"
            >
              {generating?.startsWith(`${dayIndex}-${platformName}`) ? (
                <div className="loading-spinner !w-4 !h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((url, i) => (
            <div key={i} className="card overflow-hidden group animate-fade-in">
              <div className="aspect-square bg-gray-900 relative">
                <img
                  src={url}
                  alt={`Day ${dayIndex + 1} image ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => downloadImage(url, `scriptorfi-day${dayIndex + 1}-${i + 1}.png`)}
                    className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">Image {i + 1}</p>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-teal/60" />
                  <span className="text-[10px] text-gray-600">Generated</span>
                </div>
              </div>
            </div>
          ))}

          {generateImage && hasPrompt && (
            <button
              onClick={generateImage}
              disabled={generating !== null}
              className="card flex flex-col items-center justify-center aspect-square gap-3 hover:border-teal/20 hover:bg-teal/[0.02] transition-all cursor-pointer group"
            >
              {generating?.startsWith(`${dayIndex}-${platformName}`) ? (
                <div className="loading-spinner !w-8 !h-8" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center group-hover:bg-teal/20 transition-all">
                    <Sparkles className="w-6 h-6 text-teal" />
                  </div>
                  <p className="text-xs text-gray-500">Generate another</p>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* === Reusable CopyField === */
function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  copyToClipboard,
}: {
  label: string
  value: string
  fieldKey: string
  copiedField: string | null
  copyToClipboard: (text: string, field: string) => void
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800/50">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          {label}
        </h3>
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          className="btn-ghost text-xs h-8"
        >
          {copiedField === fieldKey ? (
            <>
              <Check className="w-3.5 h-3.5 text-teal" />
              <span className="text-teal">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <pre className="text-sm text-gray-300 bg-black/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-sans leading-relaxed">
          {value}
        </pre>
      </div>
    </div>
  )
}
