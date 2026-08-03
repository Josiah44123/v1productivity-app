"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, X, ChevronLeft, ChevronRight, 
  Clock, MapPin, AlignLeft, Calendar as CalendarIcon, 
  Repeat, Trash2 
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  setHours,
  setMinutes,
  differenceInMinutes,
  addMinutes,
  isAfter,
  startOfDay,
  getDay,
  isValid
} from "date-fns"

// --- Types ---
type EventType = "course" | "work" | "free-time" | "deadline" | "other"

interface CalendarEvent {
  id: string
  title: string
  start: string // ISO
  end: string   // ISO
  type: EventType
  description?: string
  location?: string
  isAllDay?: boolean
  recurrence?: "none" | "daily" | "weekly" | "monthly"
}

interface CalendarSectionProps {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
}

// --- Constants ---
const PIXELS_PER_HOUR = 64

export function CalendarSection({ events = [], setEvents }: CalendarSectionProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<"month" | "week">("week")
  
  // Drag Selection State
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Date | null>(null)
  const [dragEnd, setDragEnd] = useState<Date | null>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent>>({})

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to 8 AM on load
  useEffect(() => {
    if (viewMode === "week" && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * PIXELS_PER_HOUR
    }
  }, [viewMode])

  // --- Safe Date Check ---
  const isEventValid = (e: any): e is CalendarEvent => {
    return (
      e && 
      typeof e.start === 'string' && 
      typeof e.end === 'string' && 
      isValid(new Date(e.start)) && 
      isValid(new Date(e.end))
    )
  }

  // --- Date Calculations ---
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInView = viewMode === 'month' 
    ? eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) })
    : eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) })
  
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // --- Navigation ---
  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1))
    else setCurrentDate(subWeeks(currentDate, 1))
  }

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1))
    else setCurrentDate(addWeeks(currentDate, 1))
  }

  const jumpToToday = () => setCurrentDate(new Date())

  // --- Drag & Drop Logic ---
  const handleGridMouseDown = (day: Date, hour: number) => {
    const startTime = setMinutes(setHours(day, hour), 0)
    setIsDragging(true)
    setDragStart(startTime)
    setDragEnd(addMinutes(startTime, 60)) // Default 1 hour
  }

  const handleGridMouseEnter = (day: Date, hour: number) => {
    if (!isDragging || !dragStart) return
    if (isSameDay(day, dragStart)) {
      const hoverTime = setMinutes(setHours(day, hour), 0)
      if (isAfter(hoverTime, dragStart)) {
        setDragEnd(hoverTime)
      }
    }
  }

  const handleGridMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      openModal({
        start: dragStart.toISOString(),
        end: dragEnd.toISOString(),
        isAllDay: false
      })
    }
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  // --- Event CRUD ---
  const openModal = (initialData: Partial<CalendarEvent> = {}) => {
    setEditingEvent({
      id: Date.now().toString(),
      title: "",
      type: "course",
      recurrence: "none",
      location: "",
      description: "",
      ...initialData
    })
    setIsModalOpen(true)
  }

  const saveEvent = () => {
    if (!editingEvent.title || !editingEvent.start || !editingEvent.end) return
    const newEvent = editingEvent as CalendarEvent
    const exists = events.find(e => e.id === newEvent.id)
    if (exists) {
      setEvents(events.map(e => e.id === newEvent.id ? newEvent : e))
    } else {
      setEvents([...events, newEvent])
    }
    setIsModalOpen(false)
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    setIsModalOpen(false)
  }

  const clearAllEvents = () => {
    if(confirm("Are you sure you want to clear all events?")) {
      setEvents([])
    }
  }

  // --- Helpers ---
  const getEventStyle = (type: EventType) => {
    switch (type) {
      case "course": return "bg-blue-600/20 border-blue-500 text-blue-100 border-l-4"
      case "work": return "bg-purple-600/20 border-purple-500 text-purple-100 border-l-4"
      case "deadline": return "bg-red-600/20 border-red-500 text-red-100 border-l-4"
      case "free-time": return "bg-emerald-600/20 border-emerald-500 text-emerald-100 border-l-4"
      default: return "bg-slate-600/20 border-slate-500 text-slate-200 border-l-4"
    }
  }

  const getTypeColor = (type: EventType) => {
    switch (type) {
        case "course": return "bg-blue-500"
        case "work": return "bg-purple-500"
        case "deadline": return "bg-red-500"
        case "free-time": return "bg-emerald-500"
        default: return "bg-slate-500"
    }
  }

  const getVisibleEvents = (day: Date) => {
    return events.filter(e => {
      // Safety Check
      if (!isEventValid(e)) return false

      const eventStart = new Date(e.start)
      const isExactDay = isSameDay(eventStart, day)
      const isWeekly = e.recurrence === 'weekly' && getDay(eventStart) === getDay(day)
      return isExactDay || isWeekly
    })
  }

  return (
    <div className="space-y-4 h-full flex flex-col" onMouseUp={handleGridMouseUp}>
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
            Schedule
          </h1>
          <p className="text-blue-300/70 text-sm">
            {format(currentDate, "MMMM yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg border border-blue-500/20">
          <Button variant="ghost" size="sm" onClick={jumpToToday}>Today</Button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <Button variant="ghost" size="icon" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <Button 
            variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
            size="sm" onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'secondary' : 'ghost'} 
            size="sm" onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
        
        <div className="flex gap-2">
            <Button onClick={clearAllEvents} variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button onClick={() => openModal({ start: new Date().toISOString(), end: addMinutes(new Date(), 60).toISOString() })} className="gap-2 bg-blue-600 hover:bg-blue-500">
                <Plus className="w-4 h-4" /> Create
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[600px]">
        
        {/* --- MAIN CALENDAR VIEW (Spans 3 cols) --- */}
        <Card className="xl:col-span-3 border-blue-500/20 overflow-hidden flex flex-col glow-card h-[700px]">
            <CardContent className="p-0 flex-1 relative overflow-hidden flex flex-col">
                
                {/* WEEK VIEW */}
                {viewMode === 'week' && (
                    <div className="flex flex-col h-full">
                        {/* Week Header */}
                        <div className="grid grid-cols-8 border-b border-white/10 bg-background/95 backdrop-blur z-10 mr-[6px]">
                            <div className="col-span-1 py-4 border-r border-white/10 text-xs text-center text-muted-foreground pt-8">
                                GMT+8
                            </div>
                            {daysInView.map((day) => {
                                const isToday = isSameDay(day, new Date())
                                return (
                                    <div key={day.toString()} className="col-span-1 py-3 text-center border-r border-white/5 group">
                                        <div className={`text-xs font-medium mb-1 uppercase ${isToday ? 'text-blue-400' : 'text-muted-foreground'}`}>
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className={`text-2xl font-bold w-10 h-10 flex items-center justify-center mx-auto rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-foreground'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Scrollable Time Grid */}
                        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative custom-scrollbar">
                            <div className="grid grid-cols-8 relative min-w-[800px]">
                                {/* Time Axis */}
                                <div className="col-span-1 border-r border-white/10 bg-background/50 sticky left-0 z-20">
                                    {hours.map((hour) => (
                                        <div key={hour} className="h-16 relative border-b border-transparent" style={{ height: PIXELS_PER_HOUR }}>
                                            <span className="absolute -top-2.5 right-3 text-xs text-muted-foreground font-mono">
                                                {hour === 0 ? "" : format(setHours(new Date(), hour), "h a")}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {daysInView.map((day) => (
                                    <div key={day.toString()} className="col-span-1 border-r border-white/10 relative">
                                        {/* Grid Lines */}
                                        {hours.map((hour) => (
                                            <div 
                                                key={hour} 
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors group relative"
                                                style={{ height: PIXELS_PER_HOUR }}
                                                onMouseDown={(e) => { if (e.button === 0) handleGridMouseDown(day, hour) }}
                                                onMouseEnter={() => handleGridMouseEnter(day, hour)}
                                            />
                                        ))}

                                        {/* Events */}
                                        {getVisibleEvents(day).map(event => {
                                            const start = new Date(event.start)
                                            const end = new Date(event.end)
                                            const top = (start.getHours() * 60 + start.getMinutes()) * (PIXELS_PER_HOUR / 60)
                                            const height = differenceInMinutes(end, start) * (PIXELS_PER_HOUR / 60)

                                            return (
                                                <div
                                                    key={event.id}
                                                    onClick={(e) => { e.stopPropagation(); openModal(event) }}
                                                    className={`absolute left-1 right-1 rounded px-2 py-1 text-xs cursor-pointer hover:brightness-110 z-10 overflow-hidden shadow-sm transition-all border-l-4 ${getEventStyle(event.type)}`}
                                                    style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                                                >
                                                    <div className="font-semibold leading-tight truncate">{event.title}</div>
                                                    <div className="text-[10px] opacity-80 mt-0.5 truncate">
                                                        {format(start, "h:mm")} - {format(end, "h:mm a")}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Drag Indicator */}
                                        {isDragging && dragStart && dragEnd && isSameDay(day, dragStart) && (
                                            <div 
                                                className="absolute left-1 right-1 bg-blue-500/30 border border-blue-500 rounded z-20 pointer-events-none flex flex-col justify-center items-center text-xs text-blue-200"
                                                style={{
                                                    top: `${(dragStart.getHours() * 60 + dragStart.getMinutes()) * (PIXELS_PER_HOUR / 60)}px`,
                                                    height: `${differenceInMinutes(dragEnd, dragStart) * (PIXELS_PER_HOUR / 60)}px`
                                                }}
                                            >
                                                <span className="font-bold">{format(dragStart, "h:mm")} - {format(dragEnd, "h:mm")}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* MONTH VIEW - UPDATED */}
                {viewMode === 'month' && (
                    <div className="p-4 grid grid-cols-7 gap-3 h-full overflow-y-auto">
                        {daysInView.map(day => {
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            
                            return (
                                <div 
                                    key={day.toISOString()}
                                    className={`
                                        min-h-[100px] rounded-xl p-2 border transition-all duration-300 cursor-pointer flex flex-col gap-1
                                        ${!isCurrentMonth ? 'opacity-30 hover:opacity-50' : 'opacity-100'}
                                        ${isToday 
                                            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30 hover:scale-[1.02] hover:shadow-xl'
                                        }
                                    `}
                                    onClick={() => openModal({ start: startOfDay(day).toISOString(), end: addMinutes(startOfDay(day), 60).toISOString() })}
                                >
                                    <div className={`text-right text-sm font-medium mb-1 ${isToday ? 'text-blue-300' : 'text-muted-foreground'}`}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                        {getVisibleEvents(day).slice(0, 4).map(e => (
                                            <div 
                                                key={e.id} 
                                                className={`text-[10px] px-1.5 py-0.5 rounded-sm truncate font-medium border-l-2 shadow-sm ${getEventStyle(e.type)}`}
                                            >
                                                {e.title}
                                            </div>
                                        ))}
                                        {getVisibleEvents(day).length > 4 && (
                                            <div className="text-[9px] text-muted-foreground text-center">
                                                +{getVisibleEvents(day).length - 4} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>

        {}
        <div className="xl:col-span-1 space-y-4 h-[700px] flex flex-col">
            <Card className="glow-accent border-blue-glow h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-base text-blue-300">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {events.filter(isEventValid).length > 0 ? (
                        <div className="space-y-3">
                            {events
                                .filter(isEventValid) 
                                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                                .map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={() => openModal(event)}
                                        className={`p-3 rounded-md border cursor-pointer hover:scale-[1.02] transition-transform ${getEventStyle(event.type)}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-sm">{event.title}</div>
                                                <div className="text-xs opacity-80 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(event.start), "MMM d, h:mm a")}
                                                </div>
                                                {event.location && (
                                                    <div className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {event.location}
                                                    </div>
                                                )}
                                            </div>
                                            {event.recurrence !== 'none' && <Repeat className="w-3 h-3 opacity-50" />}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-50">
                            <CalendarIcon className="w-10 h-10 mb-2" />
                            <p className="text-sm">No upcoming events</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>

      {/* --- EVENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-[#252525] px-4 py-3 flex justify-between items-center border-b border-white/5">
                    <span className="text-sm font-medium text-muted-foreground">{editingEvent.id ? 'Edit Event' : 'Create Event'}</span>
                    <div className="flex gap-2">
                        {editingEvent.id && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => deleteEvent(editingEvent.id!)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsModalOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <Input 
                        autoFocus
                        placeholder="Add title" 
                        className="text-2xl font-normal border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 border-b border-white/10 rounded-none focus:border-blue-500"
                        value={editingEvent.title || ""}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    />
                    <div className="flex gap-2">
                        {(['course', 'work', 'free-time', 'deadline'] as EventType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setEditingEvent({ ...editingEvent, type })}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-2 ${editingEvent.type === type ? `border-${getTypeColor(type)} bg-${getTypeColor(type)}/20 text-white` : 'border-white/10 text-muted-foreground hover:bg-white/5'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${getTypeColor(type)}`} />
                                <span className="capitalize">{type.replace('-', ' ')}</span>
                            </button>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div className="flex items-center gap-2 flex-1">
                                <input 
                                    type="time" 
                                    className="bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                    value={editingEvent.start ? format(new Date(editingEvent.start), "HH:mm") : "09:00"}
                                    onChange={(e) => {
                                        const [h, m] = e.target.value.split(':').map(Number)
                                        const newStart = setMinutes(setHours(new Date(editingEvent.start!), h), m)
                                        const diff = differenceInMinutes(new Date(editingEvent.end!), new Date(editingEvent.start!))
                                        setEditingEvent({ ...editingEvent, start: newStart.toISOString(), end: addMinutes(newStart, diff).toISOString() })
                                    }}
                                />
                                <span className="text-muted-foreground">-</span>
                                <input 
                                    type="time" 
                                    className="bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                                    value={editingEvent.end ? format(new Date(editingEvent.end), "HH:mm") : "10:00"}
                                    onChange={(e) => {
                                        const [h, m] = e.target.value.split(':').map(Number)
                                        const newEnd = setMinutes(setHours(new Date(editingEvent.end!), h), m)
                                        setEditingEvent({ ...editingEvent, end: newEnd.toISOString() })
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Repeat className="w-5 h-5 text-muted-foreground" />
                            <select 
                                className="bg-[#2a2a2a] border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 w-full"
                                value={editingEvent.recurrence || "none"}
                                onChange={(e) => setEditingEvent({ ...editingEvent, recurrence: e.target.value as any })}
                            >
                                <option value="none">Does not repeat</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground" />
                            <Input 
                                placeholder="Add location" 
                                className="bg-[#2a2a2a] border-white/10 h-8 text-sm"
                                value={editingEvent.location || ""}
                                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                            />
                        </div>
                        <div className="flex items-start gap-3">
                            <AlignLeft className="w-5 h-5 text-muted-foreground mt-1" />
                            <Textarea 
                                placeholder="Add description" 
                                className="bg-[#2a2a2a] border-white/10 min-h-[80px] text-sm resize-none"
                                value={editingEvent.description || ""}
                                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-[#252525] px-6 py-4 flex justify-end gap-3 border-t border-white/5">
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={saveEvent} className="bg-blue-600 hover:bg-blue-500 px-8">Save</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}