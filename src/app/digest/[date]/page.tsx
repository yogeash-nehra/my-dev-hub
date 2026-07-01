import { notFound } from 'next/navigation'
import { getStructuredDigest, getDigestDates } from '@/lib/digests'
import { DigestView } from '@/components/DigestView'

interface Props {
  params: Promise<{ date: string }>
}

export async function generateStaticParams() {
  return getDigestDates().map((date) => ({ date }))
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params
  const digest = getStructuredDigest(date)
  if (!digest) return {}
  const summary = digest.signal
    ? digest.signal.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`>]/g, '').slice(0, 155).trim()
    : `${digest.totalItems} developer-relevant AI signals: model releases, API changes, research, tooling.`
  return {
    title: `AI Developer Digest — ${digest.displayDate}`,
    description: summary,
    openGraph: {
      title: `AI Developer Digest — ${digest.displayDate}`,
      description: summary,
      type: 'article',
    },
  }
}

export default async function DigestPage({ params }: Props) {
  const { date } = await params
  const digest = getStructuredDigest(date)
  if (!digest) notFound()

  return <DigestView digest={digest} />
}
