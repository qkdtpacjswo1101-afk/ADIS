import { FileUp, FileText, BotMessageSquare, Eye, LineChart, Gauge } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: Gauge },
  { name: 'SPC Analyzer', icon: LineChart },
  { name: 'Report Gen', icon: FileText },
  { name: 'Q&A Bot', icon: BotMessageSquare },
  { name: 'Vision Assist', icon: Eye },
];

export default function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col h-full">
      <div className="text-xl font-bold mb-8 p-2 text-blue-400">AQIS Platform</div>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
              activeTab === item.name ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
