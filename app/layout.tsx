import { ReactNode } from 'react'
import './globals.css'
import { getServerSession } from 'next-auth'
import SessionProvider from './components/SessionProvider'

export const metadata = {
  title: 'Sheet Menu',
  description: 'Make menu easier than 2-min noodles',
}

export default async function RootLayout({ children }:{
  children:ReactNode
}) {
  const session = await getServerSession()
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
