"use client"

import * as React from "react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerBE({ 
  name, 
  id 
}: { 
  name: string
  id?: string 
}) {
  const [date, setDate] = React.useState<Date>()

  return (
    <>
      <input type="hidden" name={name} value={date ? format(date, "dd/MM/yyyy") : ""} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              `${format(date, "dd/MM")}/${date.getFullYear() + 543}`
            ) : (
              <span>dd/mm/yyyy</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={th}
            formatters={{
              formatMonthCaption: (date, options) => {
                const ce = format(date, "LLLL yyyy", { locale: options?.locale })
                return ce.replace(String(date.getFullYear()), String(date.getFullYear() + 543))
              },
              formatCaption: (date, options) => {
                const ce = format(date, "LLLL yyyy", { locale: options?.locale })
                return ce.replace(String(date.getFullYear()), String(date.getFullYear() + 543))
              },
            }}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}
