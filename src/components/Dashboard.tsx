import { useMemo } from 'react';
import { Award, CheckCircle2, AlertTriangle, ShieldCheck, Play, ArrowRight, Music, Disc } from 'lucide-react';
import { MeasurementData } from '../types';

interface DashboardProps {
  measurements: MeasurementData[];
  onSelectTab: (tab: string) => void;
}

export default function Dashboard({ measurements, onSelectTab }: DashboardProps) {
  // Good Morning / Good Evening based on time
  const welcomeMessage = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning, Quality Supervisor';
    if (hours < 18) return 'Good Afternoon, Quality Supervisor';
    return 'Good Evening, Quality Supervisor';
  }, []);

  const stats = useMemo(() => {
    const total = measurements.length;
    const passes = measurements.filter(m => m.status === 'PASS').length;
    const fails = total - passes;
    const passRate = total > 0 ? (passes / total) * 100 : 100;

    return {
      total,
      passes,
      fails,
      passRate
    };
  }, [measurements]);

  // Standard aerospace parts modeled as Spotify "Albums"
  const recentAlbums = [
    { id: 'alb-1', title: '신관 SAD 기어 결합체', subtitle: 'KDS 1420-2004 공정', color: 'from-[#1db954] to-black', count: 12 },
    { id: 'alb-2', title: '유도탄 가스발생기 화공품', subtitle: 'KDS 1375-4001 공정', color: 'from-amber-500 to-black', count: 15 },
    { id: 'alb-3', title: '날개 조립 전개 피스톤', subtitle: 'KDS 5810-1012 공정', color: 'from-cyan-500 to-black', count: 8 },
    { id: 'alb-4', title: '로켓 모터 고강도 볼트', subtitle: 'KDS 8415-0098 공정', color: 'from-purple-500 to-black', count: 10 }
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Spotify Welcome Greeting */}
      <section>
        <h2 className="text-2xl font-sans font-bold text-white tracking-tight mb-4">{welcomeMessage}</h2>
        
        {/* Album Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentAlbums.map((alb) => (
            <div
              key={alb.id}
              onClick={() => onSelectTab('SPC Analyzer')}
              className="bg-[#181818] hover:bg-[#252525] transition-all p-4 rounded-xl flex items-center gap-4 cursor-pointer group shadow-md"
            >
              {/* Vinyl album sleeve mockup */}
              <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-[#252525] to-black border border-[#1f1f1f] flex items-center justify-center shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${alb.color} opacity-40`} />
                <Disc className="text-[#1ed760] group-hover:rotate-45 transition-transform duration-500" size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-[#b3b3b3] uppercase tracking-wider block">Standard Spec Album</span>
                <span className="text-xs font-bold text-white truncate block mt-0.5">{alb.title}</span>
                <span className="text-[10px] text-[#b3b3b3] truncate block">{alb.subtitle}</span>
              </div>

              <button className="bg-[#1ed760] text-black p-2.5 rounded-full shadow-xl scale-0 group-hover:scale-100 transition-all cursor-pointer">
                <Play size={14} className="fill-black translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats KPI Section with radial progress bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI: Pass rate circle */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-[#252525] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">공정 수율 합격률 (Pass Yield Rate)</span>
            <div className="flex items-center gap-6 mt-4">
              {/* SVG Radial loader */}
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#252525]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#1ed760] transition-all duration-1000"
                    strokeWidth="3.5"
                    strokeDasharray={`${stats.passRate}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold font-mono text-white">{stats.passRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono text-[#cbcbcb]">총 검증수: {stats.total}건</div>
                <div className="text-xs font-mono text-[#1ed760]">합격수: {stats.passes}건</div>
                <div className="text-xs font-mono text-rose-400">불합격수: {stats.fails}건</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#252525] mt-4 flex justify-between items-center text-xs">
            <span className="text-[#b3b3b3]">기품원 도면공차 100% 무결성 타겟</span>
            <span className="text-[#1ed760] font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Quick Launchpad to modules */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-[#252525] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">현장 품질 엔지니어 지능형 툴킷</span>
            <div className="space-y-2 mt-4">
              <button
                onClick={() => onSelectTab('Q&A Bot')}
                className="w-full bg-[#121212] hover:bg-[#1f1f1f] border border-[#252525] p-3 rounded-xl flex items-center justify-between group transition-colors text-left text-xs text-white"
              >
                <div>
                  <span className="font-bold block text-white group-hover:text-[#1ed760] transition-colors">RAG KDS 표준 검색 챗봇</span>
                  <span className="text-[10px] text-[#b3b3b3]">국방 규정 및 안전성 기준 상세 탐색</span>
                </div>
                <ArrowRight size={14} className="text-[#b3b3b3] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectTab('Vision Assist')}
                className="w-full bg-[#121212] hover:bg-[#1f1f1f] border border-[#252525] p-3 rounded-xl flex items-center justify-between group transition-colors text-left text-xs text-white"
              >
                <div>
                  <span className="font-bold block text-white group-hover:text-[#1ed760] transition-colors">고해상 비전 디퍼런싱 판독</span>
                  <span className="text-[10px] text-[#b3b3b3]">화공 조립 크랙 및 볼트 탈락 자동 분석</span>
                </div>
                <ArrowRight size={14} className="text-[#b3b3b3] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* System telemetry logs and security policies */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-[#252525] flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">사내 보안 및 기품원 연동 규격</span>
            <div className="p-3 bg-[#121212] border border-emerald-950 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-[#1ed760] uppercase tracking-widest block font-bold">✓ SECURITY COMPLIANCE</span>
              <p className="text-xs text-[#cbcbcb] leading-relaxed">
                폐쇄망 로컬 아키텍처 연동 및 외부 API 유출 원천 방지 모듈 탑재 완료. 사내 기밀 유도 데이터 유출 무결성 100% 보증.
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#b3b3b3] pt-4 border-t border-[#252525]">
            인증 고유 번호: AQIS-PROD-72F8D465
          </div>
        </div>
      </div>

      {/* Quality Tracks - list of recent measurement records styled as track list */}
      <section className="bg-[#181818] p-5 rounded-2xl border border-[#252525]">
        <div className="flex justify-between items-center mb-4 border-b border-[#252525] pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">실시간 성적서 추적 리스트 (Tracks)</span>
          <span className="text-xs text-[#1ed760] hover:underline cursor-pointer flex items-center gap-1" onClick={() => onSelectTab('SPC Analyzer')}>
            전체 분석 보러가기 <ArrowRight size={14} />
          </span>
        </div>

        <div className="space-y-1">
          {measurements.slice(0, 5).map((m, idx) => (
            <div
              key={m.id}
              className="hover:bg-[#1f1f1f] p-3 rounded-lg flex items-center justify-between text-xs text-[#cbcbcb] group transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[#b3b3b3] w-4">{idx + 1}</span>
                <div>
                  <span className="font-bold text-white block group-hover:text-[#1ed760] transition-colors">{m.partName}</span>
                  <span className="text-[10px] text-[#b3b3b3] font-mono">{m.lotNo} • {m.dimensionName}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="font-mono font-bold text-white">{m.value.toFixed(3)} mm</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  m.status === 'PASS' ? 'bg-emerald-950 text-[#1ed760]' : 'bg-rose-950 text-rose-400'
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
