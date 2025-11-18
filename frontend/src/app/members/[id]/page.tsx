'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Member {
  id: string
  name: string
  email?: string
  community: {
    id: string
    name: string
  }
  givenContributions: Array<{
    id: string
    descriptionMarkdown: string
    timestamp: string
    valueEstimate?: number
    tagsJson: string
    receiver?: {
      id: string
      name: string
    }
  }>
  receivedContributions: Array<{
    id: string
    descriptionMarkdown: string
    timestamp: string
    valueEstimate?: number
    tagsJson: string
    giver: {
      id: string
      name: string
    }
  }>
  balanceSnapshots: Array<{
    id: string
    timestamp: string
    givenCount: number
    receivedCount: number
    netBalance: number
    metaJson: string
  }>
  stats: {
    totalGiven: number
    totalReceived: number
    totalValueGiven: number
    totalValueReceived: number
  }
}

export default function MemberProfile() {
  const params = useParams()
  const memberId = params.id as string
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/members/${memberId}/profile`)
      .then((res) => res.json())
      .then((data) => {
        setMember(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch member:', err)
        setLoading(false)
      })
  }, [memberId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading member profile...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Member not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{member.name}</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Member of{' '}
              <a
                href={`/communities/${member.community.id}`}
                className="text-gift-primary hover:underline"
              >
                {member.community.name}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gift-primary/10 rounded-lg p-6">
          <div className="text-2xl font-bold">{member.stats.totalGiven}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Gifts Given</div>
        </div>
        <div className="bg-gift-secondary/10 rounded-lg p-6">
          <div className="text-2xl font-bold">{member.stats.totalReceived}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Gifts Received</div>
        </div>
        <div className="bg-gift-accent/10 rounded-lg p-6">
          <div className="text-2xl font-bold">
            {member.stats.totalValueGiven.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Value Given (est.)
          </div>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-6">
          <div className="text-2xl font-bold">
            {member.stats.totalValueReceived.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Value Received (est.)
          </div>
        </div>
      </div>

      {/* Balance Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> These are soft indicators, not strict accounting. The goal
          is visibility into patterns of generosity, not precise balancing.
        </p>
      </div>

      {/* Gifts Given */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gifts Given</h2>
        {member.givenContributions.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">No gifts given yet.</p>
        ) : (
          <div className="space-y-4">
            {member.givenContributions.map((gift) => (
              <div
                key={gift.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-slate-500 mb-1">
                      To:{' '}
                      {gift.receiver ? (
                        <span className="font-semibold">{gift.receiver.name}</span>
                      ) : (
                        <span className="italic">Community-wide gift</span>
                      )}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">
                      {gift.descriptionMarkdown}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-slate-500">
                      {new Date(gift.timestamp).toLocaleDateString()}
                    </div>
                    {gift.valueEstimate && (
                      <div className="text-sm text-gift-primary font-semibold">
                        ~{gift.valueEstimate}
                      </div>
                    )}
                  </div>
                </div>
                {gift.tagsJson !== '[]' && (
                  <div className="flex gap-2 mt-2">
                    {JSON.parse(gift.tagsJson).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gifts Received */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Gifts Received</h2>
        {member.receivedContributions.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-300">No gifts received yet.</p>
        ) : (
          <div className="space-y-4">
            {member.receivedContributions.map((gift) => (
              <div
                key={gift.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="text-sm text-slate-500 mb-1">
                      From: <span className="font-semibold">{gift.giver.name}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">
                      {gift.descriptionMarkdown}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-slate-500">
                      {new Date(gift.timestamp).toLocaleDateString()}
                    </div>
                    {gift.valueEstimate && (
                      <div className="text-sm text-gift-secondary font-semibold">
                        ~{gift.valueEstimate}
                      </div>
                    )}
                  </div>
                </div>
                {gift.tagsJson !== '[]' && (
                  <div className="flex gap-2 mt-2">
                    {JSON.parse(gift.tagsJson).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Snapshots */}
      {member.balanceSnapshots.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Balance History</h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Given
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Net Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {member.balanceSnapshots.map((snapshot) => (
                  <tr key={snapshot.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(snapshot.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {snapshot.givenCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {snapshot.receivedCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          snapshot.netBalance > 0
                            ? 'text-gift-primary'
                            : snapshot.netBalance < 0
                            ? 'text-gift-secondary'
                            : 'text-slate-500'
                        }
                      >
                        {snapshot.netBalance.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
