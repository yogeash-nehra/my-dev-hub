'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

import { InputNode, type InputNodeData, type InputNodeType } from './nodes/InputNode'
import { SkillNode, type SkillNodeData, type SkillNodeType } from './nodes/SkillNode'
import { OutputNode, type OutputNodeType } from './nodes/OutputNode'
import { SkillPalette } from './SkillPalette'
import { GenerateSkillDialog } from './GenerateSkillDialog'
import { BUILT_IN_SKILLS, FLOW_TEMPLATES, type Skill, type FlowTemplate } from './skills'

type FlowNode = InputNodeType | SkillNodeType | OutputNodeType

const nodeTypes = {
  'input-node': InputNode,
  'skill-node': SkillNode,
  'output-node': OutputNode,
}

const DEFAULT_NODES: FlowNode[] = [
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
    if (inDegree.has(e.target)) inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
    if (adjList.has(e.source)) adjList.get(e.source)!.push(e.target)
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

function serializeNodes(nodes: FlowNode[]) {
  return nodes.map(n => {
    if (n.type === 'input-node') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onChange, ...rest } = n.data as InputNodeData
      return { ...n, data: rest }
    }
    if (n.type === 'skill-node') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { onDelete, onInstructionChange, ...rest } = n.data as SkillNodeData
      return { ...n, data: rest }
    }
    return n
  })
}

export function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [skills, setSkills] = useState<Skill[]>(BUILT_IN_SKILLS)
  const [showGenDialog, setShowGenDialog] = useState(false)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const rfInstance = useRef<ReactFlowInstance<FlowNode, Edge> | null>(null)
  const inputTextRef = useRef('')

  // Load custom skills + saved flow on mount
  useEffect(() => {
    try {
      const customSkills: Skill[] = JSON.parse(localStorage.getItem('custom-skills') ?? '[]')
      if (customSkills.length) setSkills([...BUILT_IN_SKILLS, ...customSkills])

      const savedNodes = localStorage.getItem('flow-nodes')
      const savedEdges = localStorage.getItem('flow-edges')

      if (savedNodes) {
        const loaded: FlowNode[] = JSON.parse(savedNodes).map((n: FlowNode) => {
          if (n.type === 'input-node') return { ...n, data: { ...n.data, onChange: () => {} } }
          return n
        })
        setNodes(loaded)
        const inputNode = loaded.find(n => n.type === 'input-node') as InputNodeType | undefined
        if (inputNode) inputTextRef.current = inputNode.data.inputText ?? ''
      }
      if (savedEdges) setEdges(JSON.parse(savedEdges))
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save flow (debounced 600ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('flow-nodes', JSON.stringify(serializeNodes(nodes)))
        localStorage.setItem('flow-edges', JSON.stringify(edges))
      } catch {}
    }, 600)
    return () => clearTimeout(timer)
  }, [nodes, edges])

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#7C3AED', strokeWidth: 2 } }, eds)),
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
        instruction: '',
      },
    }
    setNodes(nds => [...nds, newNode])
  }

  const updateNodeData = (id: string, patch: Partial<Record<string, unknown>>) => {
    setNodes(nds =>
      nds.map(n => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)) as FlowNode[]
    )
  }

  const loadTemplate = (template: FlowTemplate) => {
    const templateSkills = template.skillIds
      .map(id => skills.find(s => s.id === id))
      .filter(Boolean) as Skill[]

    const newNodes: FlowNode[] = [
      {
        id: 'input-1',
        type: 'input-node',
        position: { x: 200, y: 60 },
        data: { inputText: '', onChange: () => {} },
      },
    ]

    const skillNodeIds: string[] = []
    templateSkills.forEach((skill, i) => {
      const id = `skill-${++nodeIdCounter}`
      skillNodeIds.push(id)
      newNodes.push({
        id,
        type: 'skill-node',
        position: { x: 200, y: 60 + 240 * (i + 1) },
        data: {
          skillId: skill.id,
          name: skill.name,
          emoji: skill.emoji,
          color: skill.color,
          output: '',
          status: 'idle',
          instruction: '',
        },
      })
    })

    newNodes.push({
      id: 'output-1',
      type: 'output-node',
      position: { x: 180, y: 60 + 240 * (templateSkills.length + 1) },
      data: { result: '' },
    })

    const allIds = ['input-1', ...skillNodeIds, 'output-1']
    const newEdges: Edge[] = allIds.slice(0, -1).map((id, i) => ({
      id: `e-${id}-${allIds[i + 1]}`,
      source: id,
      target: allIds[i + 1],
      animated: true,
      style: { stroke: '#7C3AED', strokeWidth: 2 },
    }))

    inputTextRef.current = ''
    setNodes(newNodes)
    setEdges(newEdges)
    setRunError('')

    // Fit view after state settles
    setTimeout(() => rfInstance.current?.fitView({ padding: 0.15 }), 50)
  }

  const run = async () => {
    if (running) return

    const inputText = inputTextRef.current
    if (!inputText.trim()) {
      setRunError('Add input text before running.')
      return
    }

    const skillNodes = nodes.filter(n => n.type === 'skill-node') as SkillNodeType[]
    if (skillNodes.length === 0) {
      setRunError('Drag at least one skill onto the canvas.')
      return
    }

    setRunError('')
    setRunning(true)

    setNodes(nds =>
      nds.map(n => {
        if (n.type === 'skill-node') return { ...n, data: { ...n.data, output: '', status: 'idle' as const } }
        if (n.type === 'output-node') return { ...n, data: { ...n.data, result: '' } }
        return n
      })
    )

    const outputNode = nodes.find(n => n.type === 'output-node') as OutputNodeType | undefined
    const inputNode = nodes.find(n => n.type === 'input-node') as InputNodeType | undefined
    if (!inputNode || !outputNode) { setRunning(false); return }

    const skillIds = skillNodes.map(n => n.id)
    const sorted = topologicalSort(
      skillIds,
      edges.filter(e => skillIds.includes(e.source) && skillIds.includes(e.target))
    )

    const outputs = new Map<string, string>()
    outputs.set(inputNode.id, inputText)

    for (const skillId of sorted) {
      const skillNode = skillNodes.find(n => n.id === skillId)
      if (!skillNode) continue

      const incomingEdge = edges.find(e => e.target === skillId)
      const predecessorOutput = incomingEdge
        ? (outputs.get(incomingEdge.source) ?? inputText)
        : inputText

      const promptText = skillNode.data.instruction?.trim()
        ? `${predecessorOutput}\n\n---\nAdditional instruction: ${skillNode.data.instruction.trim()}`
        : predecessorOutput

      updateNodeData(skillId, { status: 'running', output: '' })

      const skill = skills.find(s => s.id === skillNode.data.skillId)
      const body: Record<string, string> = { prompt: promptText }
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

    const incomingToOutput = edges.find(e => e.target === outputNode.id)
    const finalOutput = incomingToOutput
      ? (outputs.get(incomingToOutput.source) ?? '')
      : (outputs.get(skillNodes[skillNodes.length - 1]?.id ?? '') ?? inputText)

    updateNodeData(outputNode.id, { result: finalOutput })
    setRunning(false)
  }

  const clearAll = () => {
    inputTextRef.current = ''
    setNodes(DEFAULT_NODES.map(n => {
      if (n.type === 'input-node') return { ...n, data: { ...n.data, inputText: '', onChange: () => {} } }
      return n
    }))
    setEdges([])
    setRunError('')
    localStorage.removeItem('flow-nodes')
    localStorage.removeItem('flow-edges')
  }

  const onSkillCreated = (skill: Skill) => {
    const newSkill: Skill = { ...skill, id: `custom-${Date.now()}`, category: 'custom' }
    setSkills(prev => [...prev, newSkill])
    try {
      const stored = JSON.parse(localStorage.getItem('custom-skills') ?? '[]') as Skill[]
      localStorage.setItem('custom-skills', JSON.stringify([...stored, newSkill]))
    } catch {}
  }

  // Inject callbacks into nodes (not persisted — re-injected each render)
  const nodesWithCallbacks: FlowNode[] = nodes.map(n => {
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
    if (n.type === 'skill-node') {
      return {
        ...n,
        data: {
          ...n.data,
          onDelete: () => setNodes(nds => nds.filter(node => node.id !== n.id)),
          onInstructionChange: (instruction: string) => updateNodeData(n.id, { instruction }),
        },
      }
    }
    return n
  })

  return (
    <div style={{ display: 'flex', height: '100%', background: '#030712' }}>
      <SkillPalette
        skills={skills}
        onGenerateClick={() => setShowGenDialog(true)}
        onLoadTemplate={loadTemplate}
      />

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
          {runError ? (
            <span style={{ fontSize: 12, color: '#FCA5A5', flex: 1 }}>
              ⚠ {runError}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>
              Drag skills or load a template → connect nodes → Run ▶
            </span>
          )}
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
            deleteKeyCode="Delete"
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
