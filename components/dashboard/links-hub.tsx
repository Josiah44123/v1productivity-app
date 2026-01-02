"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExternalLink, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Now TS won't yell at us

interface Link {
  id: string
  title: string
  url: string
  category: string
  icon?: string 
}

const DEFAULT_LINKS = [
  // Educational Stuff
  {
    id: "1",
    title: "Canvas LMS",
    url: "https://dlsl.instructure.com",
    category: "Educational",
  },
  {
    id: "2",
    title: "Google Docs",
    url: "https://docs.google.com",
    category: "Educational",
  },
  {
    id: "3",
    title: "YouTube",
    url: "https://youtube.com",
    category: "Educational",
  },

  // Work & Socials
  {
    id: "4",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/josiahlamuelrosell/",
    category: "Professional",
  },
  {
    id: "5",
    title: "GitHub",
    url: "https://github.com/Josiah44123",
    category: "Professional",
  },

  // The AI Squad
  {
    id: "6",
    title: "ChatGPT",
    url: "https://chatgpt.com",
    category: "AI Tools",
  },
  {
    id: "7",
    title: "Google Gemini",
    url: "https://gemini.google.com",
    category: "AI Tools",
  },
  {
    id: "8",
    title: "Grok (xAI)",
    url: "https://x.com/i/grok",
    category: "AI Tools",
  },
  {
    id: "9",
    title: "DeepSeek",
    url: "https://deepseek.com",
    category: "AI Tools",
  },
  {
    id: "10",
    title: "Claude",
    url: "https://claude.ai",
    category: "AI Tools",
  },

  // Me, Myself, and I
  {
    id: "11",
    title: "My Portfolio",
    url: "https://josiahrosell.vercel.app",
    category: "Portfolio",
  },
]

export function LinksHub() {
  // Hooking into local storage so we don't lose data on refresh
  const [links, setLinks] = useLocalStorage<Link[]>("quick-links", DEFAULT_LINKS)
  
  // State for the form inputs
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newCategory, setNewCategory] = useState("AI Tools")
  const [newIcon, setNewIcon] = useState("") 

  // Extract unique categories so we can map over them later
  const categories = Array.from(new Set(links.map((l) => l.category)))

  // Making things look pretty with gradients
  const categoryGradients: Record<string, string> = {
    "AI Tools": "from-cyan-300 via-blue-400 to-purple-500",
    Educational: "from-emerald-300 via-teal-400 to-cyan-500",
    Professional: "from-orange-300 via-amber-400 to-red-500",
    Portfolio: "from-purple-300 via-pink-400 to-rose-500",
    Certifications: "from-yellow-300 via-orange-400 to-amber-500",
    Other: "from-indigo-300 via-purple-400 to-pink-500",
  }

  // Matching borders to the gradients above
  const categoryBorders: Record<string, string> = {
    "AI Tools": "border-blue-glow",
    Educational: "border-teal-glow",
    Professional: "border-orange-glow",
    Portfolio: "border-purple-glow",
    Certifications: "border-yellow-400/40",
    Other: "border-indigo-glow",
  }

  const addLink = () => {
    // Don't add empty garbage
    if (!newTitle.trim() || !newUrl.trim()) return

    // Fix the URL if the user forgot the http part
    const formattedUrl = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`

    const link: Link = {
      id: Date.now().toString(),
      title: newTitle,
      url: formattedUrl,
      category: newCategory,
      // If they gave us an emoji, use it. If not, fallback to the chain icon later.
      icon: newIcon || "🔗", 
    }

    setLinks([...links, link])
    
    // Clear the form so it's ready for the next one
    setNewTitle("")
    setNewUrl("")
    setNewIcon("")
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
  }

  // The magic sauce: fetching high-quality logos
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      // Google is our backup plan if Unavatar fails
      const googleFallback = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
      // Unavatar usually has better transparent logos
      return `https://unavatar.io/${domain}?fallback=${encodeURIComponent(googleFallback)}`;
    } catch (e) {
      // If the URL is totally broken, just give 'em the Google G
      return `https://unavatar.io/google.com` 
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Quick Links
        </h1>
        <p className="text-blue-300/70 mt-2">One-click access to all your tools and platforms</p>
      </div>

      {/* Input Form */}
      <Card className="border-2 border-orange-500/40 glow-card">
        <CardHeader>
          <CardTitle className="text-orange-300">Add New Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Link title (e.g., ChatGPT)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-input border-blue-500/40"
          />
          <Input
            placeholder="URL (e.g., https://chatgpt.com)..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addLink()}
            className="bg-input border-blue-500/40"
          />
          
          <div className="grid grid-cols-3 gap-3">
             {/* Optional Emoji Input */}
             <div>
              <label className="text-xs text-blue-300/70 mb-2 block">Icon (Optional)</label>
              <Input
                placeholder="😀"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="bg-input border-blue-500/40 text-center px-2"
              />
            </div>
            {/* Category Dropdown */}
            <div className="col-span-2">
              <label className="text-xs text-blue-300/70 mb-2 block">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-blue-500/40 rounded-md outline-none text-sm bg-input"
              >
                <option>AI Tools</option>
                <option>Educational</option>
                <option>Professional</option>
                <option>Portfolio</option>
                <option>Certifications</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <Button
            onClick={addLink}
            className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </Button>
        </CardContent>
      </Card>

      {/* Links Display Grid */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h2
              className={`text-lg font-semibold mb-4 bg-gradient-to-r ${categoryGradients[category] || "from-blue-400 to-orange-400"} bg-clip-text text-transparent uppercase tracking-wider`}
            >
              {category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {links
                .filter((l) => l.category === category)
                .map((link) => (
                  <Card
                    key={link.id}
                    className={`border-2 border-transparent hover:${categoryBorders[category] || "border-blue-glow"} glow-card hover:glow-accent transition-all group cursor-pointer relative overflow-hidden h-full animate-in fade-in duration-300`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        
                        {/* SMART IMAGE LOGIC:
                            1. Try to fetch the logo from the URL.
                            2. If it loads, show it.
                            3. If it fails (onError), hide the image tag.
                            4. The span below acts as a background layer. If the image is hidden, the emoji pops through.
                        */}
                        <div className="mb-3 h-10 w-10 flex items-center justify-start p-1 relative">
                            <img 
                                src={getFaviconUrl(link.url)} 
                                alt={link.title} 
                                className="w-full h-full object-contain absolute inset-0 transition-opacity duration-300 z-10"
                                onError={(e) => {
                                  // Image busted? Hide it so the emoji can shine
                                  (e.target as HTMLImageElement).style.opacity = '0';
                                }}
                            />
                            {/* Fallback Emoji layer */}
                            <span className="text-3xl absolute inset-0 flex items-center justify-center opacity-50 grayscale-0 z-0">
                                {link.icon || "🔗"}
                            </span>
                        </div>

                        <h3 className="font-semibold text-sm line-clamp-2 flex-1">{link.title}</h3>

                        {/* Hover Actions */}
                        <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs text-blue-300 font-medium text-center transition-colors active:scale-95 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 transition-colors active:scale-95"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}