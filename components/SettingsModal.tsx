
import React, { useState, useEffect } from 'react';
import { X, Key, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { saveApiKey, getApiKey } from '../utils/storage';
import { testConnection } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = getApiKey();
      if (storedKey) setKey(storedKey);
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!key.trim()) {
      setStatus('error');
      setMessage('API Key를 입력해주세요.');
      return;
    }

    setStatus('testing');
    setMessage('연결 테스트 중...');

    try {
      await testConnection(key.trim());
      saveApiKey(key.trim());
      setStatus('success');
      setMessage('연결 성공! 키가 로컬에 안전하게 저장되었습니다.');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setStatus('error');
      setMessage('연결 실패: 키를 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-surface border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-primary" />
            <h2 className="font-semibold text-white">API 설정</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Google Gemini API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AI Studio API Key 입력"
              className="w-full p-3 bg-background rounded-xl border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-gray-500">
              키는 서버로 전송되지 않으며, 브라우저에 암호화되어 저장됩니다.
            </p>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              status === 'error' ? 'bg-red-500/10 text-red-400' :
              status === 'success' ? 'bg-green-500/10 text-green-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {status === 'testing' && <Loader2 size={16} className="animate-spin" />}
              {status === 'success' && <CheckCircle2 size={16} />}
              {status === 'error' && <AlertCircle size={16} />}
              <span>{message}</span>
            </div>
          )}

          <button
            onClick={handleTestAndSave}
            disabled={status === 'testing'}
            className="w-full py-3 bg-primary hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {status === 'testing' ? '테스트 중...' : '연결 테스트 및 저장'}
          </button>
          
          <div className="text-center">
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-secondary hover:text-white underline underline-offset-2">
               API Key 발급받기
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
