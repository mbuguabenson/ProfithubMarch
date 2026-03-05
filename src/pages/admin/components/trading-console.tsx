import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Copy, ChevronRight } from 'lucide-react';
import '../admin-trading-console.scss';

interface ConsoleLine {
    id: number;
    type: 'input' | 'output' | 'error' | 'success' | 'info';
    text: string;
    ts: string;
}

const HELP_TEXT = `
╔══════════════════════════════════════╗
║     PROFITHUB ADMIN CONSOLE v5.0     ║
║     Trading & Platform Commands      ║
╚══════════════════════════════════════╝

Commands:
  status             — Show platform status
  users              — List active users
  balance <id>       — Query account balance
  block <id>         — Block user account
  unblock <id>       — Unblock user account
  trade <asset> <stake> <type>
                     — Execute test trade
  help               — Show this help
  clear              — Clear console
`;

const now = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

const processCommand = (cmd: string): ConsoleLine[] => {
    const parts = cmd.trim().split(' ');
    const verb = parts[0].toLowerCase();
    const id = Date.now();

    switch (verb) {
        case 'help':
            return [{ id, type: 'output', text: HELP_TEXT, ts: now() }];
        case 'status':
            return [
                { id, type: 'success', text: '● PLATFORM STATUS: ONLINE', ts: now() },
                { id: id + 1, type: 'info', text: '  Active Users   : 84', ts: now() },
                { id: id + 2, type: 'info', text: '  Total Volume   : $12,450,000', ts: now() },
                { id: id + 3, type: 'info', text: '  Latency        : 24ms', ts: now() },
                { id: id + 4, type: 'info', text: '  Sync Status    : 100%', ts: now() },
                { id: id + 5, type: 'success', text: '  API WebSocket  : Connected', ts: now() },
            ];
        case 'users':
            return [
                { id, type: 'info', text: '--- Active User Registry ---', ts: now() },
                { id: id + 1, type: 'output', text: '  CR9284731  Alex Morgan       Active  $10,451.58', ts: now() },
                { id: id + 2, type: 'output', text: '  CR8812934  Priya Vasquez     Active  $4,220.00', ts: now() },
                { id: id + 3, type: 'output', text: '  CR7729010  Kwame Asante      Active  $8,700.30', ts: now() },
                { id: id + 4, type: 'output', text: '  VRTC9001   Sarah Lin         Active  $10,000.00 [Demo]', ts: now() },
                { id: id + 5, type: 'error', text: '  CR6618822  Dmitri Volkov     Blocked $120.50', ts: now() },
            ];
        case 'balance':
            if (!parts[1]) return [{ id, type: 'error', text: 'Usage: balance <account_id>', ts: now() }];
            return [
                { id, type: 'info', text: `Querying balance for ${parts[1]}…`, ts: now() },
                { id: id + 1, type: 'success', text: `  Balance: $${(Math.random() * 10000).toFixed(2)} USD`, ts: now() },
            ];
        case 'block':
            if (!parts[1]) return [{ id, type: 'error', text: 'Usage: block <account_id>', ts: now() }];
            return [{ id, type: 'error', text: `⚠ Account ${parts[1]} has been BLOCKED. All sessions terminated.`, ts: now() }];
        case 'unblock':
            if (!parts[1]) return [{ id, type: 'error', text: 'Usage: unblock <account_id>', ts: now() }];
            return [{ id, type: 'success', text: `✓ Account ${parts[1]} has been UNBLOCKED.`, ts: now() }];
        case 'trade':
            if (parts.length < 4) return [{ id, type: 'error', text: 'Usage: trade <asset> <stake> <even|odd|over|under>', ts: now() }];
            return [
                { id, type: 'info', text: `Executing trade: ${parts[2]} ${parts[1]} on ${parts[3].toUpperCase()}…`, ts: now() },
                { id: id + 1, type: 'success', text: `  Contract ID: TRD${Math.floor(Math.random() * 100000)} — Status: OPEN`, ts: now() },
                { id: id + 2, type: 'info', text: `  Expiry: 1 tick  Stake: $${parts[2]}  Payout: $${(parseFloat(parts[2]) * 1.95).toFixed(2)}`, ts: now() },
            ];
        case 'clear':
            return [];
        case '':
            return [];
        default:
            return [{ id, type: 'error', text: `Command not found: '${verb}'. Type 'help' for available commands.`, ts: now() }];
    }
};

const INITIAL_LINES: ConsoleLine[] = [
    { id: 1, type: 'info', text: 'ProfitHub Admin Console — Platform v5.0', ts: now() },
    { id: 2, type: 'info', text: 'Type \'help\' for a list of commands.', ts: now() },
    { id: 3, type: 'success', text: '● Deriv API WebSocket: Connected', ts: now() },
];

const TradingConsole = () => {
    const [lines, setLines] = useState<ConsoleLine[]>(INITIAL_LINES);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [histIdx, setHistIdx] = useState(-1);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        const inputLine: ConsoleLine = { id: Date.now(), type: 'input', text: `> ${cmd}`, ts: now() };

        if (cmd.toLowerCase() === 'clear') {
            setLines(INITIAL_LINES);
        } else {
            const result = processCommand(cmd);
            setLines(prev => [...prev, inputLine, ...result]);
        }

        setHistory(prev => [cmd, ...prev.slice(0, 49)]);
        setHistIdx(-1);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const idx = Math.min(histIdx + 1, history.length - 1);
            setHistIdx(idx);
            setInput(history[idx] ?? '');
        }
        if (e.key === 'ArrowDown') {
            const idx = Math.max(histIdx - 1, -1);
            setHistIdx(idx);
            setInput(idx === -1 ? '' : history[idx]);
        }
    };

    const copyOutput = () => {
        const text = lines.map(l => `[${l.ts}] ${l.text}`).join('\n');
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="trading-console">
            {/* Title Bar */}
            <div className="console-header">
                <div className="header-left">
                    <div className="window-controls">
                        <div className="dot red" />
                        <div className="dot yellow" />
                        <div className="dot green" />
                    </div>
                    <div className="title-box">
                        <Terminal size={13} />
                        <span className="title-text">Admin Console</span>
                    </div>
                </div>
                <div className="header-right">
                    <button onClick={copyOutput} className="action-btn copy-btn">
                        <Copy size={13} />
                    </button>
                    <button onClick={() => setLines(INITIAL_LINES)} className="action-btn clear-btn">
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Output */}
            <div className="console-output" onClick={() => inputRef.current?.focus()}>
                {lines.map(line => (
                    <div key={line.id} className="output-line">
                        <span className="timestamp">[{line.ts}]</span>
                        <span className={`line-text type-${line.type}`}>{line.text}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="console-input-area">
                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <ChevronRight size={14} className="prompt-icon" />
                        <input
                            ref={inputRef}
                            autoFocus
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter command…"
                            spellCheck={false}
                            autoComplete="off"
                        />
                        <button type="submit" className="submit-btn">
                            <Send size={12} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TradingConsole;
