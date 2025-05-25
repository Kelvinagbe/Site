'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AppBottomNav() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/app', icon: '🏠', label: 'Home' },
    { href: '/app/text-to-pdf', icon: '📄', label: 'PDF' },
    { href: '/app/wallpaper-gallery', icon: '🖼️', label: 'Gallery' },
  ]

  return (
    <nav className="app-bottom-nav">
      {navItems.map((item) => (
        <Link 
          key={item.href}
          href={item.href} 
          className={`nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}