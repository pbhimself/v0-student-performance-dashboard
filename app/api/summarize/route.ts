import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: NextRequest) {
  const body = await req.json()
  // body: { meta, subjects, perStudent, averages }
  const { meta, subjects, perStudent, averages } = body || {}

  const prompt = `
You are an analytics assistant for a class performance dashboard. Given JSON of students and averages,
write a short, helpful, and friendly summary (120-180 words) for a teacher. Highlight:
- strongest subjects and weakest subjects using averages,
- notable improvements or declines based on delta,
- 2-3 actionable suggestions.

JSON:
subjects: ${JSON.stringify(subjects)}
averages: ${JSON.stringify(averages)}
students: ${JSON.stringify(perStudent?.slice(0, 200))}  // limit
context: Teacher=${meta?.teacher}, Class=${meta?.className}, Subject=${meta?.subject}
`

  const { text } = await generateText({
    model: groq("llama-3.1-8b-instant"),
    prompt,
  })

  return NextResponse.json({ summary: text })
}
