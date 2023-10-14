export type Message = {
  who: 'bot' | 'user' | undefined;
  message?: string;
};

export const initialMessages: Message[] = [
  {
    who: 'bot',
    message: "Hi! I'm Teach-In's AI assistant. How can I help you today?",
  },
];

export function ChatMessage({ who = 'bot', message }: Message) {
  if (!message) {
    return null;
  }

  return (
    <div className={`prompt ${who != 'bot' ? 'right' : 'left'}`}>
      <div>
        <p className="name">{who != 'bot' ? 'You' : 'Teach-in AI'}</p>
        <p className="msg">{message}</p>
      </div>
    </div>
  );
}
