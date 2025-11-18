'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Member {
  id: string
  name: string
  email?: string
  _count: {
    givenContributions: number
    receivedContributions: number
  }
}

interface Community {
  id: string
  name: string
  description?: string
  members: Member[]
}

export default function CommunityPage() {
  const params = useParams()
  const communityId = params.id as string
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/communities/${communityId}`)
      .then((res) => res.json())
      .then((data) => {
        setCommunity(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch community:', err)
        setLoading(false)
      })
  }, [communityId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading community...</div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Community not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{community.name}</h1>
        {community.description && (
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {community.description}
          </p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Members</h2>
        {community.members.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">No members yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {community.members.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="block bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{member.name}</h3>
                <div className="flex gap-4 text-sm text-slate-500">
                  <span className="text-gift-primary">
                    ↑ {member._count.givenContributions} given
                  </span>
                  <span className="text-gift-secondary">
                    ↓ {member._count.receivedContributions} received
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
