import { useEffect, useMemo, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  agentType?: string | null;
}

interface ConversationItem {
  id: string;
  subject: string;
  messages?: ChatMessage[];
}

const apiHome = 'http://localhost:3000/api';

function App() {
  const [chatList, setChatList] = useState<ConversationItem[]>([]);
  const [pickedChatId, setPickedChatId] = useState<string | null>(null);
  const [userWords, setUserWords] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  const [liveReply, setLiveReply] = useState('');
  const [errorNote, setErrorNote] = useState('');
  const [thinkingList, setThinkingList] = useState<string[]>([]);

  const currentChat = useMemo(
    () => chatList.find((item) => item.id === pickedChatId),
    [chatList, pickedChatId],
  );

  const refreshChats = async () => {
    try {
      const response = await fetch(`${apiHome}/chat/conversations`);
      const data = await response.json();
      setChatList(data.conversations ?? []);
    } catch (e) {
      // ignore for now
    }
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await fetch(`${apiHome}/chat/conversations/${conversationId}`, { method: 'DELETE' });
      setChatList((prev) => prev.filter((item) => item.id !== conversationId));
      if (pickedChatId === conversationId) {
        setPickedChatId(null);
      }
    } catch (e) {
      setErrorNote('could not delete conversation');
    }
  };

  useEffect(() => {
    refreshChats();
  }, []);

  const readStreamReply = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';
    let metaDone = false;
    let replyText = '';
    let newChatId = pickedChatId;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      while (buffer.includes('\n')) {
        const cut = buffer.indexOf('\n');
        const line = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 1);

        if (!metaDone) {
          try {
            const meta = JSON.parse(line);
            newChatId = meta.conversationId;
            setPickedChatId(meta.conversationId);
            if (Array.isArray(meta.thinking)) {
              setThinkingList(meta.thinking);
            } else {
              setThinkingList([]);
            }
            metaDone = true;
            continue;
          } catch (err) {
            // treat as text
          }
        }

        replyText += line;
        setLiveReply(replyText);
      }
    }

    if (replyText && newChatId) {
      setChatList((prev: ConversationItem[]) => {
        const next: ConversationItem[] = prev.map((item) =>
          item.id === newChatId
            ? {
                ...item,
                messages: [
                  ...(item.messages ?? []),
                  { role: 'user' as const, content: userWords },
                  { role: 'agent' as const, content: replyText },
                ],
              }
            : item,
        );
        return next;
      });
    }
  };

  const handleSend = async () => {
    setErrorNote('');
    setLiveReply('');
    setAgentTyping(true);
    setThinkingList([]);
    try {
      const response = await fetch(`${apiHome}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: pickedChatId ?? undefined, content: userWords }),
      });

      if (!response.ok || !response.body) {
        const messageText = await response.text();
        setErrorNote(messageText || 'request failed');
        setAgentTyping(false);
        return;
      }

      await readStreamReply(response);
      await refreshChats();
      setUserWords('');
    } catch (err) {
      setErrorNote('something went wrong.');
    } finally {
      setAgentTyping(false);
    }
  };

  return (
    <div className="app">
      <aside className="left">
        <div className="header">
          <div>
            <strong>conversations</strong>
          </div>
          <div>
            <button className="btn" onClick={refreshChats}>refresh</button>
          </div>
        </div>

        <div>
          {chatList.map((chatItem) => (
            <div
              key={chatItem.id}
              className={`conv-row ${pickedChatId === chatItem.id ? 'active' : ''}`}
              onClick={() => setPickedChatId(chatItem.id)}
            >
              <div>{chatItem.subject}</div>
              <div className="conv-sub">{chatItem.messages?.length ?? 0} messages</div>
              <button
                className="btn"
                style={{ marginTop: 6, background: '#ef4444', color: '#0b1220' }}
                onClick={async (evt) => {
                  evt.stopPropagation();
                  await handleDelete(chatItem.id);
                }}
              >
                delete
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="right">
        <div className="chat-log">
          <div className="meta">subject: {currentChat?.subject ?? 'new chat'}</div>

          {currentChat?.messages?.map((message, index) => (
            <div key={index} className={`bubble ${message.role === 'user' ? 'user' : ''}`}>
              <div>{message.content}</div>
              {message.agentType && <div className="conv-sub">agent: {message.agentType}</div>}
            </div>
          ))}

          {thinkingList.length > 0 && agentTyping && (
            <div className="typing">{thinkingList.join(' · ')}</div>
          )}
          {agentTyping && <div className="typing">{liveReply || 'agent is typing...'}</div>}
        </div>

        <div className="composer">
          <textarea value={userWords} onChange={(e) => setUserWords(e.target.value)} placeholder="type your message..." />
          <button className="btn" onClick={handleSend} disabled={!userWords || agentTyping}>send</button>
        </div>
      </section>
    </div>
  );
}

export default App;
