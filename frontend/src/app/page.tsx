'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Community {
  id: string
  name: string
  description?: string
  createdAt: string
  _count: {
    members: number
    giftContributions: number
  }
}

export default function Home() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/communities`)
      .then((res) => res.json())
      .then((data) => {
        setCommunities(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch communities:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading communities...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Gift Economy Tracker</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          A platform to track and visualize gifts, favors, and contributions in your community.
          This is not about strict accounting, but about making generosity visible.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Communities</h2>
        {communities.length === 0 ? (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              No communities yet. Create your first community to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.id}`}
                className="block bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
                {community.description && (
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {community.description}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-slate-500">
                  <span>{community._count.members} members</span>
                  <span>{community._count.giftContributions} gifts</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-gift-primary/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Track Contributions</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Record gifts, favors, and help offered or received within your community
          </p>
        </div>
        <div className="bg-gift-secondary/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Visualize Flows</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            See patterns of generosity and mutual aid in your community
          </p>
        </div>
        <div className="bg-gift-accent/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Soft Metrics</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Values are indicators, not strict accounting - focus on visibility
          </p>
        </div>
      </div>
    </div>
  )
}
