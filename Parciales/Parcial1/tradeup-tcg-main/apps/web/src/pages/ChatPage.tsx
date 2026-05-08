import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../lib/api'
import { useUser } from '@clerk/clerk-react'

interface ChatMessage {
  _id: string
  sender: { _id: string; username: string }
  text: string
  createdAt: string
}

export function ChatPage() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const apiFn = useApi()
  const { user: clerkUser } = useUser()
  const qc = useQueryClient()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')

  // Poll messages every 3s
  const { data, isLoading } = useQuery({
    queryKey: ['chat', transactionId],
    queryFn: () => apiFn.chat.messages(transactionId!),
    refetchInterval: 3000,
    enabled: !!transactionId,
  })

  const messages: ChatMessage[] = data?.messages ?? []

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const sendMutation = useMutation({
    mutationFn: (txt: string) => apiFn.chat.send(transactionId!, txt),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: ['chat', transactionId] })
    },
  })

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || sendMutation.isPending) return
    sendMutation.mutate(trimmed)
  }, [text, sendMutation])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const myUsername = clerkUser?.username ?? clerkUser?.firstName ?? 'Yo'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/orders" className="text-[var(--color-muted)] hover:text-white transition-colors text-sm">
          ← Mis órdenes
        </Link>
        <span className="text-[var(--color-border)]">/</span>
        <h1 className="text-white font-semibold text-sm truncate">
          Chat de transacción
        </h1>
      </div>

      {/* Info banner */}
      <div className="mb-4 p-3 rounded-xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 text-xs text-[var(--color-brand-light)]">
        Coordina los detalles del intercambio: dirección de envío, método y confirmación.
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-muted)]">
            <p className="text-3xl mb-2">&#x1F4AC;</p>
            <p className="text-sm">No hay mensajes aún.</p>
            <p className="text-xs mt-1">Sé el primero en escribir para coordinar el intercambio.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.username === myUsername ||
            (clerkUser?.username && msg.sender.username === clerkUser.username)
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${
                isMe
                  ? 'bg-[var(--color-brand)] text-white rounded-2xl rounded-br-sm'
                  : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white rounded-2xl rounded-bl-sm'
              } px-4 py-2.5`}>
                {!isMe && (
                  <p className="text-[10px] font-semibold text-[var(--color-brand-light)] mb-1">
                    {msg.sender.username}
                  </p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${
                  isMe ? 'text-white/60 text-right' : 'text-[var(--color-muted)]'
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          rows={2}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-white text-sm placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="px-4 py-2 rounded-xl bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand)]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-end"
        >
          {sendMutation.isPending
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
            : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
