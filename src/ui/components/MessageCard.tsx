import { useState } from 'react';
import { Button } from './Button';
import './MessageCard.css';

interface MessageCardProps {
  /** Section title shown above the message. */
  title: string;
  /** The ready-to-copy message text (WhatsApp-formatted). */
  message: string;
  /** Optional text shown instead of the message when it is empty. */
  emptyHint?: string;
}

/**
 * Displays a generated, copy-to-clipboard message (e.g. drawn teams, payment
 * checklist). Shows a transient "Copiado!" confirmation after copying.
 */
export function MessageCard({ title, message, emptyHint }: MessageCardProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying message:', error);
    }
  };

  if (!message) {
    return (
      <div className="message-card">
        <h4 className="message-card-title">{title}</h4>
        <p className="message-card-empty">{emptyHint ?? 'Nada para gerar ainda'}</p>
      </div>
    );
  }

  return (
    <div className="message-card">
      <div className="message-card-header">
        <h4 className="message-card-title">{title}</h4>
        <Button variant="secondary" onClick={handleCopy} className="message-card-copy">
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </Button>
      </div>
      <pre className="message-card-body">{message}</pre>
    </div>
  );
}
