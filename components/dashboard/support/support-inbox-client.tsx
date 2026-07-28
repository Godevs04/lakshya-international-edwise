"use client";

/* eslint-disable react-hooks/set-state-in-effect -- async inbox/detail loaders sync remote CRM state */

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import {
  claimOrAssignSupportConversationAction,
  closeSupportConversationAction,
  getSupportAssignableUsersAction,
  getSupportConversationDetailAction,
  getSupportInboxAction,
  sendSupportAgentMessageAction,
} from "@/lib/actions/support.actions";
import { useSupportSocket } from "@/hooks/use-support-socket";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type Tab = "waiting" | "assigned" | "resolved";

type InboxItem = {
  _id: string;
  status: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  qualification?: { name?: string; country?: string; degree?: string; phone?: string };
  assignedTo?: { name?: string } | null;
};

type Message = {
  _id: string;
  senderType: string;
  body: string;
  createdAt: string;
};

interface SupportInboxClientProps {
  canAssign: boolean;
}

export function SupportInboxClient({ canAssign }: SupportInboxClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConversation = searchParams.get("conversation");

  const [tab, setTab] = useState<Tab>("waiting");
  const [counts, setCounts] = useState({ waiting: 0, assigned: 0, resolved: 0 });
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversation);
  const [messages, setMessages] = useState<Message[]>([]);
  const [detail, setDetail] = useState<InboxItem | null>(null);
  const [composer, setComposer] = useState("");
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string }>>([]);
  const [assignTo, setAssignTo] = useState("");
  const [typingLabel, setTypingLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refreshInbox = useCallback(async (status: Tab) => {
    const result = await getSupportInboxAction({ status, page: 1, limit: 40 });
    if (result.success && result.data) {
      setItems(
        result.data.items.map((item) => ({
          ...item,
          _id: String(item._id),
          lastMessageAt: item.lastMessageAt
            ? new Date(item.lastMessageAt).toISOString()
            : undefined,
        })) as InboxItem[]
      );
      setCounts(result.data.counts);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const result = await getSupportConversationDetailAction(id);
    if (!result.success || !result.data) {
      setError(result.error ?? "Failed to load");
      return;
    }
    setDetail({
      ...(result.data.conversation as unknown as InboxItem),
      _id: String(result.data.conversation._id),
    });
    setMessages(
      result.data.messages.map((m) => ({
        _id: String(m._id),
        senderType: m.senderType,
        body: m.body,
        createdAt: new Date(m.createdAt).toISOString(),
      }))
    );
  }, []);

  useEffect(() => {
    void refreshInbox(tab);
  }, [tab, refreshInbox]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (!canAssign) return;
    void getSupportAssignableUsersAction().then((users) => {
      if (Array.isArray(users)) {
        setAssignees(
          users.map((u: { _id: string; name: string }) => ({
            id: u._id,
            name: u.name,
          }))
        );
      }
    });
  }, [canAssign]);

  const onSocketMessage = useCallback(
    (message: {
      id: string;
      conversationId: string;
      senderType: string;
      body: string;
      createdAt: string;
    }) => {
      if (message.conversationId !== selectedId) {
        void refreshInbox(tab);
        return;
      }
      setMessages((prev) =>
        prev.some((m) => m._id === message.id)
          ? prev
          : [
              ...prev,
              {
                _id: message.id,
                senderType: message.senderType,
                body: message.body,
                createdAt: message.createdAt,
              },
            ]
      );
    },
    [selectedId, refreshInbox, tab]
  );

  const { connected, sendMessage, emitTyping, markSeen } = useSupportSocket({
    enabled: true,
    asVisitor: false,
    conversationId: selectedId,
    onMessage: onSocketMessage,
    onTyping: (payload) => {
      if (payload.who === "visitor") setTypingLabel("Visitor is typing…");
    },
    onStopTyping: () => setTypingLabel(null),
    onAssigned: () => {
      void refreshInbox(tab);
      if (selectedId) void loadDetail(selectedId);
    },
    onClosed: () => {
      void refreshInbox(tab);
      if (selectedId) void loadDetail(selectedId);
    },
  });

  useEffect(() => {
    if (selectedId) markSeen();
  }, [selectedId, messages.length, markSeen]);

  const tabs = useMemo(
    () =>
      [
        { id: "waiting" as const, label: `Waiting (${counts.waiting})` },
        { id: "assigned" as const, label: `Assigned (${counts.assigned})` },
        { id: "resolved" as const, label: `Resolved (${counts.resolved})` },
      ] as const,
    [counts]
  );

  const send = () => {
    const body = composer.trim();
    if (!body || !selectedId) return;
    setComposer("");
    emitTyping(false);
    startTransition(async () => {
      try {
        if (connected) {
          await sendMessage(body);
        } else {
          const result = await sendSupportAgentMessageAction({
            conversationId: selectedId,
            body,
          });
          if (!result.success) setError(result.error ?? "Send failed");
          else await loadDetail(selectedId);
        }
        void refreshInbox(tab);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Send failed");
      }
    });
  };

  return (
    <div className="grid min-h-[70vh] gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-2xl border border-border bg-card">
        <div className="flex gap-1 border-b border-border p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-xl px-2 py-2 text-xs font-semibold",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <ul className="max-h-[65vh] overflow-y-auto p-2">
          {items.map((item) => (
            <li key={item._id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(item._id);
                  router.replace(`/dashboard/support?conversation=${item._id}`);
                }}
                className={cn(
                  "mb-1 w-full rounded-xl px-3 py-3 text-left transition",
                  selectedId === item._id ? "bg-accent" : "hover:bg-muted/60"
                )}
              >
                <p className="text-sm font-semibold text-foreground">
                  {item.qualification?.name ?? "Visitor"}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {item.qualification?.degree}
                  {item.qualification?.country ? ` · ${item.qualification.country}` : ""}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {item.lastMessagePreview || "No messages yet"}
                </p>
                {item.lastMessageAt && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true })}
                  </p>
                )}
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">No chats</li>
          )}
        </ul>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-card">
        {!selectedId || !detail ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a conversation
          </div>
        ) : (
          <>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <p className="font-semibold text-foreground">
                  {detail.qualification?.name ?? "Visitor"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {detail.qualification?.phone}
                  {detail.qualification?.country ? ` · ${detail.qualification.country}` : ""}
                  {detail.qualification?.degree ? ` · ${detail.qualification.degree}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {detail.status === "waiting" && (
                  <button
                    type="button"
                    disabled={pending}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    onClick={() =>
                      startTransition(async () => {
                        await claimOrAssignSupportConversationAction({
                          conversationId: detail._id,
                        });
                        await loadDetail(detail._id);
                        await refreshInbox(tab);
                      })
                    }
                  >
                    Claim
                  </button>
                )}
                {canAssign && (
                  <div className="flex items-center gap-1">
                    <select
                      value={assignTo}
                      onChange={(e) => setAssignTo(e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="">Assign to…</option>
                      {assignees.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!assignTo || pending}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                      onClick={() =>
                        startTransition(async () => {
                          await claimOrAssignSupportConversationAction({
                            conversationId: detail._id,
                            assigneeId: assignTo,
                          });
                          await loadDetail(detail._id);
                          await refreshInbox(tab);
                        })
                      }
                    >
                      Assign
                    </button>
                  </div>
                )}
                {detail.status !== "resolved" && detail.status !== "closed" && (
                  <button
                    type="button"
                    disabled={pending}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                    onClick={() =>
                      startTransition(async () => {
                        await closeSupportConversationAction({
                          conversationId: detail._id,
                          status: "resolved",
                        });
                        await refreshInbox("resolved");
                        setTab("resolved");
                        await loadDetail(detail._id);
                      })
                    }
                  >
                    Resolve
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto bg-muted/20 p-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    message.senderType === "agent"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : message.senderType === "system"
                        ? "mx-auto bg-slate-200 text-slate-700"
                        : "bg-white shadow-sm"
                  )}
                >
                  {message.body}
                </div>
              ))}
              {typingLabel && <p className="text-xs text-muted-foreground">{typingLabel}</p>}
            </div>

            {detail.status !== "resolved" && detail.status !== "closed" && (
              <div className="border-t border-border p-3">
                {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
                <div className="flex items-center gap-2">
                  <input
                    value={composer}
                    onChange={(e) => {
                      setComposer(e.target.value);
                      emitTyping(Boolean(e.target.value.trim()));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send();
                    }}
                    className="flex-1 rounded-full border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Reply as advisor…"
                  />
                  <button
                    type="button"
                    onClick={send}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
