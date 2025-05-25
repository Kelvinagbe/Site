import './globals-app.css'
import AppHeader from './components/AppHeader'
import AppBottomNav from './components/AppBottomNav'

export const metadata = {
  title: 'Apexion App',
  description: 'Text to PDF & Wallpaper Gallery App',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-container">
      <AppHeader />
      <main className="app-main">
        {children}
      </main>
      <AppBottomNav />
    </div>
  )
}