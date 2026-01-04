"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExternalLink, Plus, Trash2, Search, X, Globe, Link as LinkIcon } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Link {
  id: string
  title: string
  url: string
  category: string
  icon?: string 
}

const DEFAULT_LINKS = [
  { id: "1", title: "Canvas LMS", url: "https://dlsl.instructure.com", category: "Educational" },
  { id: "2", title: "Google Docs", url: "https://docs.google.com", category: "Educational" },
  { id: "3", title: "YouTube", url: "https://youtube.com", category: "Educational" },
  { id: "4", title: "LinkedIn", url: "https://www.linkedin.com/in/josiahlamuelrosell/", category: "Professional" },
  { id: "5", title: "GitHub", url: "https://github.com/Josiah44123", category: "Professional" },
  { id: "6", title: "ChatGPT", url: "https://chatgpt.com", category: "AI Tools" },
  { id: "7", title: "Google Gemini", url: "https://gemini.google.com", category: "AI Tools" },
  { id: "11", title: "My Portfolio", url: "https://josiahrosell.vercel.app", category: "Portfolio" },
]

// --- Color Mappings ---
const categoryBorderColors: Record<string, string> = {
    "AI Tools": "border-purple-500/30",
    "Educational": "border-blue-500/30",
    "Professional": "border-slate-400/30",
    "Portfolio": "border-orange-500/30",
    "Other": "border-emerald-500/30",
    "default": "border-white/10"
}

const categoryHoverStyles: Record<string, string> = {
     "AI Tools": "hover:border-purple-400/60 hover:shadow-[0_4px_20px_-4px_rgba(168,85,247,0.2)] group-hover:text-purple-300",
     "Educational": "hover:border-blue-400/60 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.2)] group-hover:text-blue-300",
     "Professional": "hover:border-slate-300/60 hover:shadow-[0_4px_20px_-4px_rgba(203,213,225,0.2)] group-hover:text-slate-300",
     "Portfolio": "hover:border-orange-400/60 hover:shadow-[0_4px_20px_-4px_rgba(251,146,60,0.2)] group-hover:text-orange-300",
     "Other": "hover:border-emerald-400/60 hover:shadow-[0_4px_20px_-4px_rgba(52,211,153,0.2)] group-hover:text-emerald-300",
     "default": "hover:border-white/30 group-hover:text-blue-400"
}

const categoryDotColors: Record<string, string> = {
    "AI Tools": "bg-purple-500/60",
    "Educational": "bg-blue-500/60",
    "Professional": "bg-slate-500/60",
    "Portfolio": "bg-orange-500/60",
    "Other": "bg-emerald-500/60",
    "default": "bg-white/50"
}


export function LinksHub() {
  const [links, setLinks] = useLocalStorage<Link[]>("quick-links", DEFAULT_LINKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form State
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newCategory, setNewCategory] = useState("AI Tools")
  const [newIcon, setNewIcon] = useState("") 

  // Get unique categories from current links
  const categories = Array.from(new Set(links.map((l) => l.category))).sort()

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return
    const formattedUrl = newUrl.startsWith("http") ? newUrl : `https://${newUrl}`

    const link: Link = {
      id: Date.now().toString(),
      title: newTitle,
      url: formattedUrl,
      category: newCategory,
      icon: newIcon, 
    }

    setLinks([...links, link])
    setNewTitle("")
    setNewUrl("")
    setNewIcon("")
    setIsModalOpen(false)
  }

  const deleteLink = (id: string) => {
    if(confirm("Remove this link?")) {
        setLinks(links.filter((l) => l.id !== id))
    }
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://unavatar.io/${domain}?fallback=https://www.google.com/s2/favicons?domain=${domain}`
    } catch (e) {
      return null
    }
  }

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Links</h1>
          <p className="text-muted-foreground mt-1">Access your tools and resources.</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search links..." 
                    className="pl-9 bg-secondary/30 border-transparent focus:bg-background transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-500 text-white">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Link</span>
            </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-8">
        {categories.map((category) => {
            const categoryLinks = filteredLinks.filter(l => l.category === category)
            if (categoryLinks.length === 0) return null

            // Resolve styles based on category
            const dotColor = categoryDotColors[category] || categoryDotColors.default;

            return (
                <div key={category} className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {categoryLinks.map((link) => {
                             // Resolve styles based on link category
                            const borderColor = categoryBorderColors[link.category] || categoryBorderColors.default;
                            const hoverStyle = categoryHoverStyles[link.category] || categoryHoverStyles.default;
                            
                            return (
                            <a 
                                key={link.id} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                // Applied colored borders and hover effects here
                                className={`group relative flex items-center gap-3 p-3 rounded-xl border ${borderColor} bg-white/5 hover:bg-white/10 ${hoverStyle} transition-all duration-300`}
                            >
                                {/* Icon Container */}
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-background/50 flex items-center justify-center border border-white/5 overflow-hidden">
                                    {link.icon ? (
                                        <span className="text-xl">{link.icon}</span>
                                    ) : (
                                        <img 
                                            src={getFaviconUrl(link.url) || ""} 
                                            alt="" 
                                            className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                                (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    )}
                                    {/* Fallback Icon */}
                                    <Globe className="w-5 h-5 text-muted-foreground hidden" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Title inherits color on hover via group-hover in hoverStyle */}
                                    <h3 className="font-medium text-sm truncate text-foreground/90 transition-colors">
                                        {link.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate opacity-50">
                                        {new URL(link.url).hostname.replace('www.', '')}
                                    </p>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <div className="p-2 text-muted-foreground/50 group-hover:text-inherit">
                                        <ExternalLink className="w-4 h-4" />
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            deleteLink(link.id);
                                        }}
                                        className="p-2 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </a>
                        )})}
                    </div>
                </div>
            )
        })}
        
        {filteredLinks.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
                <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No links found matching your search.</p>
            </div>
        )}
      </div>

      {/* Add Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Add New Link</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                        <Input 
                            placeholder="e.g. ChatGPT" 
                            className="bg-secondary/20 border-white/10"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">URL</label>
                        <Input 
                            placeholder="e.g. chatgpt.com" 
                            className="bg-secondary/20 border-white/10"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                            <select 
                                className="w-full h-10 px-3 rounded-md bg-secondary/20 border border-white/10 text-sm outline-none focus:border-blue-500"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            >
                                <option className="bg-zinc-900">AI Tools</option>
                                <option className="bg-zinc-900">Educational</option>
                                <option className="bg-zinc-900">Professional</option>
                                <option className="bg-zinc-900">Portfolio</option>
                                <option className="bg-zinc-900">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Icon (Opt)</label>
                            <Input 
                                placeholder="🚀" 
                                className="bg-secondary/20 border-white/10 text-center"
                                value={newIcon}
                                onChange={(e) => setNewIcon(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={addLink} className="flex-1 bg-blue-600 hover:bg-blue-500">Save Link</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}