import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_URL } from '../config';
import { colors } from '../theme';

interface MethodologyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ open, onClose }: MethodologyModalProps) {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    fetch(`${API_URL}/api/docs/methodology`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load document');
        }
        return res.text();
      })
      .then(setContent)
      .catch(err => {
        console.error(err);
        setContent('Error loading document.');
      });
  }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: 800,
        maxHeight: '80%',
        margin: '5% auto',
        background: 'white',
        borderRadius: 8,
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            border: 'none',
            background: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: colors.primaryText
          }}
          aria-label="Close Methodology"
        >
          ×
        </button>
        <div style={{ fontFamily: 'inherit', color: colors.primaryText }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}