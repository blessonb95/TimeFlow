import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  aiApi,
  type DashboardChatSourceLink,
  type DashboardChatVerifiedFact,
} from '../../api/ai';
import { getMockDashboardAiChat } from '../../api/mockData';
import { useAppStore } from '../../store/useAppStore';
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility';

interface DashboardWeeklySummaryModalProps {
  onClose: () => void;
  initialWeekStart?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  shortAnswer: string;
  detailedAnswer?: string;
  isExpanded?: boolean;
  sourceLinks?: DashboardChatSourceLink[];
  verifiedFacts?: DashboardChatVerifiedFact[];
  suggestions?: string[];
  hasData?: boolean;
  isError?: boolean;
}

function getRoleStarterPrompts(role?: string): string[] {
  switch (role) {
    case 'employee':
      return [
        'Summarize my hours for this week',
        'What tasks did I log this week?',
        'How is my time distributed across projects?',
        'What are my active assigned tasks?',
      ];
    case 'admin':
      return [
        'Show company-wide timesheet compliance',
        'What approvals are pending across teams?',
        'Which projects have highest resource utilization?',
        'Summarize organizational logged hours',
      ];
    case 'manager':
    default:
      return [
        'Summarize this week for my team',
        'What approvals need my attention?',
        'Which projects need attention?',
        'Who hasn’t submitted their timesheet?',
      ];
  }
}

function getMondayIso(dateInput?: string | Date): string {
  const base =
    typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T12:00:00`)
      : dateInput instanceof Date
        ? new Date(dateInput)
        : new Date();
  const day = base.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(base);
  mon.setDate(base.getDate() + diffToMon);
  mon.setHours(12, 0, 0, 0);
  return mon.toISOString().slice(0, 10);
}

function formatWeekRangeLabel(weekStartIso: string): string {
  const mon = new Date(`${weekStartIso}T12:00:00`);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const startStr = mon.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endStr = sun.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startStr} – ${endStr}`;
}

export const DashboardWeeklySummaryModal: React.FC<DashboardWeeklySummaryModalProps> = ({
  onClose,
  initialWeekStart,
}) => {
  const navigate = useNavigate();
  const { role, currentUser } = useAppStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(dialogRef, onClose);

  const currentWeekMonday = getMondayIso();
  const selectedWeekStart = initialWeekStart ? getMondayIso(initialWeekStart) : currentWeekMonday;
  const displayRange = formatWeekRangeLabel(selectedWeekStart);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasConversation = messages.length > 0;

  const rawName = currentUser?.name?.trim();
  const userName = rawName ? rawName.split(/\s+/)[0] : 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const starterPrompts = getRoleStarterPrompts(role);

  const heroSubtitle =
    role === 'employee'
      ? 'Ask Flow anything about your logged hours, projects, tasks, or timesheet status.'
      : role === 'admin'
      ? 'Ask Flow anything about company hours, projects, approvals or compliance.'
      : 'Ask Flow anything about hours, projects, approvals or team status.';

  const heroPlaceholder =
    role === 'employee'
      ? 'Ask Flow about your hours, tasks, or projects…'
      : role === 'admin'
      ? 'Ask Flow about company hours, projects, compliance…'
      : 'Ask Flow about team hours, approvals, projects…';

  const chatPlaceholder =
    role === 'employee'
      ? 'Ask a follow-up about your hours, tasks, or projects…'
      : role === 'admin'
      ? 'Ask a follow-up about company hours, projects, or compliance…'
      : 'Ask a follow-up about team hours, approvals, or projects…';

  // Auto-scroll to bottom when in chat mode
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (hasConversation) {
      scrollToBottom();
    }
  }, [messages, isLoading, hasConversation, scrollToBottom]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shortAnswer: trimmed,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    const historyForAi = newMessages.slice(-6).map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.shortAnswer,
    }));

    try {
      const response = await aiApi.sendDashboardChat({
        message: trimmed,
        weekStart: selectedWeekStart,
        role,
        history: historyForAi,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shortAnswer: response.shortAnswer || response.reply,
        detailedAnswer: response.detailedAnswer,
        sourceLinks: response.sourceLinks,
        verifiedFacts: response.verifiedFacts,
        suggestions: response.suggestions,
        hasData: response.hasData,
        isExpanded: false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      // Client-side fallback if server fails
      try {
        const fallback = getMockDashboardAiChat({
          message: trimmed,
          weekStart: selectedWeekStart,
          role,
          userId: currentUser?.id,
          history: historyForAi,
        });

        const assistantMsg: ChatMessage = {
          id: `assistant-fallback-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          shortAnswer: fallback.shortAnswer || fallback.reply,
          detailedAnswer: fallback.detailedAnswer,
          sourceLinks: fallback.sourceLinks,
          verifiedFacts: fallback.verifiedFacts,
          suggestions: fallback.suggestions,
          hasData: fallback.hasData,
          isExpanded: false,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          shortAnswer: 'I was unable to load data for this query. Please check your connection and try again.',
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleToggleExpand = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isExpanded: !msg.isExpanded } : msg
      )
    );
  };

  const handleSourceNavigate = (url: string) => {
    onClose();
    navigate(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSendMessage(inputMessage);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputMessage('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="modal dashboard-summary-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Ask Flow"
        tabIndex={-1}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          className="dashboard-summary-modal__floating-close"
          onClick={onClose}
          aria-label="Close Ask Flow"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Floating Reset / New Chat Button (visible during chat) */}
        {hasConversation && (
          <button
            type="button"
            className="dashboard-summary-modal__floating-reset"
            onClick={handleResetChat}
            title="Start a new chat"
            aria-label="New chat"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" aria-hidden="true">
              <path d="M2.5 8a5.5 5.5 0 019.39-3.89L13.5 2.5v4h-4l1.62-1.62A4 4 0 1012 8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {!hasConversation ? (
          /* Gemini style hero view with blue gradient mesh */
          <div className="dashboard-summary-modal__hero">
            <h1 className="dashboard-summary-modal__hero-brand">
              Ask Flow
            </h1>
            <h2 className="dashboard-summary-modal__hero-title">
              {greeting}, {userName}!
            </h2>
            <p className="dashboard-summary-modal__hero-subtitle">
              {heroSubtitle}
            </p>

            {/* Pill Search / Input */}
            <div className="dashboard-summary-modal__pill-wrap">
              <form onSubmit={handleSubmit} className="dashboard-summary-modal__pill-form">
                <button
                  type="button"
                  className="dashboard-summary-modal__pill-plus"
                  title="New prompt"
                  onClick={() => inputRef.current?.focus()}
                  aria-label="Add prompt"
                >
                  +
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  className="dashboard-summary-modal__pill-input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={heroPlaceholder}
                  aria-label="Ask Flow"
                  disabled={isLoading}
                  maxLength={400}
                  autoComplete="off"
                  autoCapitalize="sentences"
                  enterKeyHint="send"
                />

                <button
                  type="submit"
                  className="dashboard-summary-modal__pill-send"
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send message"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2L7 9" />
                    <path d="M14 2L9.5 14L7 9L2 6.5L14 2Z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Starter chips */}
            <div className="dashboard-summary-modal__hero-starters">
              {starterPrompts.map((promptText, sIdx) => {
                const cleanPrompt = promptText.replace(/^[“"]+|[”"]+$/g, '');
                return (
                  <button
                    key={sIdx}
                    type="button"
                    className="dashboard-summary-modal__hero-starter-chip"
                    onClick={() => void handleSendMessage(cleanPrompt)}
                    disabled={isLoading}
                  >
                    <span>{cleanPrompt}</span>
                    <span aria-hidden="true">↵</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active chat stream */
          <>
            <div
              className="modal__body dashboard-summary-modal__body"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`dashboard-summary-modal__msg-row ${
                      isUser
                        ? 'dashboard-summary-modal__msg-row--user'
                        : 'dashboard-summary-modal__msg-row--assistant'
                    }`}
                  >
                    {!isUser && (
                      <div className="dashboard-summary-modal__avatar" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                            fill="#2563eb"
                          />
                        </svg>
                      </div>
                    )}

                    <div
                      className={`dashboard-summary-modal__bubble ${
                        isUser
                          ? 'dashboard-summary-modal__bubble--user'
                          : 'dashboard-summary-modal__bubble--assistant'
                      }`}
                    >
                      <div className="dashboard-summary-modal__bubble-meta">
                        <span className="dashboard-summary-modal__bubble-sender">
                          {isUser ? 'You' : 'Ask Flow'}
                        </span>
                        <span className="dashboard-summary-modal__bubble-time">{msg.timestamp}</span>
                      </div>

                      {/* Main short, readable answer */}
                      <div className="dashboard-summary-modal__answer-text">
                        {msg.shortAnswer}
                      </div>

                      {/* Verified facts tags if present */}
                      {!isUser && msg.verifiedFacts && msg.verifiedFacts.length > 0 && (
                        <div className="dashboard-summary-modal__fact-tags" aria-label="Verified facts">
                          {msg.verifiedFacts.map((fact, fIdx) => (
                            <span
                              key={fIdx}
                              className="dashboard-summary-modal__fact-tag"
                              title={fact.detail}
                              onClick={() => fact.link && handleSourceNavigate(fact.link)}
                              style={{ cursor: fact.link ? 'pointer' : 'default' }}
                            >
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <path d="M13.5 4.5l-7 7-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span>{fact.label}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Direct source record links if present */}
                      {!isUser && msg.sourceLinks && msg.sourceLinks.length > 0 && (
                        <div className="dashboard-summary-modal__source-chips" aria-label="Source records">
                          {msg.sourceLinks.map((src, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              className="dashboard-summary-modal__source-chip"
                              onClick={() => handleSourceNavigate(src.url)}
                              title={`Navigate to ${src.type}: ${src.label}`}
                            >
                              <span>{src.label}</span>
                              <span className="dashboard-summary-modal__chip-arrow" aria-hidden="true">→</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Expandable detail section */}
                      {!isUser && msg.detailedAnswer && (
                        <div className="dashboard-summary-modal__detail-wrap">
                          <button
                            type="button"
                            className="dashboard-summary-modal__detail-toggle"
                            onClick={() => handleToggleExpand(msg.id)}
                            aria-expanded={msg.isExpanded}
                          >
                            <span>{msg.isExpanded ? 'Hide breakdown ▴' : 'Show breakdown ▾'}</span>
                          </button>

                          {msg.isExpanded && (
                            <div className="dashboard-summary-modal__detail-box">
                              {msg.detailedAnswer}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Follow-up suggestions */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="dashboard-summary-modal__starters" aria-label="Suggested questions">
                          <div className="dashboard-summary-modal__starters-label">Suggested follow-ups:</div>
                          <div className="dashboard-summary-modal__starters-list">
                            {msg.suggestions.map((promptText, sIdx) => {
                              const cleanPrompt = promptText.replace(/^[“"]+|[”"]+$/g, '');
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  className="dashboard-summary-modal__starter-btn"
                                  onClick={() => void handleSendMessage(cleanPrompt)}
                                  disabled={isLoading}
                                >
                                  <span>{cleanPrompt}</span>
                                  <span aria-hidden="true">↵</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Assistant typing indicator */}
              {isLoading && (
                <div className="dashboard-summary-modal__msg-row dashboard-summary-modal__msg-row--assistant">
                  <div className="dashboard-summary-modal__avatar" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                        fill="#2563eb"
                      />
                    </svg>
                  </div>
                  <div className="dashboard-summary-modal__bubble dashboard-summary-modal__bubble--assistant dashboard-summary-modal__bubble--loading">
                    <div className="dashboard-summary-modal__loading-dots" aria-label="Ask Flow is analyzing team records">
                      <span className="dashboard-summary-modal__dot" />
                      <span className="dashboard-summary-modal__dot" />
                      <span className="dashboard-summary-modal__dot" />
                    </div>
                    <span className="dashboard-summary-modal__loading-text">
                      Analyzing verified records…
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Pill */}
            <div className="dashboard-summary-modal__footer">
              <div className="dashboard-summary-modal__pill-wrap" style={{ marginBottom: 0 }}>
                <form onSubmit={handleSubmit} className="dashboard-summary-modal__pill-form">
                  <button
                    type="button"
                    className="dashboard-summary-modal__pill-plus"
                    title="New prompt"
                    onClick={() => inputRef.current?.focus()}
                    aria-label="Add prompt"
                  >
                    +
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    className="dashboard-summary-modal__pill-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={chatPlaceholder}
                    aria-label="Ask Flow follow-up"
                    disabled={isLoading}
                    maxLength={400}
                    autoComplete="off"
                    autoCapitalize="sentences"
                    enterKeyHint="send"
                  />

                  <button
                    type="submit"
                    className="dashboard-summary-modal__pill-send"
                    disabled={!inputMessage.trim() || isLoading}
                    aria-label="Send message"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 2L7 9" />
                      <path d="M14 2L9.5 14L7 9L2 6.5L14 2Z" />
                    </svg>
                  </button>
                </form>
              </div>

              <div className="dashboard-summary-modal__hint">
                <span>
                  Answers are grounded in verified timesheet and project records for <strong>{displayRange}</strong>.
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
