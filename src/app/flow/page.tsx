import { FlowBuilder } from '@/components/flow/FlowBuilder'

export const metadata = {
  title: 'Flow Builder — Dev Hub',
  description: 'Visual AI workflow builder. Chain skills, run flows, generate custom agents.',
}

export default function FlowPage() {
  return (
    <div style={{ height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <FlowBuilder />
    </div>
  )
}
