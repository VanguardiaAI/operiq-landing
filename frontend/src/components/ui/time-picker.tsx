"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  // Parse the time value
  const [hours, minutes] = value ? value.split(":").map(Number) : [12, 0]

  // Handles
  const handleHourChange = (hour: string) => {
    const newHour = hour.padStart(2, "0")
    const newMinute = minutes.toString().padStart(2, "0")
    onChange(`${newHour}:${newMinute}`)
  }

  const handleMinuteChange = (minute: string) => {
    const newHour = hours.toString().padStart(2, "0")
    const newMinute = minute.padStart(2, "0")
    onChange(`${newHour}:${newMinute}`)
  }

  // Generate hours and minutes options
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i)
  const minutesOptions = Array.from({ length: 4 }, (_, i) => i * 15)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border rounded-md h-[52px] focus-within:border-gray-400 hover:border-gray-400 bg-gray-50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Hora</span>
              <span className="text-sm">{value || "Seleccionar hora"}</span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="text-center text-sm font-medium text-gray-500">Seleccionar hora</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Hora</div>
              <Select value={hours.toString()} onValueChange={handleHourChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {hoursOptions.map((hour) => (
                    <SelectItem
                      key={hour}
                      value={hour.toString()}
                      className={
                        hour === hours ? "bg-gradient-to-r from-[#ff7c1a] to-[#ff3c1a] text-white font-bold" : ""
                      }
                    >
                      {hour.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Minutos</div>
              <Select value={minutes.toString()} onValueChange={handleMinuteChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Minutos" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {minutesOptions.map((minute) => (
                    <SelectItem
                      key={minute}
                      value={minute.toString()}
                      className={
                        minute === minutes ? "bg-gradient-to-r from-[#ff7c1a] to-[#ff3c1a] text-white font-bold" : ""
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 