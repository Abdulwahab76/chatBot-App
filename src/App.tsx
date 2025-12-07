import ChatWidget from "./components/ChatWidget";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", padding: 24 }}>
      <ChatWidget />
    </div>
  );
}
