"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { Loader2, Sparkles, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FloorPlanCopilotContext } from "@/lib/floor-plan-copilot/types";
import type { LocalElement } from "./types";
import { applyCopilotActions, extractCopilotActionsFromMessages } from "./apply-copilot-actions";

const SUGGESTIONS = [
  "Apply a rectangle room outline",
  "Add 6 four-seat tables in a grid",
  "Remove all walls",
  "Add a door at the top",
];

const initialMessages: UIMessage[] = [
  {
    id: "copilot-welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi! I can help layout this room — outlines, tables, doors, and more. Tell me what you need, then click Save when you're happy.",
      },
    ],
  },
];

interface FloorPlanCopilotChatProps {
  restaurantId: string;
  activeRoomId: string | null;
  buildContext: () => FloorPlanCopilotContext | null;
  setCurrentElements: (updater: (prev: LocalElement[]) => LocalElement[]) => void;
  getCurrentElements: () => LocalElement[];
  disabled?: boolean;
}

export const FloorPlanCopilotChat = ({
  restaurantId,
  activeRoomId,
  buildContext,
  setCurrentElements,
  getCurrentElements,
  disabled = false,
}: FloorPlanCopilotChatProps) => {
  const [draft, setDraft] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<LocalElement[] | null>(null);

  const appliedToolCallIds = useRef(new Set<string>());

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/dashboard/${restaurantId}/floor-plan/copilot`,
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            messages,
            context: buildContext(),
          },
        }),
      }),
    [restaurantId, buildContext],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
  });

  const busy = status === "streaming" || status === "submitted";

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const applyFromMessages = useCallback(async () => {
    if (!activeRoomId) return;

    const { actions, toolCallIds } = extractCopilotActionsFromMessages(messages, appliedToolCallIds.current);

    if (actions.length === 0) return;

    setUndoSnapshot(getCurrentElements().map((el) => ({ ...el })));

    const result = await applyCopilotActions(actions, {
      roomId: activeRoomId,
      setCurrentElements,
    });

    for (const id of toolCallIds) {
      appliedToolCallIds.current.add(id);
    }

    if (result.errors.length > 0) {
      setApplyError(result.errors.join(" "));
    } else {
      setApplyError(null);
    }
  }, [activeRoomId, getCurrentElements, messages, setCurrentElements]);

  useEffect(() => {
    if (busy) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        void applyFromMessages();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [busy, applyFromMessages, messages]);

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setCurrentElements(() => undoSnapshot.map((el) => ({ ...el })));
    setUndoSnapshot(null);
    setApplyError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || busy || disabled || !activeRoomId) return;

    const context = buildContext();
    if (!context) return;

    setApplyError(null);
    setDraft("");
    sendMessage({ text });
  };

  const handleSuggestion = (text: string) => {
    if (busy || disabled || !activeRoomId) return;
    const context = buildContext();
    if (!context) return;
    setApplyError(null);
    sendMessage({ text });
  };

  return (
    <div className="flex h-full min-h-0 flex-col border-l bg-background">
      <div className="border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Layout copilot</p>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Changes apply to the canvas — click Save to persist.
        </p>
      </div>

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
        aria-live="polite"
      >
        {!activeRoomId && <p className="text-xs text-muted-foreground">Select a room to use the copilot.</p>}

        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === "user" ? "ml-4 rounded-lg bg-muted px-2.5 py-2" : "mr-2"}
          >
            {message.parts.map((part, index) => {
              if (isTextUIPart(part)) {
                return (
                  <p key={index} className="whitespace-pre-wrap text-xs leading-relaxed">
                    {part.text}
                  </p>
                );
              }
              if (
                typeof part.type === "string" &&
                part.type.startsWith("tool-") &&
                "state" in part &&
                part.state !== "output-available"
              ) {
                return (
                  <p key={index} className="text-[11px] italic text-muted-foreground">
                    Updating layout…
                  </p>
                );
              }
              return null;
            })}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Working…
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error.message}
          </p>
        )}

        {applyError && (
          <p className="text-xs text-destructive" role="alert">
            {applyError}
          </p>
        )}
      </div>

      <div className="space-y-2 border-t p-3">
        {undoSnapshot && (
          <Button variant="outline" size="sm" className="w-full" onClick={handleUndo}>
            <Undo2 className="mr-1.5 h-3.5 w-3.5" />
            Undo last copilot change
          </Button>
        )}

        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              disabled={busy || disabled || !activeRoomId}
              onClick={() => handleSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="e.g. Add 4 two-seat tables in a row"
            rows={2}
            className="min-h-[64px] resize-none text-xs"
            disabled={busy || disabled || !activeRoomId}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
          />
          <Button type="submit" size="sm" className="w-full" disabled={busy || disabled || !activeRoomId}>
            {busy ? "Thinking…" : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};
