"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, Search, Star, Trash2, FolderPlus, ExternalLink, 
  BookOpen, Briefcase, Coffee 
} from "lucide-react"
import { format } from "date-fns"

// --- Types ---
interface Note {
  id: string
  title: string
  subject: string
  content: string
  createdAt: string
  starred: boolean
  type: "course" | "hobby" | "business"
  docsLink?: string
}

interface Subject {
  id: string
  name: string
  type: "course" | "hobby" | "business"
  createdAt: string
  docsLink?: string
}

interface NotesSectionProps {
  notes: Note[]
  setNotes: (notes: Note[]) => void
}

export function NotesSection({ notes = [], setNotes }: NotesSectionProps) {
  // State
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectType, setNewSubjectType] = useState<"course" | "hobby" | "business">("course")
  const [newSubjectDocsLink, setNewSubjectDocsLink] = useState("")
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Create Note State (temporary, before saving)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")

  // --- Actions ---
  const addSubject = () => {
    if (!newSubjectName.trim()) return
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      type: newSubjectType,
      createdAt: new Date().toISOString(),
      docsLink: newSubjectDocsLink || undefined,
    }
    setSubjects([...subjects, subject])
    setNewSubjectName("")
    setNewSubjectDocsLink("")
  }

  const deleteSubject = (id: string) => {
    if(confirm("Delete this subject and all its notes?")) {
        setSubjects(subjects.filter((s) => s.id !== id))
        setNotes(notes.filter((n) => n.subject !== id))
        if (selectedSubject?.id === id) setSelectedSubject(null)
    }
  }

  const createNote = () => {
    if (!newNoteTitle.trim() || !selectedSubject) return
    const note: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      subject: selectedSubject.id,
      content: "",
      createdAt: new Date().toISOString(),
      starred: false,
      type: selectedSubject.type,
    }
    setNotes([note, ...notes])
    setSelectedNote(note) // Immediately open it
    setNewNoteTitle("")
    setIsCreatingNote(false)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  const toggleStar = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n)))
    if (selectedNote?.id === id) {
      setSelectedNote(prev => prev ? { ...prev, starred: !prev.starred } : null)
    }
  }

  const updateNoteContent = (id: string, content: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, content } : n)))
    if (selectedNote?.id === id) setSelectedNote(prev => prev ? { ...prev, content } : null)
  }
  
  const updateNoteTitle = (id: string, title: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, title } : n)))
    if (selectedNote?.id === id) setSelectedNote(prev => prev ? { ...prev, title } : null)
  }

  // --- Filtering ---
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = selectedSubject ? note.subject === selectedSubject.id : true
    
    return matchesSearch && matchesSubject
  })

  // --- Icons ---
  const getSubjectIcon = (type: string) => {
      switch(type) {
          case 'course': return <BookOpen className="w-4 h-4 text-blue-400" />
          case 'business': return <Briefcase className="w-4 h-4 text-purple-400" />
          case 'hobby': return <Coffee className="w-4 h-4 text-emerald-400" />
          default: return <FolderPlus className="w-4 h-4 text-orange-400" />
      }
  }

  return (
    <div className="flex h-[800px] border border-white/10 rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm shadow-2xl">
      
      {/* --- SIDEBAR (Subjects) --- */}
      <div className="w-64 bg-secondary/10 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-lg tracking-tight mb-4">Library</h2>
            {/* Quick Add Subject */}
            <div className="space-y-2">
                <Input 
                    placeholder="New Folder..." 
                    className="h-8 text-sm bg-secondary/30 border-none"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                />
                <div className="flex gap-1">
                    {/* FIXED: Added 'bg-zinc-900 text-white' to options so they are readable in dark mode */}
                    <select 
                        className="h-8 text-xs bg-secondary/30 rounded px-2 outline-none w-full text-muted-foreground cursor-pointer"
                        value={newSubjectType}
                        onChange={(e) => setNewSubjectType(e.target.value as any)}
                    >
                        <option value="course" className="bg-zinc-900 text-white">Course</option>
                        <option value="business" className="bg-zinc-900 text-white">Business</option>
                        <option value="hobby" className="bg-zinc-900 text-white">Hobby</option>
                    </select>
                    <Button size="sm" variant="ghost" onClick={addSubject} disabled={!newSubjectName} className="h-8 px-2 hover:bg-blue-500/20 hover:text-blue-400">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button 
                onClick={() => setSelectedSubject(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${!selectedSubject ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
            >
                <FolderPlus className="w-4 h-4" />
                All Notes
            </button>
            
            <div className="pt-4 pb-2 px-3 text-xs font-medium text-muted-foreground/50 uppercase tracking-wider">Subjects</div>
            {subjects.map(subject => (
                <div key={subject.id} className="group flex items-center justify-between pr-2 rounded-md transition-all hover:bg-white/5">
                    <button 
                        onClick={() => setSelectedSubject(subject)}
                        className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm text-left truncate ${selectedSubject?.id === subject.id ? 'text-blue-400 font-medium' : 'text-muted-foreground'}`}
                    >
                        {getSubjectIcon(subject.type)}
                        {subject.name}
                    </button>
                    {selectedSubject?.id === subject.id && (
                        <div className="flex gap-1">
                            {subject.docsLink && (
                                <a href={subject.docsLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-blue-400 transition-colors">
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            <button onClick={() => deleteSubject(subject.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* --- NOTE LIST (Middle Column) --- */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-background/30">
        <div className="p-4 border-b border-white/5 space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
                {selectedSubject ? selectedSubject.name : "All Notes"}
            </h3>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search notes..." 
                    className="pl-9 h-9 bg-secondary/20 border-transparent focus:bg-background transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground/50 p-6">
                    <p className="text-sm">No notes found</p>
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {filteredNotes.map(note => (
                        <button
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`w-full text-left p-4 transition-all hover:bg-white/5 ${selectedNote?.id === note.id ? 'bg-blue-900/10 border-l-2 border-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' : 'border-l-2 border-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-medium text-sm truncate pr-2 ${selectedNote?.id === note.id ? 'text-blue-200' : 'text-foreground'}`}>{note.title}</h4>
                                {note.starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8">
                                {note.content || "No content..."}
                            </p>
                            <div className="text-[10px] text-muted-foreground/60 flex justify-between items-center">
                                <span>{format(new Date(note.createdAt), "MMM d")}</span>
                                {!selectedSubject && (
                                    <span className="bg-secondary/50 px-1.5 py-0.5 rounded capitalize">{
                                        subjects.find(s => s.id === note.subject)?.name
                                    }</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- EDITOR (Right Column) --- */}
      <div className="flex-1 flex flex-col bg-background/50">
        {selectedNote ? (
            <>
                {/* Editor Toolbar */}
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-secondary/5">
                    <span className="text-xs text-muted-foreground">
                        Edited {format(new Date(), "h:mm a")}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-400" onClick={() => toggleStar(selectedNote.id)}>
                            <Star className={`w-4 h-4 ${selectedNote.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-400" onClick={() => deleteNote(selectedNote.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <input 
                        className="w-full bg-transparent text-3xl font-bold border-none outline-none placeholder:text-muted-foreground/30 mb-6"
                        placeholder="Note Title"
                        value={selectedNote.title}
                        onChange={(e) => updateNoteTitle(selectedNote.id, e.target.value)}
                    />
                    <Textarea 
                        className="w-full h-full min-h-[500px] resize-none border-none outline-none focus-visible:ring-0 bg-transparent text-base leading-relaxed p-0 placeholder:text-muted-foreground/30"
                        placeholder="Start typing..."
                        value={selectedNote.content}
                        onChange={(e) => updateNoteContent(selectedNote.id, e.target.value)}
                    />
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 p-8">
                {selectedSubject ? (
                    isCreatingNote ? (
                        <div className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95">
                            <h3 className="text-lg font-medium text-foreground text-center">New Note</h3>
                            <Input 
                                autoFocus
                                placeholder="Note Title..." 
                                className="bg-secondary/20 border-white/10"
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && createNote()}
                            />
                            <div className="flex gap-2">
                                <Button variant="ghost" className="flex-1" onClick={() => setIsCreatingNote(false)}>Cancel</Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={createNote}>Create</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <BookOpen className="w-16 h-16 mx-auto text-blue-400/20" />
                            <p>Select a note to view or create a new one.</p>
                            <Button onClick={() => setIsCreatingNote(true)} className="gap-2">
                                <Plus className="w-4 h-4" /> Create New Note
                            </Button>
                        </div>
                    )
                ) : (
                    <div className="text-center">
                        <p>Select a Subject from the sidebar to view notes.</p>
                    </div>
                )}
            </div>
        )}
      </div>

    </div>
  )
}