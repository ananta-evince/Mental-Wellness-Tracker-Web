import { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../components/ui/PageHeader';
import { APP_NAME, CRISIS_HELPLINES } from '../constants';
import { detectCrisis } from '../utils/wellness';

function ChatPage({ profile, messages, onSend, loading }) {
  const [input, setInput] = useState('');
  const [crisis, setCrisis] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    if (detectCrisis(text)) setCrisis(true);
    await onSend(text);
  }, [input, loading, onSend]);

  return (
    <div className="chat-shell mx-auto max-w-2xl">
      <PageHeader title={`Talk to ${APP_NAME}`} subtitle="Your AI wellness companion is here for you" />

      {crisis && (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4" role="alert">
          <p className="text-sm font-semibold text-red-400">If you&apos;re in crisis, please reach out:</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
            {CRISIS_HELPLINES.map((h) => (
              <li key={h.name}>
                {h.name}:{' '}
                <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="font-medium text-amber-400 underline">
                  {h.phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <span className="text-4xl" aria-hidden="true">✨</span>
            <p className="mt-3 text-sm text-slate-400">
              Hi{profile.userName ? ` ${profile.userName}` : ''}! I&apos;m {APP_NAME}.
            </p>
            <p className="mt-1 text-xs text-slate-500">How are you feeling today?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="chat-bubble-assistant flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          className="input-field flex-1"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Chat message"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary shrink-0 px-5"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
}

ChatPage.propTypes = {
  profile: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  onSend: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default memo(ChatPage);
