"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { Loader2, Sparkles, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const transport = new DefaultChatTransport({
  api: "/api/restaurants/chat",
});

const initialMessages: UIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi! How can I help you find a restaurant today? What would you like to eat?",
      },
    ],
  },
];

const TextWithLinks = ({ text }: { text: string }) => {
  const segments = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {segments.map((segment, i) => {
        const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(segment);
        if (!match) {
          return <span key={i}>{segment}</span>;
        }
        const [, label, href] = match;
        return (
          <a
            key={i}
            href={href}
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        );
      })}
    </div>
  );
};

export const RestaurantAssistantChat = () => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
  });

  const busy = status === "streaming" || status === "submitted";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setDraft("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full border-0 bg-linear-to-br from-violet-600 to-primary text-primary-foreground shadow-lg shadow-violet-600/30 ring-1 ring-white/25 transition-[box-shadow,filter] hover:brightness-110 hover:shadow-violet-600/40 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open restaurant assistant"
          />
        }
      >
        <span className="relative flex size-9 items-center justify-center" aria-hidden>
          <Sparkles className="size-6 drop-shadow-sm" strokeWidth={2} />
          <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground ring-1 ring-white/35">
            <UtensilsCrossed className="size-2.5" strokeWidth={2.5} />
          </span>
        </span>
      </DialogTrigger>
      <DialogContent showCloseButton className="flex max-h-[min(560px,85vh)] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>Restaurant assistant</DialogTitle>
          <DialogDescription>
            Ask what you are in the mood for; we will search TableSpot listings for you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
            aria-busy={busy}
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "ml-8 rounded-lg bg-muted px-3 py-2" : "mr-6"}
              >
                {message.parts.map((part, i) => {
                  if (message.role === "user" && isTextUIPart(part)) {
                    return (
                      <p key={i} className="text-sm whitespace-pre-wrap">
                        {part.text}
                      </p>
                    );
                  }
                  if (message.role === "assistant" && isTextUIPart(part)) {
                    return <TextWithLinks key={i} text={part.text} />;
                  }
                  if (
                    message.role === "assistant" &&
                    typeof part.type === "string" &&
                    part.type.startsWith("tool-") &&
                    "state" in part &&
                    part.state !== "output-available"
                  ) {
                    return (
                      <p key={i} className="text-muted-foreground text-xs italic">
                        Searching the directory…
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {busy ? (
              <div className="mr-6 flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/50 px-3 py-2.5 text-muted-foreground text-sm">
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
                <span>{status === "submitted" ? "Sending…" : "Working on your answer…"}</span>
              </div>
            ) : null}
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error.message}
              </p>
            ) : null}
          </div>
          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <label htmlFor="restaurant-assistant-input" className="sr-only">
              Your message
            </label>
            <Textarea
              id="restaurant-assistant-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. I would like Polish food"
              rows={2}
              className="mb-2 min-h-[72px] resize-none"
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Thinking…" : "Send"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
