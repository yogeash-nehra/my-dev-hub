'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { InputNode, type InputNodeType } from './nodes/InputNode'
import { SkillNode, type SkillNodeType } from './nodes/SkillNode'
import { OutputNode, type OutputNodeType } from './nodes/OutputNode'
import { SkillPalette } from './SkillPalette'
import { GenerateSkillDialog } from './GenerateSkillDialog'
import { BUILT_IN_SKILLS, type Skill } from './skills'

type FlowNode = InputNodeType | SkillNodeType | OutputNodeType

const nodeTypes = {
  'input-node': InputNode,
  'skill-node': SkillNode,
  'output-node': OutputNode,
}

const initialNodes: FlowNode[] = [
  {
    id: 'input-1',
    type: 'input-node',
    position: { x: 200, y: 80 },
    data: { inputText: '', onChange: () => {} },
  },
  {
    id: 'output-1',
    type: 'output-node',
    position: { x: 180, y: 420 },
    data: { result: '' },
  },
]

let nodeIdCounter = 10

function topologicalSort(nodeIds: string[], edges: Edge[]): string[] {
  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  for (const id of nodeIds) {
    inDegree.set(id, 0)
    adjList.set(id, [])
  }
  for (const e of edges) {
    if (inDegree.has(e.target)) {
      inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    }
    if (adjList.has(e.source)) {
      adjList.get(e.source)!.push(e.target)
    }
  }

  const queue = nodeIds.filter(id => inDegree.get(id) === 0)
  const sorted: string[] = []
  while (queue.length > 0) {
    const curr = queue.shift()!
    sorted.push(curr)
    for (const next of adjList.get(curr) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1
      inDegree.set(next, deg)
      if (deg === 0) queue.push(next)
    }
  }
  return sorted
}

export function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [skills, setSkills] = useState<Skill[]>(BUILT_IN_SKILLS)
  const [showGenDialog, setShowGenDialog] = useState(false)
  const [running, setRunning] = useState(false)
  const rfInstance = useRef<ReactFlowInstance<FlowNode, Edge> | null>(null)

  // Keep inputText in a ref so the node callback always has latest value
  const inputTextRef = useRef('')

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#7C3AED', strokeWidth: 2 } }, eds)),
    [setEdges]
  )

  const onInit = useCallback((instance: ReactFlowInstance<FlowNode, Edge>) => {
    rfInstance.current = instance
  }, [])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/skill')
    if (!raw || !rfInstance.current) return
    const skill = JSON.parse(raw) as Skill

    const position = rfInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })

    const newNode: SkillNodeType = {
      id: `skill-${++nodeIdCounter}`,
      type: 'skill-node',
      position,
      data: {
        skillId: skill.id,
        name: skill.name,
        emoji: skill.emoji,
        color: skill.color,
        output: '',
        status: 'idle',
      },
    }
    setNodes(nds => [...nds, newNode])
  }

  const updateNodeData = (id: string, patch: Partial<Record<string, unknown>>) => {
    setNodes(nds =>
      nds.map(n => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) as FlowNode[]
    )
  }

  const run = async () => {
    if (running) return
    setRunning(true)

    // Reset all nodes
    setNodes(nds =>
      nds.map(n => {
        if (n.type === 'skill-node') return { ...n, data: { ...n.data, output: '', status: 'idle' as const } }
        if (n.type === 'output-node') return { ...n, data: { ...n.data, result: '' } }
        return n
      })
    )

    const inputNode = nodes.find(n => n.type === 'input-node') as InputNodeType | undefined
    const outputNode = nodes.find(n => n.type === 'output-node') as OutputNodeType | undefined
    const skillNodes = nodes.filter(n => n.type === 'skill-node') as SkillNodeType[]

    if (!inputNode || !outputNode) { setRunning(false); return }

    const inputText = inputTextRef.current
    if (!inputText.trim()) { setRunning(false); return }

    // Build sorted execution order for skill nodes only
    const skillIds = skillNodes.map(n => n.id)
    const sorted = topologicalSort(skillIds, edges.filter(e => skillIds.includes(e.source) && skillIds.includes(e.target)))

    // Map of node output (accumulated as skills run)
    const outputs = new Map<string, string>()
    outputs.set(inputNode.id, inputText)

    for (const skillId of sorted) {
      const skillNode = skillNodes.find(n => n.id === skillId)
      if (!skillNode) continue

      // Find predecessor: edge coming into this skill node
      const incomingEdge = edges.find(e => e.target === skillId)
      const predecessorOutput = incomingEdge ? (outputs.get(incomingEdge.source) ?? inputText) : inputText

      updateNodeData(skillId, { status: 'running', output: '' })

      const skill = skills.find(s => s.id === skillNode.data.skillId)
      const body: Record<string, string> = { prompt: predecessorOutput }
      if (skill?.systemPrompt) {
        body.systemPrompt = skill.systemPrompt
      } else {
        body.role = skillNode.data.skillId
      }

      let accumulated = ''
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok || !res.body) throw new Error('Request failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          updateNodeData(skillId, { output: accumulated, status: 'running' })
        }

        outputs.set(skillId, accumulated)
        updateNodeData(skillId, { status: 'done' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error'
        updateNodeData(skillId, { output: msg, status: 'error' })
        outputs.set(skillId, accumulated || msg)
      }
    }

    // Pipe final output to output node
    // Find what connects to output node
    const incomingToOutput = edges.find(e => e.target === outputNode.id)
    const finalOutput = incomingToOutput
      ? (outputs.get(incomingToOutput.source) ?? '')
      : (outputs.get(skillNodes[skillNodes.length - 1]?.id ?? '') ?? inputText)

    updateNodeData(outputNode.id, { result: finalOutput })
    setRunning(false)
  }

  const clearAll = () => {
    inputTextRef.current = ''
    setNodes(initialNodes.map(n => {
      if (n.type === 'input-node') return { ...n, data: { ...n.data, inputText: '', onChange: () => {} } }
      return n
    }))
    setEdges([])
  }

  const onSkillCreated = (skill: Skill) => {
    const newSkill: Skill = { ...skill, id: `custom-${Date.now()}`, category: 'custom' }
    setSkills(prev => [...prev, newSkill])
    // Persist to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('custom-skills') ?? '[]') as Skill[]
      localStorage.setItem('custom-skills', JSON.stringify([...stored, newSkill]))
    } catch {}
  }

  // Wire up the input node onChange
  const nodesWithCallbacks = nodes.map(n => {
    if (n.type === 'input-node') {
      return {
        ...n,
        data: {
          ...n.data,
          onChange: (text: string) => {
            inputTextRef.current = text
            updateNodeData(n.id, { inputText: text })
          },
        },
      }
    }
    return n
  })

  return (
    <div style={{ display: 'flex', height: '100%', background: '#030712' }}>
      <SkillPalette skills={skills} onGenerateClick={() => setShowGenDialog(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div
          style={{
            height: 52,
            background: '#080D14',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>
            Drag skills from the palette → connect nodes → Run ▶
          </span>
          <button
            onClick={clearAll}
            style={{
              padding: '6px 14px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#64748B',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={run}
            disabled={running}
            style={{
              padding: '7px 20px',
              background: running
                ? 'rgba(124,58,237,0.3)'
                : 'linear-gradient(135deg, #7C3AED, #2563EB)',
              border: 'none',
              borderRadius: 8,
              color: running ? '#6B7280' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: running ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '0.01em',
            }}
          >
            {running ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
                Running…
              </>
            ) : (
              'Run ▶'
            )}
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1 }} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: '#030712' }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#7C3AED', strokeWidth: 2 },
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#1E293B"
            />
            <Controls
              style={{
                background: '#0D1117',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
              }}
            />
            <MiniMap
              style={{
                background: '#080D14',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              nodeColor={n => {
                if (n.type === 'input-node') return '#7C3AED'
                if (n.type === 'output-node') return '#10B981'
                return '#3B82F6'
              }}
            />
          </ReactFlow>
        </div>
      </div>

      {showGenDialog && (
        <GenerateSkillDialog
          onClose={() => setShowGenDialog(false)}
          onSkillCreated={onSkillCreated}
        />
      )}
    </div>
  )
}
