"use client";

/* eslint-disable react-hooks/set-state-in-effect -- widget bootstraps visitor id + FAQ list from server */

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { MessageCircle, X, Send, ArrowLeft } from "lucide-react";
import {
  createSupportVisitorIdAction,
  getPopularSupportFaqsAction,
  getSupportVisitorThreadAction,
  markSupportFaqFeedbackAction,
  sendSupportVisitorMessageAction,
  startSupportAdvisorChatAction,
} from "@/lib/actions/support.actions";
import { useSupportSocket } from "@/hooks/use-support-socket";
import {
  SUPPORT_ADMISSION_STATUSES,
  SUPPORT_COLLATERAL_PREFERENCES,
} from "@/lib/constants/support";
import { cn } from "@/lib/utils";

type Step = "home" | "faq-answer" | "qualify" | "chat";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

type ChatMessage = {
  id: string;
  senderType: string;
  body: string;
  createdAt: string;
};

const QUALIFY_STEPS = [
  { key: "country", label: "Which country are you planning to study in?" },
  { key: "degree", label: "What degree are you pursuing?" },
  { key: "admissionStatus", label: "Do you already have an admission letter?" },
  { key: "collateralPreference", label: "Loan with or without collateral?" },
  { key: "name", label: "Your full name?" },
  { key: "phone", label: "Your phone number?" },
  { key: "email", label: "Email (optional) — leave blank to skip" },
] as const;

const ADMISSION_LABELS: Record<(typeof SUPPORT_ADMISSION_STATUSES)[number], string> = {
  exploring: "Still exploring",
  applied: "Applied",
  got_admission: "Got admission",
  visa: "Visa stage",
};

const COLLATERAL_LABELS: Record<(typeof SUPPORT_COLLATERAL_PREFERENCES)[number], string> = {
  with_collateral: "With collateral",
  without_collateral: "Without collateral",
  unsure: "Not sure yet",
};

const VISITOR_KEY = "lakshya_support_visitor_id";

function upsertChatMessage(prev: ChatMessage[], message: ChatMessage): ChatMessage[] {
  if (prev.some((entry) => entry.id === message.id)) return prev;

  const optimisticIndex = prev.findIndex(
    (entry) =>
      entry.id.startsWith("local-") &&
      entry.senderType === message.senderType &&
      entry.body === message.body
  );
  if (optimisticIndex >= 0) {
    const next = [...prev];
    next[optimisticIndex] = message;
    return next;
  }

  return [...prev, message];
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("home");
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [activeFaq, setActiveFaq] = useState<FaqItem | null>(null);
  const [qualifyIndex, setQualifyIndex] = useState(0);
  const [qualifyDraft, setQualifyDraft] = useState("");
  const [qualification, setQualification] = useState<Record<string, string>>({});
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState("");
  const [chatClosed, setChatClosed] = useState(false);
  const [typingLabel, setTypingLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) {
      setVisitorId(existing);
      return;
    }
    void createSupportVisitorIdAction().then((result) => {
      if (result.success && result.data) {
        window.localStorage.setItem(VISITOR_KEY, result.data.visitorId);
        setVisitorId(result.data.visitorId);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    void getPopularSupportFaqsAction(8).then((result) => {
      if (result.success && result.data) setFaqs(result.data.faqs);
    });
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingLabel]);

  const onSocketMessage = useCallback(
    (message: { id: string; senderType: string; body: string; createdAt: string }) => {
      setMessages((prev) =>
        upsertChatMessage(prev, {
          id: message.id,
          senderType: message.senderType,
          body: message.body,
          createdAt: message.createdAt,
        })
      );
    },
    []
  );

  const { connected, sendMessage, emitTyping, markSeen } = useSupportSocket({
    enabled: open && Boolean(visitorId) && step === "chat",
    visitorId: visitorId ?? undefined,
    asVisitor: true,
    conversationId,
    onMessage: onSocketMessage,
    onTyping: (payload) => {
      if (payload.who === "agent") setTypingLabel(`${payload.name ?? "Advisor"} is typing…`);
    },
    onStopTyping: () => setTypingLabel(null),
    onAssigned: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          senderType: "system",
          body: "An advisor joined the chat.",
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    onClosed: () => {
      setChatClosed(true);
      setComposer("");
      setTypingLabel(null);
      setError("This conversation is closed.");
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-close-${Date.now()}`,
          senderType: "system",
          body: "This conversation was closed. Thank you!",
          createdAt: new Date().toISOString(),
        },
      ]);
    },
  });

  useEffect(() => {
    if (step === "chat" && conversationId) markSeen();
  }, [step, conversationId, messages.length, markSeen]);

  const openFaq = (faq: FaqItem) => {
    setActiveFaq(faq);
    setStep("faq-answer");
    void markSupportFaqFeedbackAction(faq.id, false);
  };

  const startQualify = () => {
    setStep("qualify");
    setQualifyIndex(0);
    setQualifyDraft("");
    setError(null);
    setChatClosed(false);
    setConversationId(null);
    setMessages([]);
  };

  const submitQualifyAnswer = () => {
    const current = QUALIFY_STEPS[qualifyIndex];
    if (!current) return;

    if (current.key === "email" && !qualifyDraft.trim()) {
      // optional
    } else if (current.key === "admissionStatus") {
      if (
        !SUPPORT_ADMISSION_STATUSES.includes(
          qualifyDraft as (typeof SUPPORT_ADMISSION_STATUSES)[number]
        )
      ) {
        setError("Pick one of the options");
        return;
      }
    } else if (current.key === "collateralPreference") {
      if (
        !SUPPORT_COLLATERAL_PREFERENCES.includes(
          qualifyDraft as (typeof SUPPORT_COLLATERAL_PREFERENCES)[number]
        )
      ) {
        setError("Pick one of the options");
        return;
      }
    } else if (!qualifyDraft.trim() && current.key !== "email") {
      setError("Please answer to continue");
      return;
    }

    const nextQualification = {
      ...qualification,
      [current.key]: qualifyDraft.trim(),
    };
    setQualification(nextQualification);
    setQualifyDraft("");
    setError(null);

    if (qualifyIndex < QUALIFY_STEPS.length - 1) {
      setQualifyIndex((i) => i + 1);
      return;
    }

    if (!visitorId) {
      setError("Session not ready. Refresh and try again.");
      return;
    }

    startTransition(async () => {
      const result = await startSupportAdvisorChatAction({
        visitorId,
        name: nextQualification.name,
        phone: nextQualification.phone,
        email: nextQualification.email || "",
        country: nextQualification.country,
        degree: nextQualification.degree,
        admissionStatus: nextQualification.admissionStatus,
        collateralPreference: nextQualification.collateralPreference,
        loanRequired: true,
      });
      if (!result.success || !result.data) {
        setError(result.error ?? "Could not start chat");
        return;
      }
      setConversationId(result.data.conversationId);
      setChatClosed(false);
      const thread = await getSupportVisitorThreadAction(result.data.conversationId, visitorId);
      if (thread.success && thread.data) {
        setChatClosed(Boolean(thread.data.closed));
        setMessages(
          thread.data.messages.map((m) => ({
            id: m.id,
            senderType: m.senderType,
            body: m.body,
            createdAt: m.createdAt,
          }))
        );
      }
      setStep("chat");
    });
  };

  const sendChat = () => {
    const body = composer.trim();
    if (!body || !conversationId || !visitorId || chatClosed) return;
    setComposer("");
    emitTyping(false);
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      senderType: "visitor",
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    startTransition(async () => {
      try {
        if (connected) {
          const saved = await sendMessage(body);
          setMessages((prev) =>
            upsertChatMessage(
              prev.filter((m) => m.id !== optimistic.id),
              {
                id: saved.id,
                senderType: saved.senderType,
                body: saved.body,
                createdAt: saved.createdAt,
              }
            )
          );
        } else {
          const result = await sendSupportVisitorMessageAction({
            conversationId,
            visitorId,
            body,
          });
          if (!result.success) {
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            setError(result.error ?? "Send failed");
            if (/closed/i.test(result.error ?? "")) setChatClosed(true);
            return;
          }
          if (result.data?.messageId) {
            setMessages((prev) =>
              upsertChatMessage(
                prev.filter((m) => m.id !== optimistic.id),
                {
                  id: result.data!.messageId,
                  senderType: "visitor",
                  body,
                  createdAt: new Date().toISOString(),
                }
              )
            );
          }
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        const message = err instanceof Error ? err.message : "Send failed";
        setError(message);
        if (/closed/i.test(message)) setChatClosed(true);
      }
    });
  };

  const currentQualify = QUALIFY_STEPS[qualifyIndex];

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-28 sm:right-6">
      {open && (
        <div className="pointer-events-auto flex h-[min(640px,75vh)] w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-3xl border border-border/70 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-gradient-to-r from-[#0b1e48] to-[#0b8fd8] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              {step !== "home" && (
                <button
                  type="button"
                  className="rounded-full p-1 hover:bg-white/10"
                  onClick={() => setStep("home")}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <p className="text-sm font-semibold">Chat with Lakshya</p>
                <p className="text-[11px] text-white/80">Education loan help</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-1 hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
            {step === "home" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[#0b1e48]">Welcome to Lakshya</p>
                  <p className="mt-1 text-sm text-muted-foreground">How can we help today?</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Popular questions
                  </p>
                  <div className="flex flex-col gap-2">
                    {faqs.map((faq) => (
                      <button
                        key={faq.id}
                        type="button"
                        onClick={() => openFaq(faq)}
                        className="rounded-2xl border border-border bg-white px-3 py-2.5 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-accent/40"
                      >
                        {faq.question}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startQualify}
                  className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Speak to an advisor
                </button>
              </div>
            )}

            {step === "faq-answer" && activeFaq && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-primary">
                    {activeFaq.category}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{activeFaq.question}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {activeFaq.answer}
                  </p>
                </div>
                <p className="text-center text-xs text-muted-foreground">Was this helpful?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-border bg-white py-2 text-sm font-medium"
                    onClick={() => {
                      void markSupportFaqFeedbackAction(activeFaq.id, true);
                      setOpen(false);
                    }}
                  >
                    Yes, thanks
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground"
                    onClick={() => {
                      void markSupportFaqFeedbackAction(activeFaq.id, false);
                      startQualify();
                    }}
                  >
                    Chat with advisor
                  </button>
                </div>
              </div>
            )}

            {step === "qualify" && currentQualify && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs text-muted-foreground">
                    Step {qualifyIndex + 1} of {QUALIFY_STEPS.length}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {currentQualify.label}
                  </p>
                </div>

                {currentQualify.key === "admissionStatus" ? (
                  <div className="grid gap-2">
                    {SUPPORT_ADMISSION_STATUSES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setQualifyDraft(value)}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-left text-sm",
                          qualifyDraft === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-white"
                        )}
                      >
                        {ADMISSION_LABELS[value]}
                      </button>
                    ))}
                  </div>
                ) : currentQualify.key === "collateralPreference" ? (
                  <div className="grid gap-2">
                    {SUPPORT_COLLATERAL_PREFERENCES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setQualifyDraft(value)}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-left text-sm",
                          qualifyDraft === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-white"
                        )}
                      >
                        {COLLATERAL_LABELS[value]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    value={qualifyDraft}
                    onChange={(e) => setQualifyDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitQualifyAnswer();
                    }}
                    className="w-full rounded-2xl border border-border bg-white px-3 py-3 text-sm outline-none ring-primary focus:ring-2"
                    placeholder="Type your answer…"
                    autoFocus
                  />
                )}

                {error && <p className="text-xs text-destructive">{error}</p>}

                <button
                  type="button"
                  disabled={pending}
                  onClick={submitQualifyAnswer}
                  className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {qualifyIndex === QUALIFY_STEPS.length - 1
                    ? pending
                      ? "Starting chat…"
                      : "Start chat"
                    : "Continue"}
                </button>
              </div>
            )}

            {step === "chat" && (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      message.senderType === "visitor"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : message.senderType === "system"
                          ? "mx-auto bg-slate-200 text-slate-700"
                          : "bg-white text-foreground shadow-sm"
                    )}
                  >
                    {message.body}
                  </div>
                ))}
                {typingLabel && <p className="text-xs text-muted-foreground">{typingLabel}</p>}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {step === "chat" && (
            <div className="border-t border-border bg-white p-3">
              {chatClosed ? (
                <div className="space-y-2 text-center">
                  <p className="text-xs font-medium text-destructive">
                    This conversation is closed.
                  </p>
                  <button
                    type="button"
                    onClick={startQualify}
                    className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Start a new chat
                  </button>
                </div>
              ) : (
                <>
                  {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
                  <div className="flex items-center gap-2">
                    <input
                      value={composer}
                      onChange={(e) => {
                        setComposer(e.target.value);
                        emitTyping(Boolean(e.target.value.trim()));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendChat();
                      }}
                      className="flex-1 rounded-full border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Type a message…"
                    />
                    <button
                      type="button"
                      onClick={sendChat}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#0b1e48] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-[#102456]"
      >
        <MessageCircle className="h-4 w-4" />
        {open ? "Close" : "Need help?"}
      </button>
    </div>
  );
}
