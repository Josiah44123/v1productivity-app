"use client"

import { useState } from "react"
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
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    if (today.getFullYear() === 2024) {
      return new Date(2025, 0, 1)
    }
    return today
  })
  const [newEventTitle, setNewEventTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventUrgency, setEventUrgency] = useState<"low" | "medium" | "high">("medium")

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const weekStart = startOfWeek(monthStart)
  const weekEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const addEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDate.toISOString(),
      description: "",
      urgency: eventUrgency,
    }
    setEvents([...events, event])
    setNewEventTitle("")
    setSelectedDate(null)
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  const getDayEvents = (date: Date) => {
    return events.filter((e) => isSameDay(new Date(e.date), date))
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high":
        return "bg-gradient-to-r from-red-500/30 to-orange-500/30 border-red-500/50 text-red-300"
      case "medium":
        return "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-yellow-500/50 text-yellow-300"
      case "low":
        return "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-500/50 text-green-300"
      default:
        return "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-500/50 text-blue-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
          Calendar & Schedule
        </h1>
        <p className="text-blue-300/70 mt-2">Plan your semester 2025-2026 and track important dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glow-card border-blue-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl text-cyan-300">{format(currentMonth, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="hover-glow border-blue-500/40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="hover-glow border-blue-500/40"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day} className="text-center font-semibold text-sm p-2 text-blue-300/70">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => {
                  const dayEvents = getDayEvents(day)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = isSameMonth(day, currentMonth)

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded text-sm h-24 flex flex-col items-start justify-start text-left border transition-all hover-glow ${
                        isToday
                          ? "bg-gradient-to-br from-cyan-500/40 via-blue-500/40 to-purple-500/40 text-blue-100 border-cyan-500/60 shadow-lg shadow-cyan-500/30 glow-pulse"
                          : selectedDate && isSameDay(day, selectedDate)
                            ? "glow-accent border-purple-glow"
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
                            className={`truncate px-1 rounded text-xs border ${getUrgencyColor(event.urgency)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div className="text-xs opacity-50 px-1">+{dayEvents.length - 2}</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="glow-accent border-purple-glow">
            <CardHeader>
              <CardTitle className="text-base text-purple-300">Add Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Event title..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addEvent()}
                className="bg-input border-purple-500/40"
              />
              <div>
                <label className="text-xs text-blue-300/70 mb-2 block">Urgency</label>
                <select
                  value={eventUrgency}
                  onChange={(e) => setEventUrgency(e.target.value as "low" | "medium" | "high")}
                  className="w-full px-3 py-2 border border-purple-500/40 rounded-md outline-none text-sm bg-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              {selectedDate && (
                <div className="text-sm p-3 bg-blue-500/20 border border-blue-500/40 rounded-md text-blue-100">
                  Selected: {format(selectedDate, "MMM d, yyyy")}
                </div>
              )}
              <Button
                onClick={addEvent}
                disabled={!newEventTitle.trim() || !selectedDate}
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>

          <Card className="glow-card border-blue-glow">
            <CardHeader>
              <CardTitle className="text-base text-cyan-300">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {events.length > 0 ? (
                  events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-start justify-between gap-2 p-2 rounded hover-glow border ${getUrgencyColor(event.urgency)}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{event.title}</p>
                          <p className="text-xs text-blue-300/60">{format(new Date(event.date), "MMM d, yyyy")}</p>
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="p-1 hover:text-red-300 transition-colors"
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
