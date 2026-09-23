import React, { useState, useEffect, useRef } from 'react';
import { WasteClassificationResult } from '../types/index.ts';
import { classifyWaste, fetchDemoWasteItems } from '../services/api.ts';
import {
  Trash2,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  MapPin,
  Recycle,
  HelpCircle,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface DemoWasteItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  confidence: number;
  explanation: string;
  recommendedDisposalRoute: string;
  isRecyclable: boolean;
  campusBinLocation: string;
}

export const WastePage: React.FC = () => {
  const [demoItems, setDemoItems] = useState<DemoWasteItem[]>([]);
  const [selectedDemoItem, setSelectedDemoItem] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [classification, setClassification] = useState<WasteClassificationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDemoWasteItems()
      .then((res) => {
        setDemoItems(res.items);
        // Default analyze first demo item
        if (res.items.length > 0) {
          handleSelectDemoItem(res.items[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSelectDemoItem = async (item: DemoWasteItem) => {
    setSelectedDemoItem(item.id);
    setUploadedImage(item.imageUrl);
    setIsAnalyzing(true);

    try {
      const result = await classifyWaste({ demoItemId: item.id });
      setClassification(result);
    } catch (err) {
      console.error('Classification error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadedImage(base64Data);
      setSelectedDemoItem(null);
      setIsAnalyzing(true);

      try {
        const result = await classifyWaste({
          imageBase64: base64Data,
          mimeType: file.type || 'image/jpeg',
        });
        setClassification(result);
      } catch (err) {
        console.error('Classification failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'Organic':
        return 'text-lime-400 bg-lime-500/10 border-lime-500/30';
      case 'Paper':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Plastic':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'E-waste':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'General waste':
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Trash2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              AGENT 4 OF 6
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">
              GEMINI 3.8 FLASH VISION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white light:text-slate-900">
            General Waste & Smart Sorting Agent
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-1">
            Visual item classification for Organic, Paper, Plastic, E-waste, and Landfill streams to prevent contamination of campus recycling bales.
          </p>
        </div>
      </div>

      {/* Demo Items Quick-Picker */}
      <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-5 backdrop-blur-md light:bg-white light:border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white light:text-slate-900">
              1-Click Demo Mode (Instant Campus Sample Tests)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any card to trigger live classification</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {demoItems.map((item) => {
            const isSelected = selectedDemoItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectDemoItem(item)}
                className={`group rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500 light:bg-emerald-50'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 light:bg-slate-50 light:border-slate-200'
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900 mb-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white light:text-slate-900 truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload & Classifier Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drag & Drop Upload Zone */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between light:bg-white light:border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-400" />
                Waste Image Ingestion
              </h3>
              <span className="text-[10px] font-mono rounded bg-slate-800 px-2 py-0.5 text-slate-400">
                DRAG & DROP OR FILE
              </span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-950/30'
                  : 'border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 light:border-slate-300 light:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="relative aspect-video max-h-56 overflow-hidden rounded-xl">
                  <img
                    src={uploadedImage}
                    alt="Uploaded waste item"
                    className="h-full w-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white text-xs font-bold gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                      <span>Gemini 3.8 Flash Vision Analyzing...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white light:text-slate-900">
                      Drop student or dining waste image here
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP (food packaging, wrappers, lab bottles, batteries)
                    </p>
                  </div>
                  <span className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 light:bg-slate-200 light:text-slate-800">
                    Browse File
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by Gemini 3.8 Flash Multimodal SDK</span>
            {uploadedImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedImage(null);
                  setClassification(null);
                  setSelectedDemoItem(null);
                }}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Clear Image
              </button>
            )}
          </div>
        </div>

        {/* Right: AI Classification Results */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between light:bg-white light:border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                AI Visual Classification Output
              </h3>
              {classification && (
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
                  {classification.predictionSource}
                </span>
              )}
            </div>

            {classification ? (
              <div className="space-y-4">
                {/* Category & Confidence Badge */}
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 light:bg-slate-50 light:border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Detected Stream
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-lg px-3 py-1 text-sm font-extrabold uppercase border ${getCategoryColor(
                          classification.category
                        )}`}
                      >
                        {classification.category}
                      </span>
                      {classification.isRecyclable ? (
                        <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          <Recycle className="h-3 w-3" /> Recyclable
                        </span>
                      ) : (
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                          Non-recyclable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Model Confidence
                    </span>
                    <div className="text-xl font-black text-emerald-400">
                      {classification.confidence}%
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-1.5 light:bg-slate-50 light:border-slate-200">
                  <span className="font-bold text-slate-300 light:text-slate-800 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-emerald-400" /> Material & Geometry Explanation:
                  </span>
                  <p className="text-slate-300 light:text-slate-600 leading-relaxed">
                    {classification.reason}
                  </p>
                </div>

                {/* Recommended Campus Route */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs space-y-2 light:bg-emerald-50 light:border-emerald-200">
                  <span className="font-bold text-emerald-400 light:text-emerald-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> Recommended Campus Disposal Route:
                  </span>
                  <p className="text-white light:text-slate-900 font-semibold">
                    {classification.recommendedDisposal}
                  </p>
                  <p className="text-[11px] text-slate-400 light:text-slate-600">
                    Station Location: {classification.campusBinLocation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-slate-400">
                <HelpCircle className="h-8 w-8 text-slate-600 mb-2" />
                <p>Upload a waste image or select a demo sample above to initiate visual understanding.</p>
              </div>
            )}
          </div>

          {/* AI Prediction disclaimer */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 light:border-slate-200">
            *Image classification is an AI prediction. Contaminated recyclables with liquid residues should be emptied before binning according to municipal environmental regulations.
          </div>
        </div>
      </div>
    </div>
  );
};
