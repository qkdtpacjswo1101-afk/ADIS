import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SPCAnalyzer from './components/SPCAnalyzer';
import ReportGenerator from './components/ReportGenerator';
import StandardQABot from './components/StandardQABot';
import VisionAssistant from './components/VisionAssistant';
import SensorTrace from './components/SensorTrace';

import { SEED_MEASUREMENTS, SEED_SENSOR_LOGS } from './data';
import { MeasurementData } from './types';
import { Play, Pause, Disc, Volume2, VolumeX, Download, FileSpreadsheet, Award } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [measurements, setMeasurements] = useState<MeasurementData[]>(SEED_MEASUREMENTS);
  const [customDocContent, setCustomDocContent] = useState('');
  const [isAlarmsMuted, setIsAlarmsMuted] = useState(false);
  const [isPlayingStream, setIsPlayingStream] = useState(true);

  // Dynamic calculations for player bar
  const totalInspected = measurements.length;
  const passedCount = measurements.filter(m => m.status === 'PASS').length;
  const currentProgressPercent = (passedCount / totalInspected) * 100;

  // Browser-based CSV file parser to support One-Click CSV Upload without extra dependencies
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n');
        const parsedData: MeasurementData[] = [];

        // Simple CSV parser ignoring header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(',');
          if (cols.length < 5) continue;

          const value = parseFloat(cols[3] || '0');
          const lsl = parseFloat(cols[4] || '12.0');
          const usl = parseFloat(cols[5] || '13.0');

          parsedData.push({
            id: `upload-${i}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            lotNo: cols[0] || `LOT-CSV-${i}`,
            partName: cols[1] || '업로드 품질 부품',
            dimensionName: cols[2] || '조립 치수 부위',
            value,
            lsl,
            usl,
            inspector: cols[6] || '현장 검수관',
            status: value >= lsl && value <= usl ? 'PASS' : 'FAIL'
          });
        }

        if (parsedData.length > 0) {
          setMeasurements(parsedData);
          alert(`성공적으로 ${parsedData.length}건의 공정 성적서 데이터를 파싱하여 로드하였습니다!`);
        } else {
          alert('CSV 형식이 바르지 않거나 빈 파일입니다. 가이드라인에 부합하는 컬럼 구성을 확인해 주세요.');
        }
      } catch (err) {
        alert('CSV 파싱 과정 중 오류가 발생했습니다. 헤더 규격을 점검하세요.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] overflow-hidden text-white font-sans">
      
      {/* Upper Layout: Sidebar + Main Content Stage */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isLiveInspecting={isPlayingStream} 
        />
        
        <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-[#181818] to-[#121212]">
          
          {/* Header section styled elegantly like Spotify Top Banner */}
          <header className="mb-8 flex justify-between items-center border-b border-[#252525] pb-5">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-[#b3b3b3] uppercase">Aero-Quality Intelligence Suite</p>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">{activeTab}</h1>
            </div>

            {/* Micro badges and quick actions */}
            <div className="flex items-center gap-3">
              <label 
                htmlFor="global-csv-file" 
                className="bg-[#1f1f1f] border border-[#4d4d4d] hover:border-[#1ed760] hover:text-[#1ed760] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FileSpreadsheet size={14} />
                <span>엑셀/CSV 일괄 로드</span>
              </label>
              <input 
                type="file" 
                id="global-csv-file" 
                className="hidden" 
                accept=".csv" 
                onChange={handleCSVUpload} 
              />
              
              <div className="text-[10px] font-mono bg-[#1f1f1f] text-[#1ed760] border border-[#252525] px-4 py-2 rounded-full uppercase tracking-wider">
                AQIS Core Platform v1.4.2
              </div>
            </div>
          </header>

          {/* Router / Switchboard to active tabs */}
          <div className="space-y-6 pb-24">
            {activeTab === 'Dashboard' && (
              <Dashboard 
                measurements={measurements} 
                onSelectTab={setActiveTab} 
              />
            )}
            
            {activeTab === 'SPC Analyzer' && (
              <SPCAnalyzer 
                measurements={measurements} 
                onUploadFile={handleCSVUpload} 
              />
            )}

            {activeTab === 'Report Gen' && (
              <ReportGenerator 
                measurements={measurements} 
              />
            )}

            {activeTab === 'Q&A Bot' && (
              <StandardQABot 
                customDocContent={customDocContent} 
                setCustomDocContent={setCustomDocContent} 
              />
            )}

            {activeTab === 'Vision Assist' && (
              <VisionAssistant />
            )}

            {activeTab === 'Sensor Trace' && (
              <SensorTrace 
                sensorLogs={SEED_SENSOR_LOGS} 
              />
            )}
          </div>
        </main>
      </div>

      {/* Persistent Bottom Bar mimicking the Spotify Now-Playing Music Player */}
      <footer className="h-20 bg-[#181818] border-t border-[#1f1f1f] px-6 flex items-center justify-between z-10 shadow-2xl shrink-0">
        
        {/* Left Side: Mock Vinyl / Album art & Active component */}
        <div className="flex items-center gap-3 w-1/4">
          <div className="relative w-11 h-11 bg-gradient-to-tr from-[#1ed760] to-[#121212] rounded-md overflow-hidden flex items-center justify-center border border-[#252525] shadow-lg group">
            <Disc className={`text-black shrink-0 ${isPlayingStream ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} size={22} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block hover:underline cursor-pointer truncate">
              {activeTab === 'Dashboard' ? '종합 모니터링 모드' : `Active HUD: ${activeTab}`}
            </span>
            <span className="text-[10px] text-[#b3b3b3] block truncate font-mono">
              {isPlayingStream ? '● 실시간 수신 가동 중 (Live Stream)' : '⏸ 일시 정지 상태'}
            </span>
          </div>
        </div>

        {/* Center: Play controls and batch progress bar */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-[500px]">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsPlayingStream(!isPlayingStream)}
              className="bg-white hover:scale-105 active:scale-95 text-black p-2 rounded-full flex items-center justify-center cursor-pointer transition-transform shadow-md"
              title={isPlayingStream ? '실시간 감시 일시정지' : '실시간 감시 재개'}
            >
              {isPlayingStream ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black translate-x-0.5" />}
            </button>
          </div>

          {/* Batch yield progress bar */}
          <div className="w-full flex items-center gap-3 text-[10px] font-mono text-[#b3b3b3]">
            <span>{passedCount} 합격</span>
            <div className="flex-1 bg-[#252525] h-1.5 rounded-full overflow-hidden relative">
              <div 
                className="bg-[#1ed760] h-full rounded-full transition-all duration-500"
                style={{ width: `${currentProgressPercent}%` }}
              />
            </div>
            <span>{totalInspected} 전수</span>
          </div>
        </div>

        {/* Right Side: Quick mute alarm & download */}
        <div className="flex items-center justify-end gap-4 w-1/4">
          <button 
            onClick={() => setIsAlarmsMuted(!isAlarmsMuted)}
            className="text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
            title={isAlarmsMuted ? '알람 음소거 해제' : '이상 변동 경보음 음소거'}
          >
            {isAlarmsMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={() => alert('AQIS 공정 전수 검증 보고서 통합 백업 패키지가 완료되어 내보냈습니다. (AQIS-Inspection-Package.zip)')}
            className="bg-[#1f1f1f] border border-[#4d4d4d] text-[#b3b3b3] hover:text-white hover:border-white px-4 py-1.5 rounded-full text-[10px] font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={12} />
            <span>EXPORTS</span>
          </button>
        </div>

      </footer>

    </div>
  );
}
