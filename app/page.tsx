import { AuthGuard } from "@/components/auth-guard"
import { UserMenu } from "@/components/user-menu"
import UploadForm from "@/components/upload-form"
import { UploadHistory } from "@/components/upload-history"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function Page() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.jpg" alt="MarketsheetHub Logo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-pretty text-2xl font-semibold">MarketsheetHub</h1>
          </div>
          <UserMenu />
        </header>

        <section className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="content-panel p-6">
            <UploadForm />
          </div>
          <aside className="space-y-4">
            <Card className="content-panel border-0 shadow-none bg-transparent">
              <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
                Welcome to MarketsheetHub - Your comprehensive student performance tracking platform. Upload Excel files
                to analyze student progress and generate detailed reports.
              </CardContent>
            </Card>
            <div className="content-panel p-4">
              <UploadHistory />
            </div>
          </aside>
        </section>
      </main>
    </AuthGuard>
  )
}
