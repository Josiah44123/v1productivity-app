"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
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
  isSameHour,
} from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  date: string
  description?: string
  urgency?: "low" | "medium" | "high"
}

interface CalendarSectionProps {
  events: CalendarEvent[]
  setEvents: (events: CalendarEvent[]) => void
}

export function CalendarSection({ events = [], setEvents }: CalendarSectionProps) {
  // Initialize with today's date
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  
  // Form states
  const [newEventTitle, setNewEventTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventUrgency, setEventUrgency] = useState<"low" | "medium" | "high">("medium")
  const [eventTime, setEventTime] = useState("09:00")
  const [isClassTime, setIsClassTime] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to 8 AM when switching to week view
  useEffect(() => {
    if (viewMode === "week" && scrollContainerRef.current) {
      // Approximate pixel height for 8 AM (8 * 64px height per hour)
      scrollContainerRef.current.scrollTop = 8 * 64
    }
  }, [viewMode])

  // --- Date Logic ---
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthStartWeek = startOfWeek(monthStart)
  const monthEndWeek = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek })

  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Generate 24 hours for the week view
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // --- Handlers ---
  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1))
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() - 1)))
  }

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1))
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() + 1)))
  }

  const addEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return
    const [hoursStr, minutesStr] = eventTime.split(":").map(Number)
    
    // Set the time on the selected date
    const eventDateTime = setMinutes(setHours(selectedDate, hoursStr), minutesStr)

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: eventDateTime.toISOString(),
      description: isClassTime ? "Class Time" : "",
      urgency: eventUrgency,
    }
    setEvents([...events, event])
    setNewEventTitle("")
    setEventTime("09:00")
    setIsClassTime(false)
    setSelectedDate(null)
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  const getDayEvents = (date: Date) => {
    return events.filter((e) => isSameDay(new Date(e.date), date))
  }

  // --- Styling ---
  const calendarWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high": return "bg-red-500/20 border-red-500/50 text-red-200 border-l-4 border-l-red-500"
      case "medium": return "bg-amber-500/20 border-amber-500/50 text-amber-200 border-l-4 border-l-amber-500"
      case "low": return "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 border-l-4 border-l-emerald-500"
      default: return "bg-blue-500/20 border-blue-500/50 text-blue-200 border-l-4 border-l-blue-500"
    }
  }

  // Click handler for week grid cells
  const handleGridClick = (day: Date, hour: number) => {
    const clickedDate = setHours(day, hour)
    setSelectedDate(clickedDate)
    setEventTime(`${hour.toString().padStart(2, '0')}:00`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
          Calendar & Schedule
        </h1>
        <p className="text-blue-300/70 mt-2">Plan your semester 2025-2026 and track important dates</p>
      </div>

      <div className="flex gap-2">
        {(["month", "week", "day"] as const).map((mode) => (
          <Button
            key={mode}
            onClick={() => setViewMode(mode)}
            variant={viewMode === mode ? "default" : "outline"}
            className="capitalize transition-all active:scale-95"
          >
            {mode}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glow-card border-blue-glow h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0">
              <CardTitle className="text-xl bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
                {viewMode === "week" 
                  ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
                  : format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrev} className="hover-glow border-blue-500/40">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext} className="hover-glow border-blue-500/40">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden p-0 relative">
              
              {/* === MONTH VIEW === */}
              {viewMode === "month" && (
                <div className="h-full overflow-y-auto p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {calendarWeekDays.map((day) => (
                      <div key={day} className="text-center font-semibold text-sm p-2 text-blue-300/70">
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day) => {
                      const dayEvents = getDayEvents(day)
                      const isToday = isSameDay(day, new Date())
                      const isCurrentMonth = isSameMonth(day, currentDate)

                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`p-2 rounded text-sm h-24 flex flex-col items-start justify-start text-left border transition-all hover-glow ${
                            isToday
                              ? "bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-blue-500/40 text-blue-100 border-blue-500/60 shadow-lg shadow-blue-500/30 glow-pulse"
                              : selectedDate && isSameDay(day, selectedDate)
                              ? "glow-accent border-blue-glow"
                              : isCurrentMonth
                              ? "glow-card hover:glow-accent border-blue-500/30"
                              : "opacity-30 bg-blue-950/20"
                          }`}
                        >
                          <span className="font-semibold text-xs">{format(day, "d")}</span>
                          <div className="mt-1 text-xs space-y-0.5 overflow-hidden w-full">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`truncate px-1 rounded-[2px] text-[10px] ${getUrgencyColor(event.urgency).replace("border-l-4", "border-l-2")}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[10px] opacity-50 px-1">+{dayEvents.length - 2}</div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* === GOOGLE CALENDAR STYLE WEEK VIEW === */}
              {viewMode === "week" && (
                <div className="flex flex-col h-full">
                  {/* Sticky Header: Days */}
                  <div className="grid grid-cols-8 border-b border-blue-500/30 bg-background/95 backdrop-blur z-10 mr-2"> {/* mr-2 accounts for scrollbar */}
                    <div className="col-span-1 py-3 border-r border-blue-500/30"></div> {/* Time Label Spacer */}
                    {weekDays.map((day) => {
                       const isToday = isSameDay(day, new Date())
                       return (
                        <div key={day.toISOString()} className={`col-span-1 py-2 text-center border-r border-blue-500/30 ${isToday ? 'bg-blue-500/10' : ''}`}>
                          <div className={`text-xs font-semibold ${isToday ? 'text-blue-400' : 'text-blue-300/70'}`}>
                            {format(day, "EEE")}
                          </div>
                          <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-foreground'}`}>
                            {format(day, "d")}
                          </div>
                        </div>
                       )
                    })}
                  </div>

                  {/* Scrollable Time Grid */}
                  <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-8 relative min-w-[600px]">
                      
                      {/* 1. Time Labels Column */}
                      <div className="col-span-1 border-r border-blue-500/30 bg-background/50">
                         {hours.map((hour) => (
                           <div key={hour} className="h-16 relative">
                             <span className="absolute -top-3 right-2 text-xs text-blue-300/50">
                               {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                             </span>
                           </div>
                         ))}
                      </div>

                      {/* 2. Days Columns */}
                      {weekDays.map((day) => {
                        const isToday = isSameDay(day, new Date())
                        return (
                          <div key={day.toISOString()} className={`col-span-1 border-r border-blue-500/20 relative min-h-[1536px] ${isToday ? 'bg-blue-500/5' : ''}`}>
                             {/* Background Grid Lines (Hours) */}
                             {hours.map((hour) => (
                               <div 
                                 key={hour} 
                                 className="h-16 border-b border-blue-500/10 hover:bg-white/5 transition-colors cursor-pointer group relative"
                                 onClick={() => handleGridClick(day, hour)}
                               >
                                  {/* Plus icon on hover to suggest adding event */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-4 h-4 text-blue-400/50" />
                                  </div>
                               </div>
                             ))}

                             {/* Events Overlay */}
                             {getDayEvents(day).map((event) => {
                               const eventDate = new Date(event.date)
                               // Calculate top position based on hour + minutes (assuming 64px height per hour)
                               const topPosition = (eventDate.getHours() * 64) + ((eventDate.getMinutes() / 60) * 64)
                               
                               return (
                                 <div
                                   key={event.id}
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     // Optional: open edit modal
                                   }}
                                   className={`absolute left-0.5 right-0.5 p-1 rounded text-xs border cursor-pointer hover:brightness-110 z-10 overflow-hidden ${getUrgencyColor(event.urgency)}`}
                                   style={{
                                     top: `${topPosition}px`,
                                     height: '60px', // Default duration visualization (approx 1 hour)
                                   }}
                                 >
                                   <div className="font-semibold truncate">{event.title}</div>
                                   <div className="text-[10px] opacity-80">{format(eventDate, "h:mm a")}</div>
                                 </div>
                               )
                             })}
                             
                             {/* Current Time Indicator Line (Only for Today) */}
                             {isToday && (
                               <div 
                                 className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                                 style={{
                                   top: `${(new Date().getHours() * 64) + ((new Date().getMinutes() / 60) * 64)}px`
                                 }}
                               >
                                 <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                               </div>
                             )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* === DAY VIEW === */}
              {viewMode === "day" && (
                <div className="h-full overflow-y-auto p-4">
                  <div className="space-y-4">
                    {selectedDate || currentDate ? (
                       (() => {
                         const targetDate = selectedDate || currentDate
                         return (
                           <>
                            <div className="text-lg font-semibold bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent mb-4">
                              {format(targetDate, "EEEE, MMMM d, yyyy")}
                            </div>
                            <div className="space-y-3">
                              {getDayEvents(targetDate).length > 0 ? (
                                getDayEvents(targetDate)
                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                  .map((event) => (
                                  <div
                                    key={event.id}
                                    className={`p-4 rounded border animate-in fade-in flex gap-4 ${getUrgencyColor(event.urgency)}`}
                                  >
                                    <div className="text-sm font-mono opacity-70 min-w-[60px]">
                                      {format(new Date(event.date), "h:mm a")}
                                    </div>
                                    <div>
                                      <p className="font-medium">{event.title}</p>
                                      {event.description && (
                                        <p className="text-sm mt-1 text-blue-300/70">{event.description}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => deleteEvent(event.id)}
                                      className="ml-auto p-1 hover:bg-black/20 rounded self-start"
                                    >
                                      <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-blue-300/60 py-8 border border-dashed border-blue-500/30 rounded">No events for this day</p>
                              )}
                            </div>
                           </>
                         )
                       })()
                    ) : (
                      <p className="text-center text-blue-300/60">Select a date to view details</p>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Add Event & List */}
        <div className="space-y-4">
          <Card className="glow-accent border-blue-glow">
            <CardHeader>
              <CardTitle className="text-base text-blue-300">Add Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Event title..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addEvent()}
                className="bg-input border-blue-500/40"
              />
              <div>
                <label className="text-xs text-blue-300/70 mb-2 block">Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-500/40 rounded-md outline-none text-sm bg-input text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-blue-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isClassTime}
                  onChange={(e) => setIsClassTime(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-500/40 bg-input"
                />
                Mark as Class Time
              </label>
              <div>
                <label className="text-xs text-blue-300/70 mb-2 block">Urgency</label>
                <select
                  value={eventUrgency}
                  onChange={(e) => setEventUrgency(e.target.value as "low" | "medium" | "high")}
                  className="w-full px-3 py-2 border border-blue-500/40 rounded-md outline-none text-sm bg-input text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="text-sm p-3 bg-blue-500/20 border border-blue-500/40 rounded-md text-blue-100">
                <span className="opacity-70">Target:</span>{' '}
                {selectedDate 
                  ? `${format(selectedDate, "MMM d")} @ ${eventTime}`
                  : "No date selected"}
              </div>
              
              <Button
                onClick={addEvent}
                disabled={!newEventTitle.trim() || !selectedDate}
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>

          <Card className="glow-card border-blue-glow flex-1">
            <CardHeader>
              <CardTitle className="text-base text-blue-300">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {events.length > 0 ? (
                  events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-start justify-between gap-2 p-2 rounded hover-glow border transition-all ${getUrgencyColor(event.urgency)}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                          <p className="text-xs opacity-70">
                            {format(new Date(event.date), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1 hover:text-red-300 transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-blue-300/60 text-center py-4">No events yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
