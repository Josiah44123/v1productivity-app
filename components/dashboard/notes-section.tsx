"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Star, Trash2, FolderPlus, ExternalLink } from "lucide-react"
import { format } from "date-fns"

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
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectType, setNewSubjectType] = useState<"course" | "hobby" | "business">("course")
  const [newSubjectDocsLink, setNewSubjectDocsLink] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "course" | "hobby" | "business">("all")

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
    setSubjects(subjects.filter((s) => s.id !== id))
    setNotes(notes.filter((n) => n.subject !== id))
    if (selectedSubject?.id === id) {
      setSelectedSubject(null)
    }
  }

  const addNote = () => {
    if (!newTitle.trim() || !newContent.trim() || !selectedSubject) return
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle,
      subject: selectedSubject.id,
      content: newContent,
      createdAt: new Date().toISOString(),
      starred: false,
      type: selectedSubject.type,
    }
    setNotes([...notes, note])
    setNewTitle("")
    setNewContent("")
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
  }

  const toggleStar = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n)))
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, starred: !selectedNote.starred })
    }
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)))
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates })
    }
  }

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Unknown"
  }

  const getSubjectDocsLink = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.docsLink
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || note.type === filterType
    const matchesSubject = !selectedSubject || note.subject === selectedSubject.id
    return matchesSearch && matchesFilter && matchesSubject
  })

  const starredNotes = filteredNotes.filter((n) => n.starred)
  const regularNotes = filteredNotes.filter((n) => !n.starred)

  const courseSubjects = subjects.filter((s) => s.type === "course")
  const hobbySubjects = subjects.filter((s) => s.type === "hobby")
  const businessSubjects = subjects.filter((s) => s.type === "business")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          Notes & Subjects
        </h1>
        <p className="text-muted-foreground mt-2">Organize your notes by course, hobby, or business</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subjects Sidebar */}
        <div className="space-y-4">
          <Card className="glow-card">
            <CardHeader>
              <CardTitle className="text-base">Add Subject</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Subject name..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="bg-input border-border/40"
              />
              <select
                value={newSubjectType}
                onChange={(e) => setNewSubjectType(e.target.value as any)}
                className="w-full px-3 py-2 bg-input border border-border/40 rounded-md text-sm"
              >
                <option value="course">Course</option>
                <option value="hobby">Hobby</option>
                <option value="business">Business</option>
              </select>
              <Input
                placeholder="Google Docs link (optional)..."
                value={newSubjectDocsLink}
                onChange={(e) => setNewSubjectDocsLink(e.target.value)}
                className="bg-input border-border/40 text-sm"
              />
              <Button onClick={addSubject} className="w-full gap-2">
                <FolderPlus className="w-4 h-4" />
                Create
              </Button>
            </CardContent>
          </Card>

          {/* Courses */}
          {courseSubjects.length > 0 && (
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="text-sm">Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courseSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-2 rounded hover-glow bg-secondary/30 border border-border/50 group"
                    >
                      <button
                        onClick={() => setSelectedSubject(subject)}
                        className={`flex-1 text-left text-sm font-medium transition-colors ${
                          selectedSubject?.id === subject.id
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {subject.name}
                      </button>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {subject.docsLink && (
                          <a
                            href={subject.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-primary transition-colors"
                            title="Open Google Docs"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="p-1 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hobbies */}
          {hobbySubjects.length > 0 && (
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="text-sm">Hobbies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hobbySubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-2 rounded hover-glow bg-secondary/30 border border-border/50 group"
                    >
                      <button
                        onClick={() => setSelectedSubject(subject)}
                        className={`flex-1 text-left text-sm font-medium transition-colors ${
                          selectedSubject?.id === subject.id
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {subject.name}
                      </button>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {subject.docsLink && (
                          <a
                            href={subject.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="p-1 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business */}
          {businessSubjects.length > 0 && (
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="text-sm">Business</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {businessSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-2 rounded hover-glow bg-secondary/30 border border-border/50 group"
                    >
                      <button
                        onClick={() => setSelectedSubject(subject)}
                        className={`flex-1 text-left text-sm font-medium transition-colors ${
                          selectedSubject?.id === subject.id
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {subject.name}
                      </button>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {subject.docsLink && (
                          <a
                            href={subject.docsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteSubject(subject.id)}
                          className="p-1 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Notes Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Create Note */}
          {selectedSubject && !selectedNote && (
            <Card className="glow-accent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Note in {selectedSubject.name}</CardTitle>
                  {selectedSubject.docsLink && (
                    <a
                      href={selectedSubject.docsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="Open Google Docs for this subject"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-input border-border/40"
                />
                <textarea
                  placeholder="Write your note here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-64 p-3 bg-input border border-border/40 rounded-md outline-none text-sm resize-none text-foreground"
                />
                <div className="flex gap-2">
                  <Button onClick={addNote} className="gap-2 flex-1">
                    <Plus className="w-4 h-4" />
                    Save Note
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewTitle("")
                      setNewContent("")
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note Editor */}
          {selectedNote && (
            <Card className="glow-purple">
              <CardHeader>
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  className="text-2xl font-bold bg-transparent outline-none w-full text-foreground"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                      {selectedSubject ? selectedSubject.name : "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground self-center">
                      {format(new Date(selectedNote.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleStar(selectedNote.id)}
                    className="p-2 hover:text-accent transition-colors"
                  >
                    <Star className="w-5 h-5" fill={selectedNote.starred ? "currentColor" : "none"} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                  className="w-full h-96 bg-transparent outline-none resize-none text-sm text-foreground"
                />
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedNote(null)}>
                    Back
                  </Button>
                  <Button variant="destructive" onClick={() => deleteNote(selectedNote.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          {!selectedNote && (
            <>
              <Card className="glow-card">
                <CardHeader>
                  <CardTitle className="text-base">Search Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 bg-input border-border/40"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "course", "hobby", "business"] as const).map((type) => (
                      <Button
                        key={type}
                        variant={filterType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType(type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Starred Notes */}
              {starredNotes.length > 0 && (
                <Card className="glow-accent">
                  <CardHeader>
                    <CardTitle className="text-base">Starred Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {starredNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className="text-left p-3 bg-secondary/40 hover-glow border border-border/50 rounded transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm line-clamp-1">{note.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{getSubjectName(note.subject)}</p>
                            </div>
                            <Star className="w-4 h-4 text-accent fill-accent" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Regular Notes */}
              {regularNotes.length > 0 && (
                <Card className="glow-card">
                  <CardHeader>
                    <CardTitle className="text-base">All Notes ({regularNotes.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {regularNotes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => setSelectedNote(note)}
                          className="text-left p-3 bg-secondary/20 hover-glow border border-border/50 rounded transition-all"
                        >
                          <p className="font-medium text-sm line-clamp-1">{note.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{getSubjectName(note.subject)}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {filteredNotes.length === 0 && subjects.length > 0 && (
                <Card className="glow-card">
                  <CardContent className="pt-6">
                    <p className="text-center text-sm text-muted-foreground">
                      {selectedSubject
                        ? `No notes in ${selectedSubject.name} yet. Create one above!`
                        : "Select a subject to create notes"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
