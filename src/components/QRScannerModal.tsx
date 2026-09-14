import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';
import { 
  X, Camera, Upload, Clipboard, Check, AlertCircle, 
  RotateCw, ArrowRight, Sparkles, Layers, ListChecks, Briefcase, ChevronRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Routine, Checklist, Backpack } from '../types';

interface DecodedNudgeData {
  type: 'routine' | 'checklist' | 'backpack';
  name: string;
  emoji: string;
  color: string;
  description?: string;
  items: Array<{ name: string; emoji?: string; durationMinutes?: number; isRequired?: boolean }>;
  rawPayload: any;
}

export const QRScannerModal: React.FC = () => {
  const { 
    isQRScannerOpen, setIsQRScannerOpen, importSharedItem, 
    routines, checklists, backpacks, setActiveTab, themeConfig, showToast 
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'camera' | 'upload' | 'paste'>('camera');
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Preview State
  const [decodedData, setDecodedData] = useState<DecodedNudgeData | null>(null);
  const [importDestination, setImportDestination] = useState<'new' | 'existing'>('new');
  const [targetType, setTargetType] = useState<'routine' | 'checklist' | 'backpack'>('routine');
  const [customName, setCustomName] = useState('');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');
  
  // Success State
  const [importSuccess, setImportSuccess] = useState<{ name: string; type: string; id: string } | null>(null);

  // Camera & Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Reset all state when modal closes
  const handleClose = () => {
    stopCamera();
    setIsQRScannerOpen(false);
    setDecodedData(null);
    setScanError(null);
    setCameraPermissionError(null);
    setPasteInput('');
    setImportSuccess(null);
  };

  // Process decoded QR text string
  const processDecodedString = useCallback((rawString: string) => {
    setScanError(null);
    try {
      const parsed = JSON.parse(rawString.trim());
      
      let type: 'routine' | 'checklist' | 'backpack' = 'routine';
      let payload: any = null;

      if (parsed.nudgeVersion && parsed.payload) {
        type = parsed.type || 'routine';
        payload = parsed.payload;
      } else if (parsed.type && (parsed.payload || parsed.data)) {
        type = parsed.type;
        payload = parsed.payload || parsed.data;
      } else if (Array.isArray(parsed.activities)) {
        type = 'routine';
        payload = parsed;
      } else if (Array.isArray(parsed.items)) {
        const first = parsed.items[0];
        if (first && (first.isPacked !== undefined || first.isRequired !== undefined)) {
          type = 'backpack';
        } else {
          type = 'checklist';
        }
        payload = parsed;
      } else {
        setScanError('The scanned QR code is not recognized. Please scan a QR code created with Nudge.');
        return;
      }

      if (!payload || typeof payload !== 'object') {
        setScanError('The QR code contains empty or invalid Nudge data.');
        return;
      }

      const name = payload.name || payload.title || `Shared ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      const emoji = payload.emoji || (type === 'routine' ? '☀️' : type === 'checklist' ? '📋' : '🎒');
      const color = payload.color || (type === 'routine' ? '#f59e0b' : type === 'checklist' ? '#3b82f6' : '#8b5cf6');
      
      let itemsList: Array<{ name: string; emoji?: string; durationMinutes?: number; isRequired?: boolean }> = [];
      if (type === 'routine' && Array.isArray(payload.activities)) {
        itemsList = payload.activities.map((a: any) => ({
          name: a.name || 'Activity',
          emoji: a.emoji || '✨',
          durationMinutes: a.durationMinutes || 5,
        }));
      } else if (Array.isArray(payload.items)) {
        itemsList = payload.items.map((i: any) => ({
          name: i.name || 'Item',
          emoji: i.emoji || (type === 'backpack' ? '🎒' : '✓'),
          isRequired: Boolean(i.isRequired),
        }));
      }

      setDecodedData({
        type,
        name,
        emoji,
        color,
        description: payload.description || '',
        items: itemsList,
        rawPayload: payload,
      });

      setTargetType(type);
      setCustomName(name);
      setImportDestination('new');

      // Set default existing item id if any exist
      if (type === 'routine' && routines.length > 0) {
        setSelectedExistingId(routines[0].id);
      } else if (type === 'checklist' && checklists.length > 0) {
        setSelectedExistingId(checklists[0].id);
      } else if (type === 'backpack' && backpacks.length > 0) {
        setSelectedExistingId(backpacks[0].id);
      }

      stopCamera();
    } catch {
      setScanError('Unable to read QR code. The content is not valid JSON or Nudge format.');
    }
  }, [routines, checklists, backpacks, stopCamera]);

  // Frame processing loop for video
  const scanVideoFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      processDecodedString(code.data);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [processDecodedString]);

  // Start live camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraPermissionError(null);
    setScanError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
        });
        animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraPermissionError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. You can still scan by uploading an image or pasting payload code below.'
          : 'Could not access the camera. You can upload an image of the QR code instead.'
      );
    }
  }, [facingMode, scanVideoFrame, stopCamera]);

  // Effect to manage camera lifecycle
  useEffect(() => {
    if (isQRScannerOpen && activeTab === 'camera' && !decodedData && !importSuccess) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isQRScannerOpen, activeTab, decodedData, importSuccess, startCamera, stopCamera]);

  // Handle uploaded image file
  const handleImageFile = (file: File) => {
    setScanError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
          setScanError('Failed to initialize image processing canvas.');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          processDecodedString(code.data);
        } else {
          setScanError('No QR code could be detected in this image. Please upload a clear photo or screenshot of the Nudge QR code.');
        }
      };
      img.onerror = () => {
        setScanError('Failed to load the selected image file.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm and perform import
  const handleConfirmImport = () => {
    if (!decodedData) return;

    const payloadToImport = {
      ...decodedData.rawPayload,
      name: customName.trim() || decodedData.name,
    };

    const envelope = JSON.stringify({
      nudgeVersion: '1.0',
      type: targetType,
      title: payloadToImport.name,
      payload: payloadToImport,
    });

    const result = importSharedItem(envelope, {
      targetType,
      mergeIntoId: importDestination === 'existing' ? selectedExistingId : undefined,
    });

    if (result.success) {
      setImportSuccess({
        name: payloadToImport.name,
        type: targetType,
        id: result.id || '',
      });
    } else {
      setScanError(result.message);
    }
  };

  // Navigate to imported section
  const handleViewImported = () => {
    if (!importSuccess) return;
    const tabMap: Record<string, string> = {
      routine: 'routines',
      checklist: 'checklists',
      backpack: 'backpacks',
    };
    const tab = tabMap[importSuccess.type] || 'today';
    setActiveTab(tab);
    handleClose();
  };

  if (!isQRScannerOpen) return null;

  return (
    <div 
      id="qr-scanner-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border my-auto min-w-0"
        style={{
          backgroundColor: themeConfig.bgCard,
          borderColor: themeConfig.border,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between min-w-0" style={{ borderColor: themeConfig.border }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: themeConfig.accent }}
            >
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base truncate">
                {decodedData ? 'Preview & Import' : importSuccess ? 'Import Successful' : 'Scan Nudge QR Code'}
              </h2>
              <p className="text-[11px] truncate" style={{ color: themeConfig.textMuted }}>
                {decodedData 
                  ? 'Confirm details before adding to your app' 
                  : importSuccess 
                  ? 'Your content is ready to use' 
                  : 'Import shared routines, checklists & backpacks'}
              </p>
            </div>
          </div>
          <button
            id="close-qr-scanner-btn"
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 ml-2"
            style={{ color: themeConfig.textSecondary }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-w-0">
          {/* STEP 1: SCANNING INTERFACE */}
          {!decodedData && !importSuccess && (
            <div className="space-y-4">
              {/* Method Switcher Tabs */}
              <div 
                className="p-1 rounded-2xl border flex items-center gap-1 text-xs font-semibold"
                style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}
              >
                <button
                  type="button"
                  onClick={() => { setActiveTabState('camera'); setScanError(null); }}
                  className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'camera' ? 'bg-white dark:bg-stone-800 shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ color: activeTab === 'camera' ? themeConfig.textPrimary : themeConfig.textSecondary }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTabState('upload'); stopCamera(); setScanError(null); }}
                  className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upload' ? 'bg-white dark:bg-stone-800 shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ color: activeTab === 'upload' ? themeConfig.textPrimary : themeConfig.textSecondary }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTabState('paste'); stopCamera(); setScanError(null); }}
                  className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'paste' ? 'bg-white dark:bg-stone-800 shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ color: activeTab === 'paste' ? themeConfig.textPrimary : themeConfig.textSecondary }}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste Code</span>
                </button>
              </div>

              {/* Scan Error Message */}
              {scanError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Unable to Read QR Code</p>
                    <p className="text-[11px] mt-0.5 opacity-90">{scanError}</p>
                  </div>
                </div>
              )}

              {/* TAB 1: Live Camera Scanner */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  {cameraPermissionError ? (
                    <div className="p-6 rounded-2xl border text-center space-y-3" style={{ borderColor: themeConfig.border, backgroundColor: themeConfig.bgMain }}>
                      <Camera className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-xs font-medium" style={{ color: themeConfig.textSecondary }}>
                        {cameraPermissionError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTabState('upload')}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                        style={{ backgroundColor: themeConfig.accent }}
                      >
                        Upload QR Image Instead
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square max-h-[340px] mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
                      {/* Video Stream */}
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        autoPlay
                      />
                      {/* Canvas for processing */}
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Viewfinder Target Box Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-56 h-56 relative border-2 border-white/60 rounded-2xl shadow-2xl">
                          {/* Corner highlights */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                          {/* Scanning Laser Line */}
                          <motion.div
                            animate={{ y: [0, 200, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                            className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399]"
                          />
                        </div>
                      </div>

                      {/* Camera Switch Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
                        }}
                        className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition-all cursor-pointer"
                        title="Flip Camera"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      {/* Instruction Pill */}
                      <div className="absolute top-3 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-md">
                        Point camera at a Nudge QR code
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Image File Upload */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all flex flex-col items-center justify-center space-y-3"
                    style={{ borderColor: themeConfig.border }}
                  >
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                      style={{ backgroundColor: `${themeConfig.accent}20`, color: themeConfig.accent }}
                    >
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: themeConfig.textPrimary }}>
                        Click to upload or drag & drop QR image
                      </p>
                      <p className="text-xs mt-1" style={{ color: themeConfig.textMuted }}>
                        Supports PNG, JPG, or screenshot files
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Paste Code / JSON */}
              {activeTab === 'paste' && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                    Paste the JSON data or payload text copied from Nudge:
                  </p>
                  <textarea
                    rows={6}
                    placeholder='{"nudgeVersion":"1.0","type":"routine",...}'
                    value={pasteInput}
                    onChange={(e) => setPasteInput(e.target.value)}
                    className="w-full p-3 rounded-2xl border text-xs font-mono outline-none"
                    style={{
                      backgroundColor: themeConfig.bgMain,
                      borderColor: themeConfig.border,
                      color: themeConfig.textPrimary,
                    }}
                  />
                  <button
                    type="button"
                    disabled={!pasteInput.trim()}
                    onClick={() => processDecodedString(pasteInput)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs disabled:opacity-40 transition-all cursor-pointer"
                    style={{ backgroundColor: themeConfig.accent }}
                  >
                    Read & Preview Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREVIEW & IMPORT CUSTOMIZATION */}
          {decodedData && !importSuccess && (
            <div className="space-y-5">
              {/* Item Card Banner */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: themeConfig.bgMain,
                  borderColor: themeConfig.border,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0"
                      style={{
                        backgroundColor: `${decodedData.color}25`,
                        border: `1.5px solid ${decodedData.color}`,
                      }}
                    >
                      {decodedData.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: decodedData.color }}
                        >
                          {targetType}
                        </span>
                        {decodedData.description && (
                          <span className="text-[11px] truncate" style={{ color: themeConfig.textMuted }}>
                            {decodedData.description}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="font-bold text-base mt-1 w-full bg-transparent border-b border-dashed outline-none pb-0.5"
                        style={{ color: themeConfig.textPrimary, borderColor: themeConfig.border }}
                        title="Click to rename"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Items List Preview */}
                <div className="pt-2 border-t" style={{ borderColor: themeConfig.border }}>
                  <p className="text-xs font-semibold mb-2 flex items-center justify-between" style={{ color: themeConfig.textSecondary }}>
                    <span>Included {targetType === 'routine' ? 'Activities' : 'Items'} ({decodedData.items.length}):</span>
                    {targetType === 'routine' && decodedData.rawPayload.estimatedDuration && (
                      <span className="text-[11px] font-normal" style={{ color: themeConfig.textMuted }}>
                        ~{decodedData.rawPayload.estimatedDuration} minutes total
                      </span>
                    )}
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {decodedData.items.map((it, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 gap-2"
                      >
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <span className="shrink-0">{it.emoji || '✨'}</span>
                          <span className="truncate font-medium" style={{ color: themeConfig.textPrimary }}>
                            {it.name}
                          </span>
                        </div>
                        {it.durationMinutes ? (
                          <span className="text-[11px] shrink-0 font-medium" style={{ color: themeConfig.textMuted }}>
                            {it.durationMinutes} min
                          </span>
                        ) : it.isRequired ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold uppercase shrink-0">
                            Required
                          </span>
                        ) : null}
                      </div>
                    ))}
                    {decodedData.items.length === 0 && (
                      <p className="text-xs italic py-2 text-center" style={{ color: themeConfig.textMuted }}>
                        No individual items listed.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Import Options: As New vs Merge */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: themeConfig.textMuted }}>
                  Import Destination
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label 
                    onClick={() => setImportDestination('new')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      importDestination === 'new' ? 'ring-2 bg-black/5 dark:bg-white/5 font-semibold' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: importDestination === 'new' ? themeConfig.accent : themeConfig.border }}
                  >
                    <input
                      type="radio"
                      name="import-dest"
                      checked={importDestination === 'new'}
                      onChange={() => setImportDestination('new')}
                      className="hidden"
                    />
                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: themeConfig.accent }} />
                    <div className="text-xs">
                      <p className="font-bold">Create New {targetType.charAt(0).toUpperCase() + targetType.slice(1)}</p>
                      <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>Add as a separate card</p>
                    </div>
                  </label>

                  {/* Merge into Existing option if applicable */}
                  <label 
                    onClick={() => {
                      setImportDestination('existing');
                      if (targetType === 'routine' && routines.length > 0 && !selectedExistingId) setSelectedExistingId(routines[0].id);
                      if (targetType === 'checklist' && checklists.length > 0 && !selectedExistingId) setSelectedExistingId(checklists[0].id);
                      if (targetType === 'backpack' && backpacks.length > 0 && !selectedExistingId) setSelectedExistingId(backpacks[0].id);
                    }}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      importDestination === 'existing' ? 'ring-2 bg-black/5 dark:bg-white/5 font-semibold' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: importDestination === 'existing' ? themeConfig.accent : themeConfig.border }}
                  >
                    <input
                      type="radio"
                      name="import-dest"
                      checked={importDestination === 'existing'}
                      onChange={() => setImportDestination('existing')}
                      className="hidden"
                    />
                    <Layers className="w-4 h-4 shrink-0" style={{ color: themeConfig.accent }} />
                    <div className="text-xs">
                      <p className="font-bold">Add to Existing</p>
                      <p className="text-[10px]" style={{ color: themeConfig.textMuted }}>Append items to existing list</p>
                    </div>
                  </label>
                </div>

                {/* If merging, show existing items dropdown */}
                {importDestination === 'existing' && (
                  <div className="p-3 rounded-2xl border space-y-2 bg-black/5 dark:bg-white/5" style={{ borderColor: themeConfig.border }}>
                    <label className="text-xs font-medium block" style={{ color: themeConfig.textSecondary }}>
                      Select existing {targetType} to append to:
                    </label>
                    <select
                      value={selectedExistingId}
                      onChange={(e) => setSelectedExistingId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border text-xs font-semibold outline-none"
                      style={{
                        backgroundColor: themeConfig.bgCard,
                        borderColor: themeConfig.border,
                        color: themeConfig.textPrimary,
                      }}
                    >
                      {targetType === 'routine' && routines.map(r => (
                        <option key={r.id} value={r.id}>{r.emoji} {r.name} ({r.activities.length} activities)</option>
                      ))}
                      {targetType === 'checklist' && checklists.map(c => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.name} ({c.items.length} items)</option>
                      ))}
                      {targetType === 'backpack' && backpacks.map(b => (
                        <option key={b.id} value={b.id}>{b.emoji} {b.name} ({b.items.length} items)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Type Conversion Switcher */}
                <div className="pt-2">
                  <span className="text-[11px] block mb-1.5" style={{ color: themeConfig.textMuted }}>
                    Import type:
                  </span>
                  <div className="flex gap-1.5">
                    {(['routine', 'checklist', 'backpack'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTargetType(t);
                          if (t === 'routine' && routines.length > 0) setSelectedExistingId(routines[0].id);
                          if (t === 'checklist' && checklists.length > 0) setSelectedExistingId(checklists[0].id);
                          if (t === 'backpack' && backpacks.length > 0) setSelectedExistingId(backpacks[0].id);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs capitalize transition-all cursor-pointer ${
                          targetType === t ? 'font-bold text-white shadow-xs' : 'border hover:bg-black/5'
                        }`}
                        style={{
                          backgroundColor: targetType === t ? themeConfig.accent : 'transparent',
                          borderColor: themeConfig.border,
                          color: targetType === t ? '#ffffff' : themeConfig.textSecondary,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: themeConfig.border }}>
                <button
                  type="button"
                  onClick={() => {
                    setDecodedData(null);
                    setScanError(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer text-center"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  Scan Another
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm & Import</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {importSuccess && (
            <div className="py-6 text-center space-y-4">
              <div 
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg bg-emerald-500 text-white animate-bounce"
              >
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold" style={{ color: themeConfig.textPrimary }}>
                  Successfully Imported!
                </h3>
                <p className="text-xs" style={{ color: themeConfig.textSecondary }}>
                  "{importSuccess.name}" has been added to your {importSuccess.type}s.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setImportSuccess(null);
                    setDecodedData(null);
                    setPasteInput('');
                    setActiveTabState('camera');
                  }}
                  className="w-full py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 transition-all cursor-pointer"
                  style={{ borderColor: themeConfig.border, color: themeConfig.textSecondary }}
                >
                  Scan Another QR
                </button>
                <button
                  type="button"
                  onClick={handleViewImported}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1 hover:opacity-90 transition-all cursor-pointer"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  <span>View in {importSuccess.type.charAt(0).toUpperCase() + importSuccess.type.slice(1)}s</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
