"use client"

import * as React from "react"
import { CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AgencyUser = {
  id: number
  full_name: string
  department: string
}

interface AgencyComboboxProps {
  name: string
  defaultValue?: string
  users: AgencyUser[]
}

export function AgencyCombobox({ name, defaultValue, users }: AgencyComboboxProps) {
  const [value, setValue] = React.useState(defaultValue || "")
  const [isValid, setIsValid] = React.useState<boolean | null>(
    defaultValue ? users.some(u => u.full_name === defaultValue) : null
  )

  const checkValidation = (val: string) => {
    if (!val) {
      setIsValid(null)
      return
    }
    const found = users.some(u => u.full_name === val)
    setIsValid(found)
  }

  const handleCheck = () => {
    checkValidation(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    if (!val) {
      setIsValid(null)
      return
    }
    // Automatically validate if they select from dropdown or type exactly
    const found = users.some(u => u.full_name === val)
    if (found) {
      setIsValid(true)
    } else {
      setIsValid(null) // Not confirmed yet, they can press "Check" to see if it's invalid
    }
  }

  return (
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <Input
          id={name}
          name={name}
          list="agency-users-list"
          placeholder="พิมพ์ชื่อหน่วยงานให้ถูกต้อง..."
          value={value}
          onChange={handleChange}
          onBlur={handleCheck}
        />
        <datalist id="agency-users-list">
          {users.map((user) => (
            <option key={user.id} value={user.full_name}>
              {user.department}
            </option>
          ))}
        </datalist>
      </div>

      <Button
        type="button"
        variant={isValid === true ? "default" : isValid === false ? "destructive" : "secondary"}
        onClick={handleCheck}
        className="shrink-0"
      >
        {isValid === true ? (
          <><CheckCircle2 className="w-4 h-4 mr-2" /> พบ</>
        ) : isValid === false ? (
          <><XCircle className="w-4 h-4 mr-2" /> ไม่พบ</>
        ) : (
          "ตรวจ"
        )}
      </Button>
    </div>
  )
}
