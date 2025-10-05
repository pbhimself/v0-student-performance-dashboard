"use client"

import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"

export function NameSay({ name }: { name: string }) {
  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    const u = new SpeechSynthesisUtterance(name)
    // You can tweak language for local context if needed (e.g., 'hi-IN', 'mr-IN')
    u.lang = "en-US"
    u.rate = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  return (
    <Button onClick={speak} size="icon" variant="ghost" aria-label={`Pronounce ${name}`}>
      <Volume2 className="h-4 w-4" />
    </Button>
  )
}
