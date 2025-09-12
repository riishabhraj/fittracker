import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

const getCurrentWeekDays = () => {
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1))

  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    weekDays.push({
      date: date.getDate(),
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: date.toDateString() === today.toDateString(),
      workouts: [], // Empty for new users
    })
  }
  return weekDays
}

export function WeeklyCalendar() {
  const weekData = getCurrentWeekDays()
  const hasAnyWorkouts = false // This would come from your data store/API

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">This Week</h2>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
          {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
            <div
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                day.isToday ? "bg-primary text-primary-foreground" : "bg-muted/20 text-foreground"
              }`}
            >
              {day.date}
            </div>
            <div className="h-6 flex items-center justify-center">
              {day.workouts.length === 0 && <div className="w-2 h-2 bg-muted/30 rounded-full"></div>}
            </div>
          </div>
        ))}
      </div>

      {!hasAnyWorkouts && (
        <div className="text-center py-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">No workouts scheduled this week</p>
          <Link href="/log-workout">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Plan Your Week
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
