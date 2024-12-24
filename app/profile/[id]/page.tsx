import { Suspense } from 'react'
import ProfileContent from './ProfileContent'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ params }: PageProps) {
  const resolvedParams = await params
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
      </div>
    }>
      <ProfileContent userId={resolvedParams.id} />
    </Suspense>
  )
}