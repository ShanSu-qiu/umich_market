"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Send, X } from "lucide-react"

type ChatMessage = {
  id: string
  conversation_id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

interface ChatModalProps {
  open: boolean
  onClose: () => void
  listingId: string
  listingTitle: string
  sellerId: string
  sellerName: string
  sellerEmail: string
}

export function ChatModal({
  open,
  onClose,
  listingId,
  listingTitle,
  sellerId,
  sellerName,
  sellerEmail,
}: ChatModalProps) {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine who the other person is
  const isBuyer = user?.id !== sellerId
  const otherName = isBuyer ? sellerName : "Buyer"
  const receiverId = isBuyer ? sellerId : ""

  // Find or create conversation + load messages
  useEffect(() => {
    if (!open || !user) return

    const init = async () => {
      setLoading(true)

      // Find existing conversation
      let { data: conv, error: findError } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq(isBuyer ? "buyer_id" : "seller_id", user.id)
        .maybeSingle()

      if (findError) {
        console.error("Failed to find conversation:", findError)
      }

      if (!conv && isBuyer) {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: sellerId,
          })
          .select()
          .maybeSingle()

        if (convError) {
          console.error("Failed to create conversation:", convError)
          setChatError(`Failed to start chat: ${convError.message}`)
        }
        conv = newConv
      }

      if (conv) {
        setConversationId(conv.id)

        // Load existing messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true })

        setMessages((msgs as ChatMessage[]) || [])

        // Mark unread messages as read
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", conv.id)
          .eq("receiver_id", user.id)
          .eq("read", false)
      }

      setLoading(false)
    }

    init()
  }, [open, user, listingId, sellerId, isBuyer, supabase])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId || !open) return

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // Mark as read if we're the receiver
          if (newMsg.receiver_id === user?.id) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id)
              .then(() => {})
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, open, user, supabase])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const [chatError, setChatError] = useState("")

  const handleSend = async () => {
    if (!content.trim() || !user || sending) return
    if (!conversationId) {
      setChatError("Chat not ready. Please close and reopen.")
      return
    }

    const msgContent = content.trim()
    setContent("")
    setSending(true)

    const actualReceiverId = isBuyer ? sellerId : messages.find((m) => m.sender_id !== user.id)?.sender_id || sellerId

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: actualReceiverId,
      content: msgContent,
    })

    if (error) {
      console.error("Failed to send message:", error)
      setContent(msgContent) // Restore the message
    } else {
      // Send email notification (non-blocking)
      fetch("/api/messages/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail,
          sellerName,
          buyerName: user.name,
          listingTitle,
          messageContent: msgContent,
        }),
      }).catch(() => {})
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent
        className="max-w-md p-0 gap-0 flex flex-col h-[70vh] max-h-[600px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="text-base">
            Chat with {otherName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground truncate">
            Re: {listingTitle}
          </p>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t shrink-0">
          {chatError && (
            <p className="text-xs text-destructive mb-2">{chatError}</p>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => { setContent(e.target.value); setChatError("") }}
              onKeyDown={handleKeyDown}
              placeholder={loading ? "Loading..." : !conversationId ? "Initializing chat..." : "Type a message..."}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!content.trim() || sending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
