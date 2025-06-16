import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../theme';
import { API_URL } from '../config';

interface ChatOverlayProps {
  surveyId: string;
  onClose: () => void;
}

export default function ChatOverlay({ surveyId, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([]);
  const [currentNode, setCurrentNode] = useState<{
    id: string;
    type: string;
    content: { text: string; options?: string[] };
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the first node on mount
  useEffect(() => {
    async function start() {
      try {
        const res = await fetch(`${API_URL}/api/survey/branching/${surveyId}/start`);
        if (!res.ok) throw new Error();
        const { node } = await res.json();
        setCurrentNode(node);
        setMessages([{ from: 'bot', text: node.content.text }]);
      } catch {
        setMessages([{ from: 'bot', text: 'Failed to load survey.' }]);
      }
    }
    start();
  }, [surveyId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // After rendering an entry message, auto-advance to the first MC question
  useEffect(() => {
    if (currentNode?.type === 'message' && currentNode.content.options?.length === 0) {
      if (currentNode.id === 'entry') {
        handleOptionClick('');
      }
    }
  }, [currentNode]);

  const handleOptionClick = async (option: string) => {
    if (!currentNode) return;
    setMessages((ms) => [...ms, { from: 'user', text: option }]);
    try {
      const res = await fetch(`${API_URL}/api/survey/branching/${surveyId}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNodeId: currentNode.id, answer: option })
      });
      const { node } = await res.json();
      setCurrentNode(node);
      setMessages((ms) => [...ms, { from: 'bot', text: node.content.text }]);
    } catch {
      setMessages((ms) => [...ms, { from: 'bot', text: 'Error fetching next node.' }]);
    }
  };

  return (
    <div
      style={{
        position: 'absolute', top: 20, right: 20,
        width: 320, height: '80vh', background: 'white',
        border: `1px solid ${colors.border}`, borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: 8, borderBottom: `1px solid ${colors.border}` }}>
        <strong style={{ flex: 1 }}>Chat Demo</strong>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>
          ×
        </button>
      </div>
      <div ref={scrollRef} style={{ flex: 1, padding: 8, overflowY: 'auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'bot' ? 'flex-start' : 'flex-end', margin: '4px 0' }}>
            <div style={{ background: m.from === 'bot' ? '#f1f1f1' : colors.primaryDarkBlue, color: m.from === 'bot' ? colors.primaryText : 'white', padding: '8px 12px', borderRadius: 16, maxWidth: '80%', whiteSpace: 'pre-wrap' }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 8, borderTop: `1px solid ${colors.border}` }}>
        {currentNode?.type === 'question-multiple-choice' && currentNode.content.options?.map((opt: string) => (
          <button
            key={opt}
            onClick={() => handleOptionClick(opt)}
            style={{
              margin: 4,
              background: colors.primaryDarkBlue,
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            {opt}
          </button>
        ))}

        {currentNode?.type === 'message' && currentNode.id !== 'entry' && (
          currentNode.id === 'thank_you' ? (
            <button
              onClick={onClose}
              style={{
                margin: 4,
                background: colors.primaryDarkBlue,
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Close Survey
            </button>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Type your response…"
                onKeyDown={(e) => e.key === 'Enter' && handleOptionClick((e.target as HTMLInputElement).value)}
                style={{ width: '100%', marginBottom: 4 }}
              />
              <button
                onClick={() => {
                  const input = scrollRef.current?.parentElement?.querySelector('input') as HTMLInputElement;
                  input && handleOptionClick(input.value);
                }}
                style={{
                  background: colors.primaryDarkBlue,
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                Submit
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}