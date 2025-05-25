export default function AppHome() {
  return (
    <div className="app-home">
      <div className="welcome-section">
        <h1>Welcome to Apexion</h1>
        <p>Your all-in-one productivity app</p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card" onClick={() => window.location.href = '/app/text-to-pdf'}>
          <div className="feature-icon">📄</div>
          <h3>Text to PDF</h3>
          <p>Convert your text to professional PDFs</p>
        </div>
        
        <div className="feature-card" onClick={() => window.location.href = '/app/wallpaper-gallery'}>
          <div className="feature-icon">🖼️</div>
          <h3>Wallpaper Gallery</h3>
          <p>Browse beautiful wallpapers</p>
        </div>
      </div>
    </div>
  )
}