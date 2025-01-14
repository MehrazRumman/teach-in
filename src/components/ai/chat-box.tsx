import { useEffect, useState } from 'react';
import { type Message, initialMessages, ChatMessage } from './chat-message';
import { useCookies } from 'react-cookie';

const COOKIE_NAME = 'next-openai-chatgpt';

const PreLoader = () => (
  <div className="prompt left">
    <p className="name">AI</p>
    <div className="loader">
      <div></div>
    </div>
  </div>
);

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="question">
    <input
      type="text"
      aria-label="chat input"
      required
      className="w-full rounded border border-gray-300 px-4 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      value={input}
      placeholder="Type your question here..."
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(input);
          setInput('');
        }
      }}
      onChange={(e) => {
        setInput(e.target.value);
      }}
    />
    <button
      type="submit"
      className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={() => {
        sendMessage(input);
        setInput('');
      }}
    >
      Ask
    </button>
  </div>
);

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      const randomId = Math.random().toString(36).substring(7);
      setCookie(COOKIE_NAME, randomId);
    }
  }, [cookie, setCookie]);

  const sendMessage = async (message: string) => {
    setLoading(true);

    const newMessages = [
      ...messages,
      { message: message, who: 'user' } as Message,
    ];
    setMessages(newMessages);

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: newMessages,
        user: cookie[COOKIE_NAME],
      }),
    });

    const data = await response.json();

    setMessages([
      ...newMessages,
      { message: data.text.trim(), who: 'bot' } as Message,
    ]);

    setLoading(false);
  };

  return (
    <div className="dialogue">
      {messages.map(({ message, who }, index) => (
        <ChatMessage key={index} who={who} message={message} />
      ))}

      {loading && <PreLoader />}

      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
    </div>
  );
}
