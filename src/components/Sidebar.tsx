import { 
  Gauge, 
  LineChart, 
  FileText, 
  BotMessageSquare, 
  Eye, 
  Activity,
  Award
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: Gauge, desc: '종합 품질 현황' },
  { name: 'SPC Analyzer', icon: LineChart, desc: '통계적 공정 분석' },
  { name: 'Report Gen', icon: FileText, desc: '기품원 성적서 검증' },
  { name: 'Q&A Bot', icon: BotMessageSquare, desc: 'KDS 규격 검색' },
  { name: 'Vision Assist', icon: Eye, desc: '화공품 정밀 외관 검사' },
  { name: 'Sensor Trace', icon: Activity, desc: '설비 로그 상관 분석' },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLiveInspecting: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, isLiveInspecting }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#121212] text-white flex flex-col h-full border-r border-[#1f1f1f]">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#1f1f1f]">
        <div className="bg-[#1ed760] text-black p-2 rounded-full flex items-center justify-center">
          <Award size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-white">AQIS Suite</h1>
          <p className="text-[10px] font-mono tracking-widest text-[#b3b3b3] uppercase">Aero Quality Intel</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.name;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveTab(item.name)}
              className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-full transition-all group ${
                isActive 
                  ? 'bg-[#1f1f1f] text-white font-bold' 
                  : 'text-[#b3b3b3] font-normal hover:text-white hover:bg-[#181818]'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${
                  isActive ? 'text-[#1ed760]' : 'text-[#b3b3b3] group-hover:text-white'
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm tracking-wide">{item.name}</div>
                <div className="text-[10px] font-normal opacity-60 text-ellipsis overflow-hidden whitespace-nowrap">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Live System Ingress Badge */}
      <div className="p-4 m-4 bg-[#181818] rounded-xl border border-[#252525] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">MES Connection</span>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isLiveInspecting ? 'bg-[#1ed760]' : 'bg-amber-500'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isLiveInspecting ? 'bg-[#1ed760]' : 'bg-amber-500'
            }`}></span>
          </span>
        </div>
        <div className="text-[11px] text-[#b3b3b3] leading-relaxed">
          {isLiveInspecting 
            ? '실시간 화공품 조립 센서 스트림 및 정밀 계측 분석기 수신 중' 
            : '수동 배치 파일 로드 대기 중 - 간이 데이터 분석 모드'}
        </div>
      </div>
    </aside>
  );
}
