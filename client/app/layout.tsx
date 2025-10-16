import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext' 

export const metadata = {
  title: 'JIRA MVP',
  description: 'A minimal JIRA-like project management tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
       </ThemeProvider>
      </body>
    </html>
  )
}