import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import { X, Copy, Check, QrCode, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShareModal: React.FC = () => {
  const { shareData, setShareData, importSharedItem, setIsQRScannerOpen, themeConfig, showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  const jsonString = shareData ? JSON.stringify({
    nudgeVersion: '1.0',
    type: shareData.type,
    title: shareData.title,
    payload: shareData.data,
  }, null, 2) : '';

  useEffect(() => {
    if (!shareData || !canvasRef.current || activeTab !== 'export') return;
    QRCode.toCanvas(canvasRef.current, jsonString, {
      width: 240,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    }).catch(err => {
      console.error('QR code generation failed', err);
    });
  }, [shareData, jsonString, activeTab]);

  if (!shareData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast('Copied to Clipboard', 'Share payload copied.', '📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const result = importSharedItem(importText.trim());
    if (result.success) {
      setShareData(null);
    }
  };

  return (
    <div id="share-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" style={{ color: themeConfig.accent }} />
            <h2 className="font-bold text-base">Share / Import with QR</h2>
          </div>
          <button
            onClick={() => setShareData(null)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Share vs Import */}
        <div className="p-2 border-b flex items-center gap-2" style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'export' ? 'bg-white dark:bg-stone-800 shadow-xs' : 'opacity-70'
            }`}
            style={{ color: activeTab === 'export' ? themeConfig.textPrimary : themeConfig.textSecondary }}
          >
            Share "{shareData.title}"
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'import' ? 'bg-white dark:bg-stone-800 shadow-xs' : 'opacity-70'
            }`}
            style={{ color: activeTab === 'import' ? themeConfig.textPrimary : themeConfig.textSecondary }}
          >
            Import from Text / Code
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {activeTab === 'export' ? (
            <div className="flex flex-col items-center text-center space-y-4 w-full">
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Scan this QR code with another device or camera to transfer this {shareData.type}.
              </p>

              {/* QR Code Canvas */}
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-stone-200">
                <canvas ref={canvasRef} className="max-w-full rounded-lg" />
              </div>

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 hover:bg-black/5 transition-colors cursor-pointer"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textPrimary }}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Data Code!' : 'Copy Data Payload'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <button
                type="button"
                onClick={() => {
                  setShareData(null);
                  setIsQRScannerOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-xs"
                style={{ borderColor: themeConfig.border, color: themeConfig.textPrimary }}
              >
                <Camera className="w-4 h-4" style={{ color: themeConfig.accent }} />
                <span>Scan with Camera or Upload QR Image</span>
              </button>

              <div className="flex items-center gap-2 text-xs" style={{ color: themeConfig.textMuted }}>
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                <span>or paste raw payload</span>
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
              </div>

              <form onSubmit={handleImportSubmit} className="w-full space-y-4">
              <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                Paste the JSON payload or QR code text from someone else:
              </p>

              <textarea
                rows={7}
                placeholder='Paste payload {"type": "routine", ...} here'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-3 rounded-xl border text-xs font-mono outline-none"
                style={{ backgroundColor: themeConfig.bgMain, borderColor: themeConfig.border, color: themeConfig.textPrimary }}
              />

              <button
                type="submit"
                disabled={!importText.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-40"
                style={{ backgroundColor: themeConfig.accent }}
              >
                Import Item
              </button>
            </form>
          </div>
        )}
      </div>
      </motion.div>
    </div>
  );
};
