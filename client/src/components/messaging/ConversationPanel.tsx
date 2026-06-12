/**
 * ConversationPanel â In-app chat between customer and driver for a booking.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import {
  getOrCreateConversation,
  listConversationMessages,
  sendConversationMessage,
} from "@/lib/db";
import type { Message } from "@/lib/database.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConversationPanelProps {
  bookingId: string;
  customerId: string;
  driverId: string;
  currentUserId: string;
  otherPartyLabel: string;
  onClose: () => void;
}

export function ConversationPanel({
  bookingId,
  customerId,
  driverId,
  currentUserId,
  otherPartyLabel,
  onClose,
}: ConversationPanelProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThread = useCallback(async () => {
    setLoading(true);
    const { data: conv, error: convError } = await getOrCreateConversation(
      bookingId,
      customerId,
      driverId
    );
    if (convError || !conv) {
      toast.error(convError?.message ?? "Could not open conversation.");
      setLoading(false);
      return;
    }
    setConversationId(conv.id);
    const { data: msgs, error: msgError } = await listConversationMessages(conv.id);
    if (msgError) {
      toast.error(msgError.message);
    } else {
      setMessages(msgs ?? []);
    }
    setLoading(false);
  }, [bookingId, customerId, driverId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!conversationId || !draft.trim()) return;
    setSending(true);
    const { data, error } = await sendConversationMessage(
      conversationId,
      currentUserId,
      draft
    );
    setSending(false);
    if (error || !data) {
      toast.error(error?.message ?? "Failed to send message.");
      return;
    }
    setMessages((prev) => [...prev, data as Message]);
    setDraft("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <div>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                Messages
              </p>
              <p className="text-xs text-muted-foreground">{otherPartyLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close messages"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-[280px] flex-1 flex-col gap-3 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Loading messagesâ¦</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No messages yet. Say hello to coordinate pickup and delivery.
            </p>
          ) : (
            messages.map((msg) => {
              const mine = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 border-t border-border p-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a messageâ¦"
            className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={loading || !conversationId}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || sending || !draft.trim()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
