import React, { useState } from 'react';
import { BotMessageSquare, Send, BookOpen, AlertCircle, FileText, Loader2 } from 'lucide-react';

interface StandardQABotProps {
  customDocContent: string;
  setCustomDocContent: (content: string) => void;
}

export default function StandardQABot({ customDocContent, setCustomDocContent }: StandardQABotProps) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot'; text: string; sources?: string[] }>>([
    {
      role: 'bot',
      text: '안녕하십니까. AQIS 국방규격(KDS) 및 표준 지식 검색 챗봇입니다. 신관 어셈블리 토크 범위, 화공품 시험 전압, 전개부 힌지 규격 등 규정사항을 질문하시면 즉시 관련 장절 및 페이지 근거와 함께 답변해 드리겠습니다.',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const sampleQuestions = [
    { label: '신관 SAD 허용 토크 범위', q: 'KDS 1420-2004 규격에 따른 신관 SAD의 허용 체결 토크 범위와 검사 수명 주기 및 관련 페이지 근거를 정리해 줘.' },
    { label: '화공품 정전기 안전 규격', q: 'KDS 1375-4001에 정의된 유도탄용 화공품 점화 저항 범위, 절연 시험 규격 및 정전기 기준은?' },
    { label: '날개 전개 힌지 간극 및 회전각', q: 'KDS 5810-1012 규격 내 Control Fin 전개부의 힌지 조립 허용 간극과 회전 오차 범위, 체결 토크를 알려줘.' }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    // Add User Message
    setChatHistory(prev => [...prev, { role: 'user', text: textToSend }]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          customContext: customDocContent || undefined
        })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();

      setChatHistory(prev => [...prev, {
        role: 'bot',
        text: data.answer,
        sources: data.sources?.map((s: any) => `${s.name} (p.${s.page})`)
      }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        role: 'bot',
        text: `오류가 발생했습니다: ${err.message || '서버 응답 실패'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomDocContent(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-230px)]">
      {/* Sidebar: Ingest Custom Specs & Presets */}
      <div className="lg:col-span-1 bg-[#181818] rounded-xl p-5 border border-[#252525] flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#1ed760]">
            <BookOpen size={20} />
            <h2 className="text-base font-bold text-white">RAG 규격 DB 소스</h2>
          </div>
          <p className="text-xs text-[#b3b3b3] leading-relaxed mb-4">
            국방규격(KDS) 및 기품원 제출용 작업 표준서가 서버에 벡터 DB 형태로 기본 탑재되어 있습니다. 
            현장 작업표준서(SOP)나 비표준 도면 주석 파일을 추가로 업로드하면 질문 시 자동 융합 분석이 가능합니다.
          </p>

          {/* Preset Questions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">신속 질문 프리셋</h3>
            {sampleQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSend(item.q)}
                className="w-full text-left bg-[#1f1f1f] text-xs text-white hover:bg-[#252525] hover:text-[#1ed760] transition-colors p-3 rounded-xl border border-[#272727] flex items-start gap-2 leading-relaxed"
              >
                <span className="text-[#1ed760] font-bold">•</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Custom Doc */}
        <div className="bg-[#1f1f1f] p-4 rounded-xl border border-[#272727] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <FileText size={16} className="text-[#1ed760]" />
            <span>작업표준서(SOP) 개별 추가</span>
          </div>
          <p className="text-[11px] text-[#b3b3b3]">
            텍스트 기반의 개별 규격문서를 추가 탑재합니다.
          </p>
          <input
            type="file"
            id="spec-upload"
            className="hidden"
            accept=".txt,.csv,.json"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="spec-upload"
            className="block text-center bg-[#181818] border border-[#4d4d4d] text-[#ffffff] hover:border-[#1ed760] hover:text-[#1ed760] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            {fileName ? `${fileName.slice(0, 15)}...` : '문서 파일 찾기'}
          </label>
          {customDocContent && (
            <div className="flex items-center justify-between text-[11px] text-[#1ed760]">
              <span>✓ 임시 지식 저장소 융합 완료</span>
              <button 
                onClick={() => { setCustomDocContent(''); setFileName(''); }} 
                className="text-red-400 hover:underline cursor-pointer"
              >
                제거
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-2 bg-[#181818] rounded-xl border border-[#252525] flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-[#252525] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="bg-[#1ed760] text-black p-2 rounded-full">
              <BotMessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">KDS Standard Intelligent Navigator</h3>
              <p className="text-[10px] text-[#b3b3b3]">Gemini-3.5-Flash RAG Engine Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] bg-[#121212] px-3 py-1.5 rounded-full text-[#1ed760] font-mono border border-[#252525]">
            <span className="w-1.5 h-1.5 bg-[#1ed760] rounded-full animate-pulse"></span>
            <span>SECURE LOCAL PROXY</span>
          </div>
        </div>

        {/* Message Panel */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#121212]/40">
          {chatHistory.map((chat, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  chat.role === 'user' 
                    ? 'bg-[#1ed760] text-black font-semibold shadow-lg' 
                    : 'bg-[#1f1f1f] text-[#cbcbcb] border border-[#252525] shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{chat.text}</div>
                
                {/* Embedded citations for authenticity */}
                {chat.sources && chat.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2d2d2d] flex flex-wrap gap-2">
                    <span className="text-[10px] text-[#b3b3b3] font-mono block w-full mb-1">근거 규격집:</span>
                    {chat.sources.map((src, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-[#252525] text-[#1ed760] px-2 py-0.5 rounded-full font-mono">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#b3b3b3] mt-1 px-2 font-mono">
                {chat.role === 'user' ? '전송 완료' : '규격 검증 결과'}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 bg-[#1f1f1f] p-4 rounded-xl border border-[#252525] w-fit">
              <Loader2 className="animate-spin text-[#1ed760]" size={16} />
              <span className="text-xs text-[#b3b3b3] font-mono">KDS 규격 연동 인덱스 탐색 중...</span>
            </div>
          )}
        </div>

        {/* Message Input bar */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#252525] flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(question)}
            placeholder="규격서 내 특정 공정의 허용 토크나 검사 주기에 관해 질문하세요..."
            className="flex-1 bg-[#121212] text-white text-xs rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-[#1ed760] border border-[#252525]"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(question)}
            disabled={isLoading}
            className="bg-[#1ed760] text-black hover:scale-105 active:scale-95 transition-transform p-3 rounded-full flex items-center justify-center cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
