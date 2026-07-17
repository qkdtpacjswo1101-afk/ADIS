import { useState, useMemo } from 'react';
import { FileText, ShieldAlert, CheckCircle2, FileDown, Layers, Loader2, RefreshCw } from 'lucide-react';
import { MeasurementData, DefenseReport } from '../types';

interface ReportGeneratorProps {
  measurements: MeasurementData[];
}

export default function ReportGenerator({ measurements }: ReportGeneratorProps) {
  const [selectedLot, setSelectedLot] = useState('All');
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<DefenseReport[]>([
    {
      id: 'rep-001',
      lotNo: 'LOT-20260716-A1',
      generatedAt: '2026-07-16 11:15',
      partCount: 10,
      passCount: 10,
      failCount: 0,
      status: 'VERIFIED',
      errors: []
    },
    {
      id: 'rep-002',
      lotNo: 'LOT-20260716-A2',
      generatedAt: '2026-07-16 14:30',
      partCount: 10,
      passCount: 9,
      failCount: 1,
      status: 'BLOCKED',
      errors: ['측정 항목 #9 치수 (12.98mm)가 USL(12.80mm) 허용치를 이탈하여 국방기술품질원 제출이 차단되었습니다.']
    }
  ]);

  const uniqueLots = useMemo(() => {
    const lots = new Set(measurements.map(m => m.lotNo));
    return ['All', ...Array.from(lots)];
  }, [measurements]);

  const activeLotData = useMemo(() => {
    if (selectedLot === 'All') return measurements;
    return measurements.filter(m => m.lotNo === selectedLot);
  }, [measurements, selectedLot]);

  // Mass merging and validation trigger
  const handleCompileReport = () => {
    setGenerating(true);
    setTimeout(() => {
      // Find out bounds elements inside current lot data
      const failures = activeLotData.filter(m => m.value < m.lsl || m.value > m.usl);
      const isBlocked = failures.length > 0;

      const newReport: DefenseReport = {
        id: `rep-${Date.now()}`,
        lotNo: selectedLot === 'All' ? 'MERGED_BATCH_PACKAGE' : selectedLot,
        generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        partCount: activeLotData.length,
        passCount: activeLotData.length - failures.length,
        failCount: failures.length,
        status: isBlocked ? 'BLOCKED' : 'VERIFIED',
        errors: failures.map(f => `로트 치수 오차 탈피 검출: ${f.dimensionName} 측정값 ${f.value}mm (허용 범위: ${f.lsl}~${f.usl}mm)`),
        docUrl: !isBlocked ? '#download-doc' : undefined
      };

      setReports(prev => [newReport, ...prev]);
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#181818] p-6 rounded-xl border border-[#252525]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1ed760] text-black p-2.5 rounded-full">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Defense Report Standard Generator</h2>
              <p className="text-xs text-[#b3b3b3]">국방기술품질원(기품원) 및 소요군 제출 표준 성적서 자동 빌더 및 오기입 안심 검증기</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedLot}
              onChange={(e) => setSelectedLot(e.target.value)}
              className="bg-[#121212] border border-[#4d4d4d] text-white text-xs px-4 py-2.5 rounded-full font-bold focus:outline-none"
            >
              {uniqueLots.map(lot => (
                <option key={lot} value={lot}>{lot === 'All' ? '전체 로트 병합' : lot}</option>
              ))}
            </select>

            <button
              onClick={handleCompileReport}
              disabled={generating || activeLotData.length === 0}
              className="bg-[#1ed760] text-black hover:scale-105 active:scale-95 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-transform flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generating ? <Loader2 className="animate-spin" size={16} /> : <Layers size={16} />}
              {generating ? '검증 병합 중...' : '국방 표준 양식 자동 융합'}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#b3b3b3] mt-4 leading-relaxed max-w-4xl">
          기품원 표준 양식 매핑 절차에 의거하여, 다량의 원천 로트 성적서를 통합 제출 패키지로 일괄 병합(Mass Processing)합니다.
          검사값 중 설계 규격(LSL/USL)을 이탈한 치우침 값이 1건이라도 발견되는 즉시, <b>제출 보고서 생성을 강제 차단</b>하여 군 신뢰성 무결성을 100% 확보합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of current Lot records being analyzed */}
        <div className="lg:col-span-2 bg-[#181818] p-5 rounded-2xl border border-[#252525] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#252525] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">성적서 검증 실시간 리스트 ({activeLotData.length}건)</span>
              <span className="text-[10px] text-[#b3b3b3] font-mono">선택 로트: {selectedLot}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#b3b3b3] border-b border-[#1f1f1f]">
                    <th className="py-2.5 font-semibold">순서</th>
                    <th className="py-2.5 font-semibold">로트 번호</th>
                    <th className="py-2.5 font-semibold">부품명</th>
                    <th className="py-2.5 font-semibold">측정 치수</th>
                    <th className="py-2.5 font-semibold">도면 공차</th>
                    <th className="py-2.5 font-semibold text-right">판정</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f] text-[#cbcbcb]">
                  {activeLotData.map((item, idx) => {
                    const isFail = item.value < item.lsl || item.value > item.usl;
                    return (
                      <tr key={item.id} className="hover:bg-[#1f1f1f]/50 transition-colors">
                        <td className="py-2.5 font-mono">{idx + 1}</td>
                        <td className="py-2.5 font-mono text-[#1ed760]">{item.lotNo}</td>
                        <td className="py-2.5 max-w-[150px] truncate">{item.partName}</td>
                        <td className="py-2.5 font-mono font-bold text-white">{item.value.toFixed(3)} mm</td>
                        <td className="py-2.5 font-mono text-[10px] text-[#b3b3b3]">{item.lsl}~{item.usl} mm</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFail ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-[#1ed760]'
                          }`}>
                            {isFail ? 'FAIL' : 'PASS'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Defense Submission Package Panel */}
        <div className="lg:col-span-1 bg-[#181818] p-5 rounded-2xl border border-[#252525] space-y-4">
          <div className="border-b border-[#252525] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">제출 패키지 성적 현황</h3>
            <p className="text-[10px] text-[#b3b3b3]">국방기술품질원 제출용 이력 대장</p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto">
            {reports.map((rep) => (
              <div 
                key={rep.id} 
                className={`p-4 rounded-xl border transition-all ${
                  rep.status === 'BLOCKED' 
                    ? 'bg-rose-950/20 border-rose-900/40' 
                    : 'bg-[#1f1f1f] border-[#252525]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#b3b3b3] block">{rep.generatedAt}</span>
                    <span className="text-xs font-bold text-white font-mono block mt-0.5">{rep.lotNo}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    rep.status === 'BLOCKED' 
                      ? 'bg-red-950 text-red-400 border border-red-500' 
                      : 'bg-emerald-950 text-[#1ed760] border border-[#1ed760]'
                  }`}>
                    {rep.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center bg-[#121212] p-2 rounded-lg text-[11px] font-mono text-white">
                  <div>
                    <div className="text-[9px] text-[#b3b3b3]">총 부품수</div>
                    <div className="font-bold">{rep.partCount}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#b3b3b3]">합격수</div>
                    <div className="font-bold text-[#1ed760]">{rep.passCount}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#b3b3b3]">불합격수</div>
                    <div className="font-bold text-rose-400">{rep.failCount}</div>
                  </div>
                </div>

                {rep.status === 'BLOCKED' ? (
                  <div className="mt-3 p-3 bg-red-950/40 border border-red-900/30 rounded-lg text-[11px] text-red-300 leading-relaxed flex gap-2">
                    <ShieldAlert size={16} className="shrink-0 text-red-400" />
                    <div>
                      <span className="font-bold block">대관 제출 차단됨</span>
                      {rep.errors[0]}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={14} /> 검증 통과 완료
                    </span>
                    <button
                      onClick={() => alert('국방 표준 성적서 양식이 엑셀 및 PDF 통합 번들 패키지로 다운로드되었습니다. (Aero-Quality-Defense-Standard.pdf)')}
                      className="bg-[#252525] hover:bg-[#2d2d2d] hover:text-[#1ed760] text-white font-bold p-2 rounded-full cursor-pointer flex items-center justify-center transition-colors"
                      title="성적서 통합본 다운로드"
                    >
                      <FileDown size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
