"use client"

import type React from "react"

interface FormInputProps {
  label: string
  type?: string
  value: string | number
  onChange: (value: string | number | React.SetStateAction<string> | React.SetStateAction<number>) => void
  placeholder?: string
  readOnly?: boolean
  helperText?: string
  icon?: React.ReactNode
}

export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly,
  helperText,
  icon,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-2.5 text-muted-foreground">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full bg-input border border-border rounded-lg px-${icon ? "10" : "4"} py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
            readOnly ? "opacity-60 cursor-not-allowed" : ""
          }`}
        />
      </div>
      {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
    </div>
  )
}
