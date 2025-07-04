import React, { useState, useRef, useEffect, useCallback } from 'react';
// 改为按需导入图标，减少被广告拦截器识别为广告的可能性
import Upload from 'lucide-react/dist/esm/icons/upload';
import Download from 'lucide-react/dist/esm/icons/download';
import Type from 'lucide-react/dist/esm/icons/type';


import Palette from 'lucide-react/dist/esm/icons/palette';
import Grid3X3 from 'lucide-react/dist/esm/icons/grid-3x3';
import Maximize2 from 'lucide-react/dist/esm/icons/maximize-2';
import Settings from 'lucide-react/dist/esm/icons/settings';
import ImageIcon from 'lucide-react/dist/esm/icons/image';
import Languages from 'lucide-react/dist/esm/icons/languages';
import X from 'lucide-react/dist/esm/icons/x';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import Square from 'lucide-react/dist/esm/icons/square';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Plus from 'lucide-react/dist/esm/icons/plus';

// Custom hook for handling double tap on touch devices
const useDoubleTap = (callback: () => void, delay = 300) => {
  const lastTap = useRef(0);

  const handleTouchStart = () => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback();
    }
    lastTap.current = now;
  };

  return { onTouchStart: handleTouchStart };
};

const EditableNumber = ({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  label,
  toFixedValue,
}: {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label: string;
  toFixedValue?: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    let numericValue = parseFloat(currentValue);
    if (isNaN(numericValue)) {
      numericValue = value; // revert if invalid
    }
    if (min !== undefined) numericValue = Math.max(min, numericValue);
    if (max !== undefined) numericValue = Math.min(max, numericValue);
    onChange(numericValue);
    setCurrentValue(String(numericValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(String(value));
    }
  };

  return (
    <div className="flex items-center justify-between text-xs font-medium text-gray-700">
      <span>{label}</span>
      {
        isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            className="w-24 text-right border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-gray-200 px-2 py-1 rounded-md tabular-nums"
            title="点击修改"
          >
            {value.toFixed(toFixedValue ?? (step && step < 1 ? 2 : (unit === '%' || unit === '°' || unit === 'x' ? 1 : 0)))}{unit}
          </span>
        )
      }
    </div>
  );
};


interface WatermarkSettings {
  text: string;
  position: string;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
  fontFamily: string;
  offsetX: number; // 水平位移
  offsetY: number; // 垂直位移
  spacingX: number; // 水平间隔
  spacingY: number; // 垂直间隔
}

interface WatermarkPreset {
  id: string;
  name: string;
  settings: WatermarkSettings;
  createdAt: string;
}

interface AppSettings {
  language: 'zh' | 'en';
  defaultWatermark: string;
  defaultPosition: string;
  defaultSize: number;
  defaultRotation: number;
  defaultOpacity: number;
  defaultColor: string;
  defaultFontFamily: string;
  defaultOffsetX: number;
  defaultOffsetY: number;
  defaultSpacingX: number;
  defaultSpacingY: number;
  minSize: number;
  maxSize: number;
  minOpacity: number;
  maxOpacity: number;
  exportFormat: 'auto' | 'jpeg' | 'png' | 'webp';
  exportQuality: number;
  fontSizeUnit: 'px' | 'percent';
}

type Language = 'zh' | 'en';

interface Translations {
  zh: {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadSubtitle: string;
    uploadHint: string;
    watermarkText: string;
    position: string;
    style: string;
    size: string;
    rotation: string;
    opacity: string;
    color: string;
    font: string;
    fullScreenPattern: string;
    sampleWatermark: string;
    enterWatermarkText: string;
    settings: string;
    appSettings: string;
    defaultSettings: string;
    defaultWatermark: string;
    defaultPosition: string;
    defaultStyle: string;
    rangeSettings: string;
    minSize: string;
    maxSize: string;
    minOpacity: string;
    maxOpacity: string;
    offsetX: string;
    offsetY: string;
    spacingX: string;
    spacingY: string;
    save: string;
    cancel: string;
    reset: string;
    downloadImage: string;
    uploadNewImage: string;
    syncSettings: string;
    syncAllImages: string;
    selectAll: string;
    deselectAll: string;
    selectedImages: string;
    presets: string;
    savePreset: string;
    loadPreset: string;
    deletePreset: string;
    exportPresets: string;
    importPresets: string;
    presetName: string;
    enterPresetName: string;
    noPresets: string;
    confirmDelete: string;
    loadingImages: string;
    exportFormat: string;
    exportQuality: string;
    formatAuto: string;
    formatJpeg: string;
    formatPng: string;
    formatWebp: string;
    fontSizeUnit: string;
    fontSizeUnitPx: string;
    fontSizeUnitPercent: string;
    positions: {
      'top-left': string;
      'top-center': string;
      'top-right': string;
      'middle-left': string;
      'center': string;
      'middle-right': string;
      'bottom-left': string;
      'bottom-center': string;
      'bottom-right': string;
      'full-screen': string;
    };
  };
  en: {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadSubtitle: string;
    uploadHint: string;
    watermarkText: string;
    position: string;
    style: string;
    size: string;
    rotation: string;
    opacity: string;
    color: string;
    font: string;
    fullScreenPattern: string;
    sampleWatermark: string;
    enterWatermarkText: string;
    settings: string;
    appSettings: string;
    defaultSettings: string;
    defaultWatermark: string;
    defaultPosition: string;
    defaultStyle: string;
    rangeSettings: string;
    minSize: string;
    maxSize: string;
    minOpacity: string;
    maxOpacity: string;
    offsetX: string;
    offsetY: string;
    spacingX: string;
    spacingY: string;
    save: string;
    cancel: string;
    reset: string;
    downloadImage: string;
    uploadNewImage: string;
    syncSettings: string;
    syncAllImages: string;
    selectAll: string;
    deselectAll: string;
    selectedImages: string;
    presets: string;
    savePreset: string;
    loadPreset: string;
    deletePreset: string;
    exportPresets: string;
    importPresets: string;
    presetName: string;
    enterPresetName: string;
    noPresets: string;
    confirmDelete: string;
    loadingImages: string;
    exportFormat: string;
    exportQuality: string;
    formatAuto: string;
    formatJpeg: string;
    formatPng: string;
    formatWebp: string;
    fontSizeUnit: string;
    fontSizeUnitPx: string;
    fontSizeUnitPercent: string;
    positions: {
      'top-left': string;
      'top-center': string;
      'top-right': string;
      'middle-left': string;
      'center': string;
      'middle-right': string;
      'bottom-left': string;
      'bottom-center': string;
      'bottom-right': string;
      'full-screen': string;
    };
  };
}

const translations: Translations = {
  zh: {
    title: '水印大师',
    subtitle: '专业图片水印工具',
    uploadTitle: '上传您的图片',
    uploadSubtitle: '拖拽或点击选择',
    uploadHint: '支持 JPG、PNG、GIF、HEIC、HEIF',
    watermarkText: '水印文字',
    position: '位置',
    style: '样式',
    size: '大小',
    rotation: '旋转',
    opacity: '透明度',
    color: '颜色',
    font: '字体',
    fullScreenPattern: '满屏水印',
    sampleWatermark: '示例水印',
    enterWatermarkText: '输入水印文字',
    settings: '设置',
    appSettings: '应用设置',
    defaultSettings: '默认设置',
    defaultWatermark: '默认水印文字',
    defaultPosition: '默认位置',
    defaultStyle: '默认样式',
    rangeSettings: '范围设置',
    minSize: '最小字体大小',
    maxSize: '最大字体大小',
    minOpacity: '最小透明度',
    maxOpacity: '最大透明度',
    offsetX: '水平位移',
    offsetY: '垂直位移',
    spacingX: '水平间隔',
    spacingY: '垂直间隔',
    save: '保存',
    cancel: '取消',
    reset: '重置',
    downloadImage: '下载图片',
    uploadNewImage: '上传新图片',
    syncSettings: '同步设置到选中图片',
    syncAllImages: '同步设置到所有图片',
    selectAll: '全选',
    deselectAll: '取消全选',
    selectedImages: '已选择',
    presets: '预设',
    savePreset: '保存预设',
    loadPreset: '加载预设',
    deletePreset: '删除预设',
    exportPresets: '导出预设',
    importPresets: '导入预设',
    presetName: '预设名称',
    enterPresetName: '输入预设名称',
    noPresets: '暂无预设',
    confirmDelete: '确认删除此预设？',
    loadingImages: '正在加载图片...',
    exportFormat: '导出格式',
    exportQuality: '导出质量',
    formatAuto: '自动选择',
    formatJpeg: 'JPEG',
    formatPng: 'PNG',
    formatWebp: 'WebP',
    fontSizeUnit: '字体大小单位',
    fontSizeUnitPx: '像素',
    fontSizeUnitPercent: '百分比',
    positions: {
      'top-left': '左上角',
      'top-center': '顶部居中',
      'top-right': '右上角',
      'middle-left': '左侧居中',
      'center': '居中',
      'middle-right': '右侧居中',
      'bottom-left': '左下角',
      'bottom-center': '底部居中',
      'bottom-right': '右下角',
      'full-screen': '满屏水印'
    }
  },
  en: {
    title: 'Watermark Pro',
    subtitle: 'Professional Image Watermarking Tool',
    uploadTitle: 'Upload Your Images',
    uploadSubtitle: 'Drag & Drop or Click to Select',
    uploadHint: 'Supports JPG, PNG, GIF, HEIC, HEIF',
    watermarkText: 'Watermark Text',
    position: 'Position',
    style: 'Style',
    size: 'Size',
    rotation: 'Rotation',
    opacity: 'Opacity',
    color: 'Color',
    font: 'Font',
    fullScreenPattern: 'Full Screen Pattern',
    sampleWatermark: 'Sample Watermark',
    enterWatermarkText: 'Enter watermark text',
    settings: 'Settings',
    appSettings: 'Application Settings',
    defaultSettings: 'Default Settings',
    defaultWatermark: 'Default Watermark Text',
    defaultPosition: 'Default Position',
    defaultStyle: 'Default Style',
    rangeSettings: 'Range Settings',
    minSize: 'Min Font Size',
    maxSize: 'Max Font Size',
    minOpacity: 'Min Opacity',
    maxOpacity: 'Max Opacity',
    offsetX: 'Horizontal Offset',
    offsetY: 'Vertical Offset',
    spacingX: 'Horizontal Spacing',
    spacingY: 'Vertical Spacing',
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Reset',
    downloadImage: 'Download Image',
    uploadNewImage: 'Upload New Image',
    syncSettings: 'Sync Settings to Selected',
    syncAllImages: 'Sync Settings to All Images',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selectedImages: 'Selected',
    presets: 'Presets',
    savePreset: 'Save Preset',
    loadPreset: 'Load Preset',
    deletePreset: 'Delete Preset',
    exportPresets: 'Export Presets',
    importPresets: 'Import Presets',
    presetName: 'Preset Name',
    enterPresetName: 'Enter preset name',
    noPresets: 'No presets available',
    confirmDelete: 'Confirm delete this preset?',
    loadingImages: 'Loading images...',
    exportFormat: 'Export Format',
    exportQuality: 'Export Quality',
    formatAuto: 'Auto Select',
    formatJpeg: 'JPEG',
    formatPng: 'PNG',
    formatWebp: 'WebP',
    fontSizeUnit: 'Font Size Unit',
    fontSizeUnitPx: 'Pixels',
    fontSizeUnitPercent: 'Percentage',
    positions: {
      'top-left': 'Top Left',
      'top-center': 'Top Center',
      'top-right': 'Top Right',
      'middle-left': 'Middle Left',
      'center': 'Center',
      'middle-right': 'Middle Right',
      'bottom-left': 'Bottom Left',
      'bottom-center': 'Bottom Center',
      'bottom-right': 'Bottom Right',
      'full-screen': 'Full Screen'
    }
  }
};

const defaultAppSettings: AppSettings = {
  language: 'zh',
  defaultWatermark: '示例水印',
  defaultPosition: 'center',
  defaultSize: 10,
  defaultRotation: 0,
  defaultOpacity: 0.7,
  defaultColor: '#ffffff',
  defaultFontFamily: 'Arial',
  defaultOffsetX: 0,
  defaultOffsetY: 0,
  defaultSpacingX: 100,
  defaultSpacingY: 100,
  minSize: 1,
  maxSize: 100,
  minOpacity: 0.1,
  maxOpacity: 1.0,
  exportFormat: 'auto',
  exportQuality: 0.95,
  fontSizeUnit: 'percent'
};

interface ImageData {
  id: string;
  file: File;
  url: string;
  image: HTMLImageElement;
  watermarkSettings: WatermarkSettings;
  canvas?: HTMLCanvasElement;
  originalFile?: File; // 保存原始文件引用（用于HEIC转换后的EXIF处理）
}

function App() {
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSettings, setTempSettings] = useState<AppSettings>(defaultAppSettings);
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalClosing, setImageModalClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmSync, setShowConfirmSync] = useState(false);
  const [localFonts, setLocalFonts] = useState<Array<{family: string, fullName: string}>>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [fontPermissionGranted, setFontPermissionGranted] = useState(false);
  const [presets, setPresets] = useState<WatermarkPreset[]>([]);
  const [presetsLoaded, setPresetsLoaded] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, show: boolean, isClosing: boolean}>({x: 0, y: 0, show: false, isClosing: false});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const offsetXDoubleTap = useDoubleTap(() => updateSetting('offsetX', appSettings.defaultOffsetX));
  const offsetYDoubleTap = useDoubleTap(() => updateSetting('offsetY', appSettings.defaultOffsetY));
  const spacingXDoubleTap = useDoubleTap(() => updateSetting('spacingX', appSettings.defaultSpacingX));
  const spacingYDoubleTap = useDoubleTap(() => updateSetting('spacingY', appSettings.defaultSpacingY));
  const sizeDoubleTap = useDoubleTap(() => updateSetting('size', appSettings.defaultSize));
  const rotationDoubleTap = useDoubleTap(() => updateSetting('rotation', appSettings.defaultRotation));
  const opacityDoubleTap = useDoubleTap(() => updateSetting('opacity', appSettings.defaultOpacity));
  
  // Stable watermark settings that don't change based on image dimensions
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: appSettings.defaultWatermark,
    position: appSettings.defaultPosition,
    size: appSettings.defaultSize,
    rotation: appSettings.defaultRotation,
    opacity: appSettings.defaultOpacity,
    color: appSettings.defaultColor,
    fontFamily: appSettings.defaultFontFamily,
    offsetX: appSettings.defaultOffsetX,
    offsetY: appSettings.defaultOffsetY,
    spacingX: appSettings.defaultSpacingX,
    spacingY: appSettings.defaultSpacingY
  });

  const t = translations[appSettings.language];
  const currentImage = images[currentImageIndex];

  // Update document title based on current language
  useEffect(() => {
    document.title = t.title;
  }, [t.title]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault();
            // Save selected images (batch download)
            if (selectedImageIds.size > 0) {
              handleBatchDownload();
            } else if (currentImage) {
              // If no selection, save current image
              handleDownload();
            }
            break;
          case 'a':
            event.preventDefault();
            // Select all or deselect all
            handleSelectAll();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIds, currentImage]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('watermark-app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAppSettings(parsed);
        setTempSettings(parsed);
        
        // Update watermark settings with loaded defaults
        setWatermarkSettings({
          text: parsed.defaultWatermark,
          position: parsed.defaultPosition,
          size: parsed.defaultSize,
          rotation: parsed.defaultRotation,
          opacity: parsed.defaultOpacity,
          color: parsed.defaultColor,
          fontFamily: parsed.defaultFontFamily,
          offsetX: parsed.defaultOffsetX || 0,
          offsetY: parsed.defaultOffsetY || 0,
          spacingX: parsed.defaultSpacingX || 2,
          spacingY: parsed.defaultSpacingY || 4
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    
    // Load presets from localStorage
    const savedPresets = localStorage.getItem('watermark-presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        console.log('Loading presets from localStorage:', parsed);
        setPresets(parsed);
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    }
    setPresetsLoaded(true);
  }, []);

  // Save settings to localStorage whenever appSettings changes
  useEffect(() => {
    localStorage.setItem('watermark-app-settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Save presets to localStorage whenever presets change (only after initial load)
  useEffect(() => {
    if (presetsLoaded) {
      console.log('Saving presets to localStorage:', presets);
      localStorage.setItem('watermark-presets', JSON.stringify(presets));
    }
  }, [presets, presetsLoaded]);

  // Preset management functions
  const savePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset: WatermarkPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: presetName.trim(),
      settings: { ...watermarkSettings },
      createdAt: new Date().toISOString()
    };
    
    setPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setShowPresetModal(false);
  };

  const loadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setWatermarkSettings({ ...preset.settings });
      setSelectedPresetId(presetId);
    }
  };

  const deletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    if (selectedPresetId === presetId) {
      setSelectedPresetId('');
    }
  };

  const exportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `watermark-presets-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedPresets)) {
          // Add imported presets with new IDs to avoid conflicts
          const newPresets = importedPresets.map(preset => ({
            ...preset,
            id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString()
          }));
          setPresets(prev => [...prev, ...newPresets]);
        }
      } catch (error) {
        console.error('Failed to import presets:', error);
        alert('导入预设失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Load local fonts using Local Font Access API
  const loadLocalFonts = async () => {
    if (!('queryLocalFonts' in window)) {
      console.log('Local Font Access API not supported');
      return;
    }

    try {
      setFontsLoading(true);
      const availableFonts = await (window as any).queryLocalFonts();
      
      // Create a map to deduplicate fonts by family name
      const fontMap = new Map<string, {family: string, fullName: string}>();
      
      availableFonts.forEach((font: any) => {
        if (font.family && !fontMap.has(font.family)) {
          fontMap.set(font.family, {
            family: font.family,
            fullName: font.fullName || font.family
          });
        }
      });
      
      // Convert map to array and sort by family name
      const uniqueFonts = Array.from(fontMap.values()).sort((a, b) => 
        a.family.localeCompare(b.family)
      );
      
      setLocalFonts(uniqueFonts);
      setFontPermissionGranted(true);
      console.log(`Loaded ${uniqueFonts.length} local fonts`);
    } catch (error) {
      console.error('Failed to load local fonts:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.log('User denied permission to access local fonts');
      }
    } finally {
      setFontsLoading(false);
    }
  };

  const positions = [
    { id: 'top-left', label: t.positions['top-left'], icon: '↖' },
    { id: 'top-center', label: t.positions['top-center'], icon: '↑' },
    { id: 'top-right', label: t.positions['top-right'], icon: '↗' },
    { id: 'middle-left', label: t.positions['middle-left'], icon: '←' },
    { id: 'center', label: t.positions['center'], icon: '●' },
    { id: 'middle-right', label: t.positions['middle-right'], icon: '→' },
    { id: 'bottom-left', label: t.positions['bottom-left'], icon: '↙' },
    { id: 'bottom-center', label: t.positions['bottom-center'], icon: '↓' },
    { id: 'bottom-right', label: t.positions['bottom-right'], icon: '↘' },
    { id: 'full-screen', label: t.positions['full-screen'], icon: '⊞' },
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    
    try {
      const newImages: ImageData[] = [];
      
      for (const file of files) {
        let processedFile = file;
        let url = URL.createObjectURL(file);
        
        // 检查是否为HEIC/HEIF格式
        const isHeicFormat = file.type === 'image/heic' || 
                            file.type === 'image/heif' || 
                            file.name.toLowerCase().endsWith('.heic') || 
                            file.name.toLowerCase().endsWith('.heif');
        
        if (isHeicFormat) {
          try {
            // 动态导入heic2any库
            const heic2any = await import('heic2any');
            
            // 转换HEIC/HEIF为JPEG
            const convertedBlob = await heic2any.default({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.95
            }) as Blob;
            
            // 创建新的File对象
            processedFile = new File([convertedBlob], 
              file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
              { type: 'image/jpeg' }
            );
            
            // 释放原始URL并创建新的URL
            URL.revokeObjectURL(url);
            url = URL.createObjectURL(processedFile);
            
            console.log(`Converted HEIC/HEIF file: ${file.name} to JPEG`);
          } catch (conversionError) {
            console.error('Failed to convert HEIC/HEIF file:', conversionError);
            // 如果转换失败，尝试直接使用原文件
            console.log('Attempting to use original HEIC/HEIF file directly');
          }
        }
        
        const img = new Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${processedFile.name}`));
          img.src = url;
        });

        const imageData: ImageData = {
          id: `${Date.now()}-${Math.random()}`,
          file: processedFile,
          url,
          image: img,
          watermarkSettings: { ...watermarkSettings },
          originalFile: isHeicFormat ? file : undefined // 保存原始HEIC文件引用
        };
        
        newImages.push(imageData);
      }

      setImages(prev => [...prev, ...newImages]);
      
      // If this is the first upload, set current image
      if (images.length === 0) {
        setCurrentImageIndex(0);
      }
      
      // Add fade-in animation delay
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
    } catch (error) {
      console.error('Error loading images:', error);
      setIsLoading(false);
    }
  };

  // 优化的水印绘制函数，提高渲染性能
  const drawWatermark = useCallback(() => {
    if (!currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true }); // 支持透明通道
    if (!ctx) return;

    const { image } = currentImage;
    // 使用 latestSettingsRef 获取最新设置，避免状态更新延迟
    const settings = latestSettingsRef.current;

    // 获取预览容器的尺寸 - 查找最外层的预览容器
    let container = canvas.parentElement;
    while (container && !container.classList.contains('bg-white')) {
      container = container.parentElement;
    }
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    // 减去一些padding，确保有足够的边距
    const containerWidth = Math.max(200, containerRect.width - 40);
    const containerHeight = Math.max(200, containerRect.height - 40);
    
    // 计算图片的缩放比例以完整铺满容器
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const scale = Math.min(scaleX, scaleY, 1); // 保持宽高比，但不超过原始尺寸
    
    // 计算缩放后的尺寸，确保最小尺寸
    const scaledWidth = Math.max(100, image.width * scale);
    const scaledHeight = Math.max(100, image.height * scale);
    
    // 设置canvas的显示尺寸
    canvas.style.width = `${scaledWidth}px`;
    canvas.style.height = `${scaledHeight}px`;
    
    // 只有在画布尺寸变化时才重设尺寸，避免不必要的重绘
    if (canvas.width !== image.width || canvas.height !== image.height) {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    // 清除画布并绘制原始图像，保留透明通道
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // 计算稳定的字体大小 - 根据单位类型计算
    const baseFontSize = settings.size;
    let actualFontSize: number;
    
    if (appSettings.fontSizeUnit === 'percent') {
      // 百分比模式：基于文本宽度与图片宽度的比例
      const tempFont = `10px ${settings.fontFamily}`;
      ctx.font = tempFont;
      const textMetrics = ctx.measureText(settings.text.split('\n')[0] || ' ');
      const initialWidth = textMetrics.width;
      const scaleRatio = image.width / initialWidth;
      actualFontSize = 10 * scaleRatio * (baseFontSize / 100);
      actualFontSize = Math.max(8, actualFontSize);
    } else {
      // 像素模式：直接使用像素值
      actualFontSize = Math.max(8, Math.min(200, baseFontSize));
    }

    // Set watermark style with stable values
    ctx.font = `${actualFontSize}px ${settings.fontFamily}`;
    ctx.fillStyle = settings.color;
    ctx.globalAlpha = settings.opacity;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    // 处理多行文字
    const lines = settings.text.split('\n');
    const lineHeight = actualFontSize * 1.2; // 行高为字体大小的1.2倍
    
    // 计算所有行的最大宽度和总高度
    let maxTextWidth = 0;
    const lineWidths: number[] = [];
    
    lines.forEach(line => {
      const textMetrics = ctx.measureText(line);
      const lineWidth = textMetrics.width;
      lineWidths.push(lineWidth);
      maxTextWidth = Math.max(maxTextWidth, lineWidth);
    });
    
    const totalTextHeight = lines.length * lineHeight;

    if (settings.position === 'full-screen') {
      // Full screen watermark pattern with stable spacing
      // Spacing is now a multiplier of the watermark's dimensions
      const spacingX = maxTextWidth + settings.spacingX;
      const spacingY = totalTextHeight + settings.spacingY;

      // Calculate offsets as a percentage of the canvas size
      const offsetX = (settings.offsetX / 100) * canvas.width;
      const offsetY = (settings.offsetY / 100) * canvas.height;

      // Calculate grid bounds
      const cols = Math.ceil(canvas.width / spacingX) + 2;
      const rows = Math.floor(canvas.height / spacingY) + 2;
      
      // Draw watermark grid with consistent positioning and apply offsets
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * spacingX - spacingX / 2 + offsetX;
          const baseY = row * spacingY + totalTextHeight / 2 + offsetY;
          
          ctx.save();
          ctx.translate(baseX + maxTextWidth / 2, baseY);
          ctx.rotate((settings.rotation * Math.PI) / 180);
          
          // 绘制每一行
          lines.forEach((line, lineIndex) => {
            const lineY = (lineIndex - (lines.length - 1) / 2) * lineHeight;
            const lineWidth = lineWidths[lineIndex];
            ctx.fillText(line, -lineWidth / 2, lineY);
          });
          
          ctx.restore();
        }
      }
    } else {
      // Single watermark with stable positioning
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate the bounding box of the rotated watermark
      const angle = (settings.rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(angle));
      const cos = Math.abs(Math.cos(angle));
      const rotatedWidth = maxTextWidth * cos + totalTextHeight * sin;
      const rotatedHeight = maxTextWidth * sin + totalTextHeight * cos;

      // Calculate the safe area for the center of the watermark
      const safeWidth = canvas.width - rotatedWidth;
      const safeHeight = canvas.height - rotatedHeight;

      // Calculate position based on percentage offsets within the safe area
      const offsetX = (settings.offsetX / 100) * (safeWidth / 2);
      const offsetY = (settings.offsetY / 100) * (safeHeight / 2);

      // Clamp the final position to ensure the watermark is fully visible
      const x = centerX + offsetX;
      const y = centerY - offsetY;

      const clampedX = Math.max(rotatedWidth / 2, Math.min(x, canvas.width - rotatedWidth / 2));
      const clampedY = Math.max(rotatedHeight / 2, Math.min(y, canvas.height - rotatedHeight / 2));

      // Draw single watermark with multiple lines
      ctx.save();
      // Translate to the calculated position, then adjust for text alignment
      ctx.translate(clampedX, clampedY);
      ctx.rotate((settings.rotation * Math.PI) / 180);
      
      // 绘制每一行，以文本块的中心为原点
      lines.forEach((line, lineIndex) => {
        const lineY = (lineIndex - (lines.length - 1) / 2) * lineHeight;
        const lineWidth = lineWidths[lineIndex];
        // Adjust for textAlign = 'left' by offsetting by half width
        ctx.fillText(line, -lineWidth / 2, lineY);
      });
      
      ctx.restore();
    }

    // Reset global alpha
    ctx.globalAlpha = 1;
  }, [currentImage, watermarkSettings]);

  // 使用 requestAnimationFrame 优化渲染性能
  useEffect(() => {
    // 使用 requestAnimationFrame 代替 setTimeout 获得更好的渲染性能
    let rafId = requestAnimationFrame(drawWatermark);
    
    return () => {
      // 清理函数
      cancelAnimationFrame(rafId);
    };
  }, [drawWatermark]);

  // 监听窗口大小变化，重新调整图片显示尺寸
  useEffect(() => {
    let resizeTimeout: number;
    
    const handleResize = () => {
      // 清除之前的定时器，实现防抖
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        drawWatermark();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [drawWatermark]);

  // 监听图片切换，确保新图片正确显示
  useEffect(() => {
    if (currentImage) {
      // 图片切换时稍微延迟执行，确保DOM更新完成
      const timeout = setTimeout(() => {
        drawWatermark();
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [currentImage, drawWatermark]);

  const handleDownload = async () => {
    if (!canvasRef.current || !currentImage) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    
    // 检测原始图片是否有透明通道
    const hasAlpha = currentImage.file.type === 'image/png' || 
                     currentImage.file.type === 'image/webp' ||
                     currentImage.file.type === 'image/gif' ||
                     currentImage.file.type === 'image/heic' ||
                     currentImage.file.type === 'image/heif';
    
    // 根据用户设置选择导出格式
    let outputFormat: string;
    let fileExtension: string;
    let quality: number | undefined;
    
    if (appSettings.exportFormat === 'auto') {
      // 自动选择：有透明通道用PNG，否则用JPEG
      outputFormat = hasAlpha ? 'image/png' : 'image/jpeg';
      fileExtension = hasAlpha ? '.png' : '.jpg';
      quality = hasAlpha ? undefined : appSettings.exportQuality;
    } else {
      // 用户指定格式
      switch (appSettings.exportFormat) {
        case 'png':
          outputFormat = 'image/png';
          fileExtension = '.png';
          quality = undefined; // PNG不需要质量参数
          break;
        case 'webp':
          outputFormat = 'image/webp';
          fileExtension = '.webp';
          quality = appSettings.exportQuality;
          break;
        case 'jpeg':
        default:
          outputFormat = 'image/jpeg';
          fileExtension = '.jpg';
          quality = appSettings.exportQuality;
          break;
      }
    }
    
    // 获取canvas的base64数据
    let dataURL = canvas.toDataURL(outputFormat, quality);
    
    // 如果导出格式是JPEG，尝试保留原始图片的EXIF信息
    if (outputFormat === 'image/jpeg') {
      try {
        // 优先使用原始文件（HEIC转换前的文件），如果不存在则使用当前文件
        const sourceFile = currentImage.originalFile || currentImage.file;
        
        // 检查是否为HEIC格式
        const isHeicFormat = sourceFile.type === 'image/heic' || 
                            sourceFile.type === 'image/heif' || 
                            sourceFile.name.toLowerCase().endsWith('.heic') || 
                            sourceFile.name.toLowerCase().endsWith('.heif');
        
        let exifData: any;
        
        if (isHeicFormat) {
          // 使用exifreader处理HEIC文件的EXIF信息
          console.log('检测到HEIC格式，使用exifreader提取EXIF信息...');
          const ExifReader = await import('exifreader');
          
          // 读取文件为ArrayBuffer
          const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(sourceFile);
          });
          
          // 使用exifreader解析HEIC文件的EXIF信息
          const tags = ExifReader.default.load(arrayBuffer);
          
          if (tags && Object.keys(tags).length > 0) {
            // 转换exifreader格式到piexifjs格式
            exifData = {
              '0th': {},
              'Exif': {},
              'GPS': {},
              '1st': {}
            };
            
            // 扩展的EXIF标签映射表
            const tagMapping: { [key: string]: { ifd: string; tag: number } } = {
              // 0th IFD (主图像信息)
              'Make': { ifd: '0th', tag: 271 },
              'Model': { ifd: '0th', tag: 272 },
              'Orientation': { ifd: '0th', tag: 274 },
              'XResolution': { ifd: '0th', tag: 282 },
              'YResolution': { ifd: '0th', tag: 283 },
              'ResolutionUnit': { ifd: '0th', tag: 296 },
              'Software': { ifd: '0th', tag: 305 },
              'DateTime': { ifd: '0th', tag: 306 },
              'Artist': { ifd: '0th', tag: 315 },
              'WhitePoint': { ifd: '0th', tag: 318 },
              'PrimaryChromaticities': { ifd: '0th', tag: 319 },
              'YCbCrCoefficients': { ifd: '0th', tag: 529 },
              'YCbCrPositioning': { ifd: '0th', tag: 531 },
              'ReferenceBlackWhite': { ifd: '0th', tag: 532 },
              'Copyright': { ifd: '0th', tag: 33432 },
              
              // Exif IFD (拍摄参数)
              'ExposureTime': { ifd: 'Exif', tag: 33434 },
              'FNumber': { ifd: 'Exif', tag: 33437 },
              'ExposureProgram': { ifd: 'Exif', tag: 34850 },
              'SpectralSensitivity': { ifd: 'Exif', tag: 34852 },
              'ISO': { ifd: 'Exif', tag: 34855 },
              'ISOSpeedRatings': { ifd: 'Exif', tag: 34855 },
              'OECF': { ifd: 'Exif', tag: 34856 },
              'SensitivityType': { ifd: 'Exif', tag: 34864 },
              'ExifVersion': { ifd: 'Exif', tag: 36864 },
              'DateTimeOriginal': { ifd: 'Exif', tag: 36867 },
              'DateTimeDigitized': { ifd: 'Exif', tag: 36868 },
              'OffsetTime': { ifd: 'Exif', tag: 36880 },
              'OffsetTimeOriginal': { ifd: 'Exif', tag: 36881 },
              'OffsetTimeDigitized': { ifd: 'Exif', tag: 36882 },
              'ComponentsConfiguration': { ifd: 'Exif', tag: 37121 },
              'CompressedBitsPerPixel': { ifd: 'Exif', tag: 37122 },
              'ShutterSpeedValue': { ifd: 'Exif', tag: 37377 },
              'ApertureValue': { ifd: 'Exif', tag: 37378 },
              'BrightnessValue': { ifd: 'Exif', tag: 37379 },
              'ExposureBiasValue': { ifd: 'Exif', tag: 37380 },
              'MaxApertureValue': { ifd: 'Exif', tag: 37381 },
              'SubjectDistance': { ifd: 'Exif', tag: 37382 },
              'MeteringMode': { ifd: 'Exif', tag: 37383 },
              'LightSource': { ifd: 'Exif', tag: 37384 },
              'Flash': { ifd: 'Exif', tag: 37385 },
              'FocalLength': { ifd: 'Exif', tag: 37386 },
              'SubjectArea': { ifd: 'Exif', tag: 37396 },
              'MakerNote': { ifd: 'Exif', tag: 37500 },
              'UserComment': { ifd: 'Exif', tag: 37510 },
              'SubSecTime': { ifd: 'Exif', tag: 37520 },
              'SubSecTimeOriginal': { ifd: 'Exif', tag: 37521 },
              'SubSecTimeDigitized': { ifd: 'Exif', tag: 37522 },
              'FlashpixVersion': { ifd: 'Exif', tag: 40960 },
              'ColorSpace': { ifd: 'Exif', tag: 40961 },
              'PixelXDimension': { ifd: 'Exif', tag: 40962 },
              'PixelYDimension': { ifd: 'Exif', tag: 40963 },
              'RelatedSoundFile': { ifd: 'Exif', tag: 40964 },
              'FlashEnergy': { ifd: 'Exif', tag: 41483 },
              'SpatialFrequencyResponse': { ifd: 'Exif', tag: 41484 },
              'FocalPlaneXResolution': { ifd: 'Exif', tag: 41486 },
              'FocalPlaneYResolution': { ifd: 'Exif', tag: 41487 },
              'FocalPlaneResolutionUnit': { ifd: 'Exif', tag: 41488 },
              'SubjectLocation': { ifd: 'Exif', tag: 41492 },
              'ExposureIndex': { ifd: 'Exif', tag: 41493 },
              'SensingMethod': { ifd: 'Exif', tag: 41495 },
              'FileSource': { ifd: 'Exif', tag: 41728 },
              'SceneType': { ifd: 'Exif', tag: 41729 },
              'CFAPattern': { ifd: 'Exif', tag: 41730 },
              'CustomRendered': { ifd: 'Exif', tag: 41985 },
              'ExposureMode': { ifd: 'Exif', tag: 41986 },
              'WhiteBalance': { ifd: 'Exif', tag: 41987 },
              'DigitalZoomRatio': { ifd: 'Exif', tag: 41988 },
              'FocalLengthIn35mmFilm': { ifd: 'Exif', tag: 41989 },
              'SceneCaptureType': { ifd: 'Exif', tag: 41990 },
              'GainControl': { ifd: 'Exif', tag: 41991 },
              'Contrast': { ifd: 'Exif', tag: 41992 },
              'Saturation': { ifd: 'Exif', tag: 41993 },
              'Sharpness': { ifd: 'Exif', tag: 41994 },
              'DeviceSettingDescription': { ifd: 'Exif', tag: 41995 },
              'SubjectDistanceRange': { ifd: 'Exif', tag: 41996 },
              'ImageUniqueID': { ifd: 'Exif', tag: 42016 },
              'CameraOwnerName': { ifd: 'Exif', tag: 42032 },
              'BodySerialNumber': { ifd: 'Exif', tag: 42033 },
              'LensSpecification': { ifd: 'Exif', tag: 42034 },
              'LensMake': { ifd: 'Exif', tag: 42035 },
              'LensModel': { ifd: 'Exif', tag: 42036 },
              'LensSerialNumber': { ifd: 'Exif', tag: 42037 },
              
              // GPS IFD (位置信息)
              'GPSVersionID': { ifd: 'GPS', tag: 0 },
              'GPSLatitudeRef': { ifd: 'GPS', tag: 1 },
              'GPSLatitude': { ifd: 'GPS', tag: 2 },
              'GPSLongitudeRef': { ifd: 'GPS', tag: 3 },
              'GPSLongitude': { ifd: 'GPS', tag: 4 },
              'GPSAltitudeRef': { ifd: 'GPS', tag: 5 },
              'GPSAltitude': { ifd: 'GPS', tag: 6 },
              'GPSTimeStamp': { ifd: 'GPS', tag: 7 },
              'GPSSatellites': { ifd: 'GPS', tag: 8 },
              'GPSStatus': { ifd: 'GPS', tag: 9 },
              'GPSMeasureMode': { ifd: 'GPS', tag: 10 },
              'GPSDOP': { ifd: 'GPS', tag: 11 },
              'GPSSpeedRef': { ifd: 'GPS', tag: 12 },
              'GPSSpeed': { ifd: 'GPS', tag: 13 },
              'GPSTrackRef': { ifd: 'GPS', tag: 14 },
              'GPSTrack': { ifd: 'GPS', tag: 15 },
              'GPSImgDirectionRef': { ifd: 'GPS', tag: 16 },
              'GPSImgDirection': { ifd: 'GPS', tag: 17 },
              'GPSMapDatum': { ifd: 'GPS', tag: 18 },
              'GPSDestLatitudeRef': { ifd: 'GPS', tag: 19 },
              'GPSDestLatitude': { ifd: 'GPS', tag: 20 },
              'GPSDestLongitudeRef': { ifd: 'GPS', tag: 21 },
              'GPSDestLongitude': { ifd: 'GPS', tag: 22 },
              'GPSDestBearingRef': { ifd: 'GPS', tag: 23 },
              'GPSDestBearing': { ifd: 'GPS', tag: 24 },
              'GPSDestDistanceRef': { ifd: 'GPS', tag: 25 },
              'GPSDestDistance': { ifd: 'GPS', tag: 26 },
              'GPSProcessingMethod': { ifd: 'GPS', tag: 27 },
              'GPSAreaInformation': { ifd: 'GPS', tag: 28 },
              'GPSDateStamp': { ifd: 'GPS', tag: 29 },
              'GPSDifferential': { ifd: 'GPS', tag: 30 },
              'GPSHPositioningError': { ifd: 'GPS', tag: 31 }
            };
            
            // 转换标签，支持更复杂的数据类型处理
            Object.keys(tags).forEach(tagName => {
              const mapping = tagMapping[tagName];
              if (mapping && tags[tagName] && tags[tagName].value !== undefined) {
                let value = tags[tagName].value;
                
                // 处理特殊的数据类型
                if (Array.isArray(value)) {
                  // 对于数组类型，保持原样或转换为适当格式
                  if (tagName === 'GPSLatitude' || tagName === 'GPSLongitude') {
                              // GPS坐标需要特殊处理
                              value = value.map((v: any) => {
                                if (typeof v === 'object' && v && 'numerator' in v && 'denominator' in v) {
                                  return [v.numerator, v.denominator];
                                }
                                return v;
                              }) as any;
                  } else {
                    // 对于其他数组类型，转换为字符串
                    value = value.join(', ') as any;
                  }
                } else if (typeof value === 'object' && value && 'numerator' in value && 'denominator' in value) {
                            // 处理分数类型（如曝光时间、光圈值等）
                            value = [(value as any).numerator, (value as any).denominator] as any;
                } else if (typeof value === 'string' && value.length > 100) {
                  // 对于过长的字符串（如MakerNote），截断以避免问题
                  value = value.substring(0, 100);
                }
                
                exifData[mapping.ifd][mapping.tag] = value;
              }
            });
            
            // 记录映射的标签数量
            const mappedCount = Object.keys(tags).filter(tagName => tagMapping[tagName]).length;
            console.log(`成功从HEIC文件提取EXIF信息: 总共${Object.keys(tags).length}个标签，映射了${mappedCount}个标签`);
            
            // 输出未映射的标签以便调试
            const unmappedTags = Object.keys(tags).filter(tagName => !tagMapping[tagName]);
            if (unmappedTags.length > 0) {
              console.log('未映射的EXIF标签:', unmappedTags.slice(0, 10)); // 只显示前10个
            }
            
            
          }
        } else {
          // 使用piexifjs处理JPEG文件的EXIF信息
          const piexif = await import('piexifjs');
          
          const originalImageData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result as ArrayBuffer;
              const uint8Array = new Uint8Array(arrayBuffer);
              const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
              resolve(btoa(binaryString));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(sourceFile);
          });
          
          try {
            exifData = piexif.default.load('data:image/jpeg;base64,' + originalImageData);
            console.log('成功从JPEG文件提取EXIF信息');
          } catch (exifError) {
            console.log('原始图片没有EXIF信息或格式不支持:', exifError);
          }
        }
        
        // 如果成功提取到EXIF信息，将其插入到新图片中
        if (exifData && Object.keys(exifData).length > 0) {
          const piexif = await import('piexifjs');
          
          // 移除可能导致问题的缩略图数据
          if (exifData['thumbnail']) {
            delete exifData['thumbnail'];
          }
          
          // 更新图片尺寸信息
          if (exifData['Exif']) {
            exifData['Exif'][piexif.default.ExifIFD.PixelXDimension] = canvas.width;
            exifData['Exif'][piexif.default.ExifIFD.PixelYDimension] = canvas.height;
          }
          
          // 将EXIF信息插入到新图片中
          const exifBytes = piexif.default.dump(exifData);
          dataURL = piexif.default.insert(exifBytes, dataURL);
          
          console.log('成功保留EXIF信息到导出图片');
        }
      } catch (error) {
        console.error('处理EXIF信息时出错:', error);
        // 如果处理EXIF失败，继续使用原始dataURL
      }
    }
    
    link.download = `watermarked-${currentImage.file.name.replace(/\.[^/.]+$/, fileExtension)}`;
    link.href = dataURL;
    link.click();
  };

  // 使用 useRef 跟踪最新的设置值，避免频繁的状态更新
  const latestSettingsRef = useRef(watermarkSettings);
  
  // 优化的设置更新函数，特别针对拖动调整的场景
  const updateSetting = (key: keyof WatermarkSettings, value: string | number) => {
    if (key === 'position' && value === 'full-screen') {
      setWatermarkSettings(prev => ({
        ...prev,
        position: 'full-screen',
        rotation: -30,
      }));
      return;
    }
    let newSettings = { ...latestSettingsRef.current, [key]: value };

    // 当位置变化时，自动更新位移
    if (key === 'position') {
      const position = value as string;
      let offsetX = 0;
      let offsetY = 0;

      // Set horizontal offset
      if (position.includes('left')) {
        offsetX = -100;
      } else if (position.includes('right')) {
        offsetX = 100;
      } else {
        offsetX = 0;
      }

      // Set vertical offset
      if (position.includes('top')) {
        offsetY = 100;
      } else if (position.includes('bottom')) {
        offsetY = -100;
      } else {
        offsetY = 0;
      }

      newSettings = { ...newSettings, offsetX, offsetY };
    }

    // 更新最新设置的引用
    latestSettingsRef.current = newSettings;
    
    // 使用 requestAnimationFrame 优化 UI 更新
    requestAnimationFrame(() => {
      setWatermarkSettings(newSettings);
      
      // 更新当前图片设置
      if (currentImage) {
        setImages(prev => prev.map(img => 
          img.id === currentImage.id 
            ? { ...img, watermarkSettings: newSettings }
            : img
        ));
      }
    });
  };
  
  // 同步 latestSettingsRef 和 watermarkSettings
  useEffect(() => {
    latestSettingsRef.current = watermarkSettings;
  }, [watermarkSettings]);

  const handleImageSelect = (index: number, event?: React.MouseEvent) => {
    if (event?.ctrlKey || event?.metaKey) {
      // Ctrl+click for multi-select
      const imageId = images[index].id;
      setSelectedImageIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(imageId)) {
          newSet.delete(imageId);
        } else {
          newSet.add(imageId);
        }
        return newSet;
      });
      setLastClickedIndex(index);
    } else if (event?.shiftKey && lastClickedIndex !== -1) {
      // Shift+click for range select
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = images.slice(start, end + 1).map(img => img.id);
      setSelectedImageIds(new Set(rangeIds));
      // 不更新lastClickedIndex，保持原来的起始点
    } else {
      // Regular click - switch image and update settings
      setCurrentImageIndex(index);
      setWatermarkSettings(images[index].watermarkSettings);
      setSelectedImageIds(new Set()); // 清除多选状态
      setLastClickedIndex(index);
    }
  };

  const handleSyncSettings = () => {
    if (selectedImageIds.size === 0) return;
    
    setImages(prev => prev.map(img => 
      selectedImageIds.has(img.id)
        ? { ...img, watermarkSettings: { ...watermarkSettings } }
        : img
    ));
  };

  // 同步设置到所有图片的处理函数

  const confirmSyncAll = () => {
    setImages(prev => prev.map(img => ({
      ...img,
      watermarkSettings: { ...watermarkSettings }
    })));
    setShowConfirmSync(false);
  };

  const handleSelectAll = () => {
    if (selectedImageIds.size === images.length) {
      setSelectedImageIds(new Set());
    } else {
      setSelectedImageIds(new Set(images.map(img => img.id)));
    }
  };

  const handleSaveSettings = () => {
    setAppSettings(tempSettings);
    setShowSettingsModal(false);
    
    // Update current watermark settings if they match defaults
    if (watermarkSettings.text === appSettings.defaultWatermark) {
      setWatermarkSettings(prev => ({ ...prev, text: tempSettings.defaultWatermark }));
    }
  };

  const handleCancelSettings = () => {
    setTempSettings(appSettings);
    setShowSettingsModal(false);
  };

  const handleResetSettings = () => {
    setTempSettings(defaultAppSettings);
  };

  const resetToDefaults = () => {
    const newSettings = {
      text: appSettings.defaultWatermark,
      position: appSettings.defaultPosition,
      size: appSettings.defaultSize,
      rotation: appSettings.defaultRotation,
      opacity: appSettings.defaultOpacity,
      color: appSettings.defaultColor,
      fontFamily: appSettings.defaultFontFamily,
      offsetX: appSettings.defaultOffsetX,
      offsetY: appSettings.defaultOffsetY,
      spacingX: appSettings.defaultSpacingX,
      spacingY: appSettings.defaultSpacingY
    };
    
    setWatermarkSettings(newSettings);
    
    // Update current image settings
    if (currentImage) {
      setImages(prev => prev.map(img => 
        img.id === currentImage.id 
          ? { ...img, watermarkSettings: newSettings }
          : img
      ));
    }
  };

  // 右键菜单处理函数
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentImage) return;
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      show: true,
      isClosing: false
    });
  };

  // 图片点击放大处理函数
  const handleImageClick = () => {
    if (currentImage) {
      setShowImageModal(true);
      setImageModalClosing(true); // 初始设为true，让元素以透明状态出现
      // 下一帧设为false，触发渐入动画
      requestAnimationFrame(() => {
        setImageModalClosing(false);
      });
    }
  };

  // 图片模态框关闭处理函数
  const handleCloseImageModal = () => {
    setImageModalClosing(true);
    setTimeout(() => {
      setShowImageModal(false);
      setImageModalClosing(false);
    }, 300); // 与CSS动画时长一致
  };

  // 长按事件处理
  const [touchTimer, setTouchTimer] = useState<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const timer = setTimeout(() => {
      // 长按触发右键菜单
      if (!currentImage) return;
      
      const touch = e.touches[0];
      setContextMenu({
        x: touch.clientX,
        y: touch.clientY,
        show: true,
        isClosing: false
      });
    }, 500); // 500ms长按
    
    setTouchTimer(timer);
  };
  
  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };
  
  const handleTouchMove = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  // 底部缩略图区域的右键菜单处理函数
  const handleThumbnailContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 计算菜单尺寸（估算）
    const menuWidth = 140;
    const menuHeight = selectedImageIds.size > 0 ? 140 : 120; // 有选中项时高度更大
    
    // 获取视窗尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 计算最佳位置
    let x = e.clientX;
    let y = e.clientY;
    
    // 水平位置调整：确保不超出右边界
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }
    
    // 垂直位置调整：在底部区域时，菜单应该向上显示
    if (y + menuHeight > viewportHeight) {
      y = y - menuHeight; // 菜单显示在鼠标上方
    }
    
    // 确保不超出顶部边界
    if (y < 10) {
      y = 10;
    }
    
    setContextMenu({
      x,
      y,
      show: true,
      isClosing: false
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isClosing: true }));
    setTimeout(() => {
      setContextMenu(prev => ({ ...prev, show: false, isClosing: false }));
    }, 150); // 动画持续时间
  };

  const handleCloseImage = () => {
    if (!currentImage) return;
    
    const newImages = images.filter(img => img.id !== currentImage.id);
    setImages(newImages);
    
    if (newImages.length === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(newImages.length - 1);
    }
    
    handleCloseContextMenu();
  };



  // 批量操作函数
  const handleBatchDownload = async () => {
    if (selectedImageIds.size > 0) {
      // 下载选中的图片
      for (const imageId of selectedImageIds) {
        const imageData = images.find(img => img.id === imageId);
        if (imageData) {
          // 创建临时canvas来渲染水印
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) return;
          
          const img = new Image();
          img.onload = async () => {
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCtx.drawImage(img, 0, 0);
            
            // 应用水印设置
            const settings = imageData.watermarkSettings;
            if (settings.text) {
              // 计算字体大小 - 根据单位类型计算
              let actualFontSize: number;
              
              if (appSettings.fontSizeUnit === 'percent') {
                  // 百分比模式：基于文本宽度与图片宽度的比例
                  const tempFont = `10px ${settings.fontFamily}`;
                  tempCtx.font = tempFont;
                  const textMetrics = tempCtx.measureText(settings.text.split('\n')[0] || ' ');
                  const initialWidth = textMetrics.width;
                  const scaleRatio = img.width / initialWidth;
                  actualFontSize = 10 * scaleRatio * (settings.size / 100);
                  actualFontSize = Math.max(8, actualFontSize);
                } else {
                // 像素模式：直接使用像素值
                actualFontSize = Math.max(8, Math.min(200, settings.size));
              }
              
              // 设置水印样式
              tempCtx.font = `${actualFontSize}px ${settings.fontFamily}`;
              tempCtx.fillStyle = settings.color;
              tempCtx.globalAlpha = settings.opacity;
              tempCtx.textBaseline = 'middle';
              tempCtx.textAlign = 'left';
              
              // 处理多行文字
              const lines = settings.text.split('\n');
              const lineHeight = actualFontSize * 1.2;
              
              // 计算所有行的最大宽度和总高度
              let maxTextWidth = 0;
              const lineWidths: number[] = [];
              
              lines.forEach(line => {
                const textMetrics = tempCtx.measureText(line);
                const lineWidth = textMetrics.width;
                lineWidths.push(lineWidth);
                maxTextWidth = Math.max(maxTextWidth, lineWidth);
              });
              
              const totalTextHeight = lines.length * lineHeight;
              
              if (settings.position === 'full-screen') {
                // 全屏水印模式
                // Spacing is now a multiplier of the watermark's dimensions
                const spacingX = maxTextWidth + settings.spacingX;
                const spacingY = totalTextHeight + settings.spacingY;

                // Calculate offsets as a percentage of the image size
                const offsetX = (settings.offsetX / 100) * img.width;
                const offsetY = (settings.offsetY / 100) * img.height;
                
                const cols = Math.ceil(img.width / spacingX) + 2;
                const rows = Math.ceil(img.height / spacingY) + 2;
                
                for (let row = 0; row < rows; row++) {
                  for (let col = 0; col < cols; col++) {
                    const baseX = col * spacingX - spacingX / 2 + offsetX;
                    const baseY = row * spacingY + totalTextHeight / 2 + offsetY;
                    
                    tempCtx.save();
                    tempCtx.translate(baseX + maxTextWidth / 2, baseY);
                    tempCtx.rotate((settings.rotation * Math.PI) / 180);
                    
                    lines.forEach((line, lineIndex) => {
                      const lineY = (lineIndex - (lines.length - 1) / 2) * lineHeight;
                      const lineWidth = lineWidths[lineIndex];
                      tempCtx.fillText(line, -lineWidth / 2, lineY);
                    });
                    
                    tempCtx.restore();
                  }
                }
              } else {
                // Single watermark with stable positioning
                const centerX = img.width / 2;
                const centerY = img.height / 2;

                // Calculate the bounding box of the rotated watermark
                const angle = (settings.rotation * Math.PI) / 180;
                const sin = Math.abs(Math.sin(angle));
                const cos = Math.abs(Math.cos(angle));
                const rotatedWidth = maxTextWidth * cos + totalTextHeight * sin;
                const rotatedHeight = maxTextWidth * sin + totalTextHeight * cos;

                // Calculate the safe area for the center of the watermark
                const safeWidth = img.width - rotatedWidth;
                const safeHeight = img.height - rotatedHeight;

                // Calculate position based on percentage offsets within the safe area
                const offsetX = (settings.offsetX / 100) * (safeWidth / 2);
                const offsetY = (settings.offsetY / 100) * (safeHeight / 2);

                // Clamp the final position to ensure the watermark is fully visible
                const x = centerX + offsetX;
                const y = centerY - offsetY;

                const clampedX = Math.max(rotatedWidth / 2, Math.min(x, img.width - rotatedWidth / 2));
                const clampedY = Math.max(rotatedHeight / 2, Math.min(y, img.height - rotatedHeight / 2));

                // Draw single watermark with multiple lines
                tempCtx.save();
                // Translate to the calculated position, then adjust for text alignment
                tempCtx.translate(clampedX, clampedY);
                tempCtx.rotate((settings.rotation * Math.PI) / 180);
                
                // 绘制每一行，以文本块的中心为原点
                lines.forEach((line, lineIndex) => {
                  const lineY = (lineIndex - (lines.length - 1) / 2) * lineHeight;
                  const lineWidth = lineWidths[lineIndex];
                  // Adjust for textAlign = 'left' by offsetting by half width
                  tempCtx.fillText(line, -lineWidth / 2, lineY);
                });
                
                tempCtx.restore();
              }
              
              // 重置透明度
              tempCtx.globalAlpha = 1;
            }
            
            // 下载图片
            const hasAlpha = imageData.file.type === 'image/png' || 
                           imageData.file.type === 'image/webp' ||
                           imageData.file.type === 'image/gif';
            const outputFormat = hasAlpha ? 'image/png' : 'image/jpeg';
            const quality = hasAlpha ? undefined : 0.95;
            
            // 获取canvas的base64数据
            let dataURL = tempCanvas.toDataURL(outputFormat, quality);
            
            // 如果导出格式是JPEG，尝试保留原始图片的EXIF信息
            if (outputFormat === 'image/jpeg') {
              try {
                // 优先使用原始文件（HEIC转换前的文件），如果不存在则使用当前文件
                const sourceFile = imageData.originalFile || imageData.file;
                
                // 检查是否为HEIC格式
                const isHeicFormat = sourceFile.type === 'image/heic' || 
                                    sourceFile.type === 'image/heif' || 
                                    sourceFile.name.toLowerCase().endsWith('.heic') || 
                                    sourceFile.name.toLowerCase().endsWith('.heif');
                
                let exifData: any;
                
                if (isHeicFormat) {
                  // 使用exifreader处理HEIC文件的EXIF信息
                  console.log('检测到HEIC格式，使用exifreader提取EXIF信息...');
                  const ExifReader = await import('exifreader');
                  
                  // 读取文件为ArrayBuffer
                  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as ArrayBuffer);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(sourceFile);
                  });
                  
                  // 使用exifreader解析HEIC文件的EXIF信息
                  const tags = ExifReader.default.load(arrayBuffer);
                  
                  if (tags && Object.keys(tags).length > 0) {
                    // 转换exifreader格式到piexifjs格式
                    exifData = {
                      '0th': {},
                      'Exif': {},
                      'GPS': {},
                      '1st': {}
                    };
                    
                    // 扩展的EXIF标签映射表
                     const tagMapping: { [key: string]: { ifd: string; tag: number } } = {
                       // 0th IFD (主图像信息)
                       'Make': { ifd: '0th', tag: 271 },
                       'Model': { ifd: '0th', tag: 272 },
                       'Orientation': { ifd: '0th', tag: 274 },
                       'XResolution': { ifd: '0th', tag: 282 },
                       'YResolution': { ifd: '0th', tag: 283 },
                       'ResolutionUnit': { ifd: '0th', tag: 296 },
                       'Software': { ifd: '0th', tag: 305 },
                       'DateTime': { ifd: '0th', tag: 306 },
                       'Artist': { ifd: '0th', tag: 315 },
                       'WhitePoint': { ifd: '0th', tag: 318 },
                       'PrimaryChromaticities': { ifd: '0th', tag: 319 },
                       'YCbCrCoefficients': { ifd: '0th', tag: 529 },
                       'YCbCrPositioning': { ifd: '0th', tag: 531 },
                       'ReferenceBlackWhite': { ifd: '0th', tag: 532 },
                       'Copyright': { ifd: '0th', tag: 33432 },
                       
                       // Exif IFD (拍摄参数)
                       'ExposureTime': { ifd: 'Exif', tag: 33434 },
                       'FNumber': { ifd: 'Exif', tag: 33437 },
                       'ExposureProgram': { ifd: 'Exif', tag: 34850 },
                       'SpectralSensitivity': { ifd: 'Exif', tag: 34852 },
                       'ISO': { ifd: 'Exif', tag: 34855 },
                       'ISOSpeedRatings': { ifd: 'Exif', tag: 34855 },
                       'OECF': { ifd: 'Exif', tag: 34856 },
                       'SensitivityType': { ifd: 'Exif', tag: 34864 },
                       'ExifVersion': { ifd: 'Exif', tag: 36864 },
                       'DateTimeOriginal': { ifd: 'Exif', tag: 36867 },
                       'DateTimeDigitized': { ifd: 'Exif', tag: 36868 },
                       'OffsetTime': { ifd: 'Exif', tag: 36880 },
                       'OffsetTimeOriginal': { ifd: 'Exif', tag: 36881 },
                       'OffsetTimeDigitized': { ifd: 'Exif', tag: 36882 },
                       'ComponentsConfiguration': { ifd: 'Exif', tag: 37121 },
                       'CompressedBitsPerPixel': { ifd: 'Exif', tag: 37122 },
                       'ShutterSpeedValue': { ifd: 'Exif', tag: 37377 },
                       'ApertureValue': { ifd: 'Exif', tag: 37378 },
                       'BrightnessValue': { ifd: 'Exif', tag: 37379 },
                       'ExposureBiasValue': { ifd: 'Exif', tag: 37380 },
                       'MaxApertureValue': { ifd: 'Exif', tag: 37381 },
                       'SubjectDistance': { ifd: 'Exif', tag: 37382 },
                       'MeteringMode': { ifd: 'Exif', tag: 37383 },
                       'LightSource': { ifd: 'Exif', tag: 37384 },
                       'Flash': { ifd: 'Exif', tag: 37385 },
                       'FocalLength': { ifd: 'Exif', tag: 37386 },
                       'SubjectArea': { ifd: 'Exif', tag: 37396 },
                       'MakerNote': { ifd: 'Exif', tag: 37500 },
                       'UserComment': { ifd: 'Exif', tag: 37510 },
                       'SubSecTime': { ifd: 'Exif', tag: 37520 },
                       'SubSecTimeOriginal': { ifd: 'Exif', tag: 37521 },
                       'SubSecTimeDigitized': { ifd: 'Exif', tag: 37522 },
                       'FlashpixVersion': { ifd: 'Exif', tag: 40960 },
                       'ColorSpace': { ifd: 'Exif', tag: 40961 },
                       'PixelXDimension': { ifd: 'Exif', tag: 40962 },
                       'PixelYDimension': { ifd: 'Exif', tag: 40963 },
                       'RelatedSoundFile': { ifd: 'Exif', tag: 40964 },
                       'FlashEnergy': { ifd: 'Exif', tag: 41483 },
                       'SpatialFrequencyResponse': { ifd: 'Exif', tag: 41484 },
                       'FocalPlaneXResolution': { ifd: 'Exif', tag: 41486 },
                       'FocalPlaneYResolution': { ifd: 'Exif', tag: 41487 },
                       'FocalPlaneResolutionUnit': { ifd: 'Exif', tag: 41488 },
                       'SubjectLocation': { ifd: 'Exif', tag: 41492 },
                       'ExposureIndex': { ifd: 'Exif', tag: 41493 },
                       'SensingMethod': { ifd: 'Exif', tag: 41495 },
                       'FileSource': { ifd: 'Exif', tag: 41728 },
                       'SceneType': { ifd: 'Exif', tag: 41729 },
                       'CFAPattern': { ifd: 'Exif', tag: 41730 },
                       'CustomRendered': { ifd: 'Exif', tag: 41985 },
                       'ExposureMode': { ifd: 'Exif', tag: 41986 },
                       'WhiteBalance': { ifd: 'Exif', tag: 41987 },
                       'DigitalZoomRatio': { ifd: 'Exif', tag: 41988 },
                       'FocalLengthIn35mmFilm': { ifd: 'Exif', tag: 41989 },
                       'SceneCaptureType': { ifd: 'Exif', tag: 41990 },
                       'GainControl': { ifd: 'Exif', tag: 41991 },
                       'Contrast': { ifd: 'Exif', tag: 41992 },
                       'Saturation': { ifd: 'Exif', tag: 41993 },
                       'Sharpness': { ifd: 'Exif', tag: 41994 },
                       'DeviceSettingDescription': { ifd: 'Exif', tag: 41995 },
                       'SubjectDistanceRange': { ifd: 'Exif', tag: 41996 },
                       'ImageUniqueID': { ifd: 'Exif', tag: 42016 },
                       'CameraOwnerName': { ifd: 'Exif', tag: 42032 },
                       'BodySerialNumber': { ifd: 'Exif', tag: 42033 },
                       'LensSpecification': { ifd: 'Exif', tag: 42034 },
                       'LensMake': { ifd: 'Exif', tag: 42035 },
                       'LensModel': { ifd: 'Exif', tag: 42036 },
                       'LensSerialNumber': { ifd: 'Exif', tag: 42037 },
                       
                       // GPS IFD (位置信息)
                       'GPSVersionID': { ifd: 'GPS', tag: 0 },
                       'GPSLatitudeRef': { ifd: 'GPS', tag: 1 },
                       'GPSLatitude': { ifd: 'GPS', tag: 2 },
                       'GPSLongitudeRef': { ifd: 'GPS', tag: 3 },
                       'GPSLongitude': { ifd: 'GPS', tag: 4 },
                       'GPSAltitudeRef': { ifd: 'GPS', tag: 5 },
                       'GPSAltitude': { ifd: 'GPS', tag: 6 },
                       'GPSTimeStamp': { ifd: 'GPS', tag: 7 },
                       'GPSSatellites': { ifd: 'GPS', tag: 8 },
                       'GPSStatus': { ifd: 'GPS', tag: 9 },
                       'GPSMeasureMode': { ifd: 'GPS', tag: 10 },
                       'GPSDOP': { ifd: 'GPS', tag: 11 },
                       'GPSSpeedRef': { ifd: 'GPS', tag: 12 },
                       'GPSSpeed': { ifd: 'GPS', tag: 13 },
                       'GPSTrackRef': { ifd: 'GPS', tag: 14 },
                       'GPSTrack': { ifd: 'GPS', tag: 15 },
                       'GPSImgDirectionRef': { ifd: 'GPS', tag: 16 },
                       'GPSImgDirection': { ifd: 'GPS', tag: 17 },
                       'GPSMapDatum': { ifd: 'GPS', tag: 18 },
                       'GPSDestLatitudeRef': { ifd: 'GPS', tag: 19 },
                       'GPSDestLatitude': { ifd: 'GPS', tag: 20 },
                       'GPSDestLongitudeRef': { ifd: 'GPS', tag: 21 },
                       'GPSDestLongitude': { ifd: 'GPS', tag: 22 },
                       'GPSDestBearingRef': { ifd: 'GPS', tag: 23 },
                       'GPSDestBearing': { ifd: 'GPS', tag: 24 },
                       'GPSDestDistanceRef': { ifd: 'GPS', tag: 25 },
                       'GPSDestDistance': { ifd: 'GPS', tag: 26 },
                       'GPSProcessingMethod': { ifd: 'GPS', tag: 27 },
                       'GPSAreaInformation': { ifd: 'GPS', tag: 28 },
                       'GPSDateStamp': { ifd: 'GPS', tag: 29 },
                       'GPSDifferential': { ifd: 'GPS', tag: 30 },
                       'GPSHPositioningError': { ifd: 'GPS', tag: 31 }
                     };
                     
                     // 转换标签，支持更复杂的数据类型处理
                     Object.keys(tags).forEach(tagName => {
                       const mapping = tagMapping[tagName];
                       if (mapping && tags[tagName] && tags[tagName].value !== undefined) {
                         let value = tags[tagName].value;
                         
                         // 处理特殊的数据类型
                         if (Array.isArray(value)) {
                           // 对于数组类型，保持原样或转换为适当格式
                           if (tagName === 'GPSLatitude' || tagName === 'GPSLongitude') {
                             // GPS坐标需要特殊处理
                             value = value.map((v: any) => {
                               if (typeof v === 'object' && v && 'numerator' in v && 'denominator' in v) {
                                 return [v.numerator, v.denominator];
                               }
                               return v;
                             }) as any;
                           } else {
                             // 对于其他数组类型，转换为字符串
                             value = value.join(', ') as any;
                           }
                         } else if (typeof value === 'object' && value && 'numerator' in value && 'denominator' in value) {
                           // 处理分数类型（如曝光时间、光圈值等）
                           value = [(value as any).numerator, (value as any).denominator] as any;
                         } else if (typeof value === 'string' && value.length > 100) {
                           // 对于过长的字符串（如MakerNote），截断以避免问题
                           value = value.substring(0, 100);
                         }
                         
                         exifData[mapping.ifd][mapping.tag] = value;
                       }
                     });
                     
                     // 记录映射的标签数量
                     const mappedCount = Object.keys(tags).filter(tagName => tagMapping[tagName]).length;
                     console.log(`成功从HEIC文件提取EXIF信息: 总共${Object.keys(tags).length}个标签，映射了${mappedCount}个标签`);
                     
                     // 输出未映射的标签以便调试
                     const unmappedTags = Object.keys(tags).filter(tagName => !tagMapping[tagName]);
                     if (unmappedTags.length > 0) {
                       console.log('未映射的EXIF标签:', unmappedTags.slice(0, 10)); // 只显示前10个
                     }
                    
       
                  }
                } else {
                  // 使用piexifjs处理JPEG文件的EXIF信息
                  const piexif = await import('piexifjs');
                  
                  const originalImageData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const arrayBuffer = reader.result as ArrayBuffer;
                      const uint8Array = new Uint8Array(arrayBuffer);
                      const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
                      resolve(btoa(binaryString));
                    };
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(sourceFile);
                  });
                  
                  try {
                    exifData = piexif.default.load('data:image/jpeg;base64,' + originalImageData);
                    console.log('成功从JPEG文件提取EXIF信息');
                  } catch (exifError) {
                    console.log('原始图片没有EXIF信息或格式不支持:', exifError);
                  }
                }
                
                // 如果成功提取到EXIF信息，将其插入到新图片中
                if (exifData && Object.keys(exifData).length > 0) {
                  const piexif = await import('piexifjs');
                  
                  // 移除可能导致问题的缩略图数据
                  if (exifData['thumbnail']) {
                    delete exifData['thumbnail'];
                  }
                  
                  // 更新图片尺寸信息
                  if (exifData['Exif']) {
                    exifData['Exif'][piexif.default.ExifIFD.PixelXDimension] = tempCanvas.width;
                    exifData['Exif'][piexif.default.ExifIFD.PixelYDimension] = tempCanvas.height;
                  }
                  
                  // 将EXIF信息插入到新图片中
                  const exifBytes = piexif.default.dump(exifData);
                  dataURL = piexif.default.insert(exifBytes, dataURL);
                  
                  console.log('成功保留EXIF信息到导出图片');
                }
              } catch (error) {
                console.error('处理EXIF信息时出错:', error);
                // 如果处理EXIF失败，继续使用原始dataURL
              }
            }
            
            const link = document.createElement('a');
            link.download = `watermarked-${imageData.file.name.replace(/\.[^/.]+$/, hasAlpha ? '.png' : '.jpg')}`;
            link.href = dataURL;
            link.click();
          };
          img.src = imageData.url;
        }
      }
    } else if (currentImage) {
      // 如果没有选中图片，下载当前图片
      handleDownload();
    }
    handleCloseContextMenu();
  };

  const handleBatchClose = () => {
    if (selectedImageIds.size > 0) {
      // 关闭选中的图片
      const newImages = images.filter(img => !selectedImageIds.has(img.id));
      setImages(newImages);
      setSelectedImageIds(new Set());
      
      if (newImages.length === 0) {
        setCurrentImageIndex(0);
      } else if (currentImageIndex >= newImages.length) {
        setCurrentImageIndex(newImages.length - 1);
      }
    } else if (currentImage) {
      // 如果没有选中图片，关闭当前图片
      handleCloseImage();
      return; // handleCloseImage 已经调用了 handleCloseContextMenu
    }
    handleCloseContextMenu();
  };

  const handleBatchReset = () => {
    if (selectedImageIds.size > 0) {
      // 重置选中图片的设置
      const newImages = images.map(img => {
        if (selectedImageIds.has(img.id)) {
          return {
            ...img,
            watermarkSettings: {
              text: appSettings.defaultWatermark,
              position: appSettings.defaultPosition,
              size: appSettings.defaultSize,
              rotation: appSettings.defaultRotation,
              opacity: appSettings.defaultOpacity,
              color: appSettings.defaultColor,
              fontFamily: appSettings.defaultFontFamily,
              offsetX: appSettings.defaultOffsetX || 0,
              offsetY: appSettings.defaultOffsetY || 0,
              spacingX: appSettings.defaultSpacingX || 2,
              spacingY: appSettings.defaultSpacingY || 4
            }
          };
        }
        return img;
      });
      setImages(newImages);
      
      // 如果当前图片在选中列表中，也更新当前的水印设置
      if (currentImage && selectedImageIds.has(currentImage.id)) {
        setWatermarkSettings({
          text: appSettings.defaultWatermark,
          position: appSettings.defaultPosition,
          size: appSettings.defaultSize,
          rotation: appSettings.defaultRotation,
          opacity: appSettings.defaultOpacity,
          color: appSettings.defaultColor,
          fontFamily: appSettings.defaultFontFamily,
          offsetX: appSettings.defaultOffsetX || 0,
          offsetY: appSettings.defaultOffsetY || 0,
          spacingX: appSettings.defaultSpacingX || 2,
          spacingY: appSettings.defaultSpacingY || 4
        });
      }
    } else {
      // 如果没有选中图片，重置当前图片
      resetToDefaults();
    }
    handleCloseContextMenu();
  };

  // 点击其他地方关闭右键菜单
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        handleCloseContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col overflow-hidden custom-scrollbar">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 flex-shrink-0 z-10">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-xs text-gray-600 hidden sm:block">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title={t.settings}
              >
                <Settings className="w-4 h-4" />
              </button>
              

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Image Display Area */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden min-h-0 lg:flex-1">
          {/* Main Image Display */}
          <div className={`flex-1 lg:flex-1 lg:max-h-none flex items-center justify-center p-4 lg:p-6 transition-all duration-500 min-h-0 ${
            images.length === 0 ? 'opacity-100' : isLoading ? 'opacity-50' : 'opacity-100'
          }`}>
            <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex items-center justify-center relative">
              {images.length === 0 ? (
                <div className="text-center p-4 lg:p-8 animate-fade-in flex items-center justify-center w-full h-full">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 lg:p-12 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 max-w-md mx-auto transform hover:scale-105"
                  >
                    <Upload className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t.uploadTitle}</h3>
                    <p className="text-gray-600 mb-3 text-lg">{t.uploadSubtitle}</p>
                    <p className="text-sm text-gray-400">{t.uploadHint}</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <>
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-gray-600">{t.loadingImages}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className={`relative w-full h-full flex items-center justify-center transition-all duration-500 max-w-full max-h-full ${
                    isLoading ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
                  }`}>
                    <div className="relative inline-block max-w-full max-h-full">
                      {/* 透明背景棋盘格 */}
                      <div 
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage: `
                            linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                          `,
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="shadow-lg relative z-10 block cursor-pointer"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        onContextMenu={handleContextMenu}
                        onClick={handleImageClick}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                      />
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 0 && (
            <div className="bg-white border-t border-gray-200 p-4 min-h-[112px] flex-shrink-0" onContextMenu={handleThumbnailContextMenu}>
              <div className="flex space-x-3 overflow-x-auto p-2 h-24">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    onClick={(e) => handleImageSelect(index, e)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-shadow duration-200 ${
                      index === currentImageIndex
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : selectedImageIds.has(img.id)
                        ? 'ring-2 ring-purple-500 shadow-md'
                        : 'hover:shadow-md hover:ring-2 hover:ring-blue-400'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageIds.has(img.id) && (
                      <div className="absolute top-1 right-1 bg-purple-500 text-white rounded-full p-0.5">
                        <CheckSquare className="w-3 h-3" />
                      </div>
                    )}

                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors ml-2"
                  title={t.uploadNewImage}
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Panel - 只在有图片时显示 */}
        {images.length > 0 && (
          <div 
            className={`
              ${/* 移动端样式 */ ''}
              block 
              max-h-[50vh] lg:max-h-none 
              ${/* 桌面端样式 */ ''}
              lg:static lg:translate-y-0 
              lg:w-80 xl:w-96 
              w-full lg:w-80 xl:w-96 
              bg-white 
              border-t lg:border-t-0 lg:border-l border-gray-200 
              flex-shrink-0 overflow-y-auto custom-scrollbar 
              transition-all duration-300 ease-in-out
            `}
            style={{scrollbarGutter: 'stable'}}>
          <div className="p-4 lg:p-6 space-y-6">
            {images.length > 0 && (
              <>
                {/* Image Actions */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-10 h-10 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
                        title={selectedImageIds.size === images.length ? t.deselectAll : t.selectAll}
                      >
                        {selectedImageIds.size === images.length ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={handleSyncSettings}
                        disabled={selectedImageIds.size === 0}
                        className="flex items-center justify-center w-10 h-10 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                        title={t.syncSettings}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={selectedImageIds.size > 0 ? handleBatchDownload : handleDownload}
                        className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                        title={selectedImageIds.size > 0 ? `下载选中的${selectedImageIds.size}张图片` : t.downloadImage}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                    </div>
                    {images.length > 1 && selectedImageIds.size > 0 && (
                      <span className="text-sm text-gray-600 font-medium">
                        {t.selectedImages}: {selectedImageIds.size}
                      </span>
                    )}
                  </div>
                </div>


              </>
            )}

            {/* Watermark Controls - Only show when images are loaded */}
            {images.length > 0 && (
              <>
                {/* Presets Module */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <h3 className="text-base font-semibold text-gray-900">{t.presets}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPresetModal(true)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {t.savePreset}
                      </button>
                      <button
                        onClick={exportPresets}
                        disabled={presets.length === 0}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {t.exportPresets}
                      </button>
                      <label className="px-3 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer">
                        {t.importPresets}
                        <input
                          type="file"
                          accept=".json"
                          onChange={importPresets}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {presets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {presets.map((preset) => (
                        <div
                          key={preset.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                            selectedPresetId === preset.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(preset.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => loadPreset(preset.id)}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              {t.loadPreset}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t.confirmDelete)) {
                                  deletePreset(preset.id);
                                }
                              }}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              {t.deletePreset}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      {t.noPresets}
                    </div>
                  )}
                </div>

                {/* Watermark Text */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Type className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900">{t.watermarkText}</h3>
                  </div>
                  <textarea
                    value={watermarkSettings.text}
                    onChange={(e) => updateSetting('text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-vertical min-h-[60px]"
                    placeholder={t.enterWatermarkText}
                    rows={3}
                  />
                </div>

                {/* Position Controls */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Grid3X3 className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900">{t.position}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {positions.slice(0, 9).map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => updateSetting('position', pos.id)}
                        className={`p-2 rounded-lg border-2 transition-all text-sm ${
                          watermarkSettings.position === pos.id
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={pos.label}
                      >
                        <span className="text-base">{pos.icon}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => updateSetting('position', 'full-screen')}
                    className={`w-full p-2 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 text-sm ${
                      watermarkSettings.position === 'full-screen'
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>{t.fullScreenPattern}</span>
                  </button>
                  
                  {/* 位移控制 - 所有模式都显示 */}
                  <div className="mt-4 space-y-3">
                    {/* 水平位移 */}
                    <div data-control="offsetX" {...offsetXDoubleTap}>
                      <EditableNumber
                        label={`${t.offsetX}:`}
                        value={watermarkSettings.offsetX}
                        onChange={(newValue) => updateSetting('offsetX', newValue)}
                        unit="%"
                        min={-100}
                        max={100}
                      />
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={watermarkSettings.offsetX}
                        onChange={(e) => updateSetting('offsetX', parseInt(e.target.value, 10))}
                        onDoubleClick={() => updateSetting('offsetX', appSettings.defaultOffsetX)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        title="双击恢复默认值"
                      />
                    </div>
                    
                    {/* 垂直位移 */}
                    <div data-control="offsetY" {...offsetYDoubleTap}>
                      <EditableNumber
                        label={`${t.offsetY}:`}
                        value={watermarkSettings.offsetY}
                        onChange={(newValue) => updateSetting('offsetY', newValue)}
                        unit="%"
                        min={-100}
                        max={100}
                      />
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={watermarkSettings.offsetY}
                        onChange={(e) => updateSetting('offsetY', parseInt(e.target.value, 10))}
                        onDoubleClick={() => updateSetting('offsetY', appSettings.defaultOffsetY)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        title="双击恢复默认值"
                      />
                    </div>
                    
                    {/* 满屏水印下的间隔控制 - 添加过渡动画 */}
                    <div className={`space-y-3 overflow-hidden transition-all duration-300 ease-in-out ${watermarkSettings.position === 'full-screen' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {/* 水平间隔 */}
                      <div data-control="spacingX" {...spacingXDoubleTap}>
                        <EditableNumber
                          label={`${t.spacingX}:`}
                          value={watermarkSettings.spacingX}
                          onChange={(newValue) => updateSetting('spacingX', newValue)}
                          unit={appSettings.fontSizeUnit === 'percent' ? '%' : 'x'}
                          step={appSettings.fontSizeUnit === 'percent' ? 0.1 : 0.5}
                          min={1}
                          max={200}
                        />
                        <input
                          type="range"
                          min="1"
                          max="200"
                          step={appSettings.fontSizeUnit === 'percent' ? '0.1' : '0.5'}
                          value={watermarkSettings.spacingX}
                          onChange={(e) => updateSetting('spacingX', parseFloat(e.target.value))}
                          onDoubleClick={() => updateSetting('spacingX', appSettings.defaultSpacingX)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          title="双击恢复默认值"
                        />
                      </div>
                      
                      {/* 垂直间隔 */}
                      <div data-control="spacingY" {...spacingYDoubleTap}>
                        <EditableNumber
                          label={`${t.spacingY}:`}
                          value={watermarkSettings.spacingY}
                          onChange={(newValue) => updateSetting('spacingY', newValue)}
                          unit={appSettings.fontSizeUnit === 'percent' ? '%' : 'x'}
                          step={appSettings.fontSizeUnit === 'percent' ? 0.1 : 0.5}
                          min={1}
                          max={200}
                        />
                        <input
                          type="range"
                          min="1"
                          max="200"
                          step={appSettings.fontSizeUnit === 'percent' ? '0.1' : '0.5'}
                          value={watermarkSettings.spacingY}
                          onChange={(e) => updateSetting('spacingY', parseFloat(e.target.value))}
                          onDoubleClick={() => updateSetting('spacingY', appSettings.defaultSpacingY)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          title="双击恢复默认值"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style Controls */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Palette className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900">{t.style}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Size */}
                    <div data-control="size" {...sizeDoubleTap}>
                      <EditableNumber
                        label={`${t.size}:`}
                        value={watermarkSettings.size}
                        onChange={(newValue) => updateSetting('size', newValue)}
                        min={appSettings.minSize}
                        max={appSettings.maxSize}
                        step={appSettings.fontSizeUnit === 'percent' ? 0.1 : 1}
                        unit={appSettings.fontSizeUnit === 'percent' ? '%' : 'px'}
                      />
                      <input
                        type="range"
                        min={appSettings.minSize}
                        max={appSettings.maxSize}
                        step={appSettings.fontSizeUnit === 'percent' ? '0.1' : '1'}
                        value={watermarkSettings.size}
                        onChange={(e) => updateSetting('size', appSettings.fontSizeUnit === 'percent' ? parseFloat(e.target.value) : parseInt(e.target.value))}
                        onDoubleClick={() => updateSetting('size', appSettings.defaultSize)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                        title="双击恢复默认值"
                      />
                    </div>

                    {/* Rotation */}
                    <div data-control="rotation" {...rotationDoubleTap}>
                      <EditableNumber
                        label={`${t.rotation}:`}
                        value={watermarkSettings.rotation}
                        onChange={(newValue) => updateSetting('rotation', newValue)}
                        min={-180}
                        max={180}
                        step={1}
                        unit="°"
                        toFixedValue={0}
                      />
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={watermarkSettings.rotation}
                        onChange={(e) => updateSetting('rotation', parseInt(e.target.value, 10))}
                        onDoubleClick={() => updateSetting('rotation', appSettings.defaultRotation)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                        title="双击恢复默认值"
                      />
                    </div>

                    {/* Opacity */}
                    <div data-control="opacity" {...opacityDoubleTap}>
                      <EditableNumber
                        label={`${t.opacity}:`}
                        value={watermarkSettings.opacity}
                        onChange={(newValue) => updateSetting('opacity', newValue)}
                        min={appSettings.minOpacity}
                        max={appSettings.maxOpacity}
                        step={0.01}
                        unit=""
                        toFixedValue={2}
                      />
                      <input
                        type="range"
                        min={appSettings.minOpacity}
                        max={appSettings.maxOpacity}
                        step="0.01"
                        value={watermarkSettings.opacity}
                        onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
                        onDoubleClick={() => updateSetting('opacity', appSettings.defaultOpacity)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                        title="双击恢复默认值"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">{t.color}</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={watermarkSettings.color}
                          onChange={(e) => updateSetting('color', e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={watermarkSettings.color}
                          onChange={(e) => updateSetting('color', e.target.value)}
                          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Font Family */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-gray-700">{t.font}</label>
                        {('queryLocalFonts' in window) && (
                          <button
                            onClick={loadLocalFonts}
                            disabled={fontsLoading}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title={fontPermissionGranted ? '重新加载本地字体' : '加载本地字体'}
                          >
                            {fontsLoading ? '加载中...' : (fontPermissionGranted ? '刷新' : '加载本地字体')}
                          </button>
                        )}
                      </div>
                      <select
                        value={watermarkSettings.fontFamily}
                        onChange={(e) => updateSetting('fontFamily', e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {/* 默认字体 */}
                        <optgroup label="默认字体">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="SimHei">SimHei (黑体)</option>
                          <option value="SimSun">SimSun (宋体)</option>
                          <option value="Microsoft YaHei">Microsoft YaHei (微软雅黑)</option>
                        </optgroup>
                        
                        {/* 本地字体 */}
                        {localFonts.length > 0 && (
                          <optgroup label={`本地字体 (${localFonts.length})`}>
                            {localFonts.map((font) => (
                              <option key={font.family} value={font.family}>
                                {font.family}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      
                      {/* 字体访问提示 */}
                      {!('queryLocalFonts' in window) && (
                        <p className="text-xs text-gray-500 mt-1">
                          浏览器不支持本地字体访问功能
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Reset Button at Bottom Right */}
            {images.length > 0 && (
              <div className="flex justify-end mt-6 pb-4 pr-4">
                <button
                  onClick={resetToDefaults}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title={t.reset}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.reset}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Confirm Sync All Modal - 添加过渡动画 */}
      <div 
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out ${showConfirmSync ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.target === e.currentTarget && setShowConfirmSync(false)}
      >
        <div 
          className={`bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ease-in-out transform ${showConfirmSync ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {appSettings.language === 'zh' ? '确认同步所有图片' : 'Confirm Sync All Images'}
            </h3>
            <p className="text-gray-600 mb-6">
              {appSettings.language === 'zh' 
                ? '这将把当前水印设置应用到所有图片，是否继续？'
                : 'This will apply current watermark settings to all images. Continue?'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmSync(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmSyncAll}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {appSettings.language === 'zh' ? '确认' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>

      {/* Settings Modal - 添加过渡动画 */}
      <div 
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out ${showSettingsModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => e.target === e.currentTarget && setShowSettingsModal(false)}
      >
        <div 
          className={`bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out transform ${showSettingsModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.appSettings}</h2>
                <button
                  onClick={handleCancelSettings}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Language Setting */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Languages className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900">Language / 语言</h3>
                  </div>
                  <select
                    value={tempSettings.language}
                    onChange={(e) => setTempSettings(prev => ({ ...prev, language: e.target.value as Language }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Default Settings */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">{translations[tempSettings.language].defaultSettings}</h3>
                  
                  <div className="space-y-4">
                    {/* Default Watermark Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].defaultWatermark}
                      </label>
                      <input
                        type="text"
                        value={tempSettings.defaultWatermark}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, defaultWatermark: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Default Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].defaultPosition}
                      </label>
                      <select
                        value={tempSettings.defaultPosition}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, defaultPosition: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {positions.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {translations[tempSettings.language].positions[pos.id as keyof typeof translations.zh.positions]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Default Style Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].size}
                        </label>
                        <input
                          type="number"
                          value={tempSettings.defaultSize}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultSize: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].fontSizeUnit}
                        </label>
                        <select
                          value={tempSettings.fontSizeUnit}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, fontSizeUnit: e.target.value as 'px' | 'percent' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="percent">{translations[tempSettings.language].fontSizeUnitPercent}</option>
                          <option value="px">{translations[tempSettings.language].fontSizeUnitPx}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].rotation}
                        </label>
                        <input
                          type="number"
                          value={tempSettings.defaultRotation}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultRotation: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].opacity}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={tempSettings.defaultOpacity}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultOpacity: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].color}
                        </label>
                        <input
                          type="color"
                          value={tempSettings.defaultColor}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultColor: e.target.value }))}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Default Font */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].font}
                      </label>
                      <select
                        value={tempSettings.defaultFontFamily}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, defaultFontFamily: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {/* 默认字体 */}
                        <optgroup label="默认字体">
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Verdana">Verdana</option>
                          <option value="SimHei">SimHei (黑体)</option>
                          <option value="SimSun">SimSun (宋体)</option>
                          <option value="Microsoft YaHei">Microsoft YaHei (微软雅黑)</option>
                        </optgroup>
                        
                        {/* 本地字体 */}
                        {localFonts.length > 0 && (
                          <optgroup label={`本地字体 (${localFonts.length})`}>
                            {localFonts.map((font) => (
                              <option key={font.family} value={font.family}>
                                {font.family}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                    
                    {/* Default XY Offset */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].offsetX}
                        </label>
                        <input
                          type="number"
                          value={tempSettings.defaultOffsetX}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultOffsetX: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].offsetY}
                        </label>
                        <input
                          type="number"
                          value={tempSettings.defaultOffsetY}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultOffsetY: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Default Spacing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].spacingX}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={tempSettings.defaultSpacingX}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultSpacingX: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[tempSettings.language].spacingY}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={tempSettings.defaultSpacingY}
                          onChange={(e) => setTempSettings(prev => ({ ...prev, defaultSpacingY: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Range Settings */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">{translations[tempSettings.language].rangeSettings}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].minSize}
                      </label>
                      <input
                        type="number"
                        value={tempSettings.minSize}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, minSize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].maxSize}
                      </label>
                      <input
                        type="number"
                        value={tempSettings.maxSize}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, maxSize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].minOpacity}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={tempSettings.minOpacity}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, minOpacity: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[tempSettings.language].maxOpacity}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={tempSettings.maxOpacity}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, maxOpacity: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{translations[tempSettings.language].exportFormat}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations[tempSettings.language].exportFormat}
                    </label>
                    <select
                      value={tempSettings.exportFormat}
                      onChange={(e) => setTempSettings(prev => ({ ...prev, exportFormat: e.target.value as 'auto' | 'jpeg' | 'png' | 'webp' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="auto">{translations[tempSettings.language].formatAuto}</option>
                      <option value="jpeg">{translations[tempSettings.language].formatJpeg}</option>
                      <option value="png">{translations[tempSettings.language].formatPng}</option>
                      <option value="webp">{translations[tempSettings.language].formatWebp}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations[tempSettings.language].exportQuality}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={tempSettings.exportQuality}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, exportQuality: parseFloat(e.target.value) }))}
                        onDoubleClick={() => setTempSettings(prev => ({ ...prev, exportQuality: defaultAppSettings.exportQuality }))}
                        className="flex-1"
                        disabled={tempSettings.exportFormat === 'png'}
                        title="双击恢复默认值"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {Math.round(tempSettings.exportQuality * 100)}%
                      </span>
                    </div>
                    {tempSettings.exportFormat === 'png' && (
                      <p className="text-xs text-gray-500 mt-1">
                        PNG格式无损压缩，不需要质量设置
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {translations[tempSettings.language].reset}
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelSettings}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {translations[tempSettings.language].cancel}
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {translations[tempSettings.language].save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Preset Modal */}
        {showPresetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t.savePreset}</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.presetName}
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder={t.enterPresetName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && presetName.trim()) {
                        savePreset();
                      }
                    }}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowPresetModal(false);
                      setPresetName('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={savePreset}
                    disabled={!presetName.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        .context-menu-enter {
          animation: context-menu-in 0.15s ease-out;
        }
        
        .context-menu-exit {
          animation: context-menu-out 0.15s ease-in;
        }
        
        @keyframes context-menu-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes context-menu-out {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\:scale-105:hover {
          transform: scale(1.05);
        }
        
        /* 自定义滚动条样式 */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
          scrollbar-gutter: stable;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          transition: opacity 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: all 0.3s ease;
          opacity: 0.6;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
          opacity: 1;
        }
        
        /* 滚动条出现消失动画 */
        .custom-scrollbar::-webkit-scrollbar {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .custom-scrollbar:hover::-webkit-scrollbar {
          opacity: 1;
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      {/* 右键菜单 */}
      {contextMenu.show && (
        <div
          className={`fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[140px] ${
            contextMenu.isClosing ? 'context-menu-exit' : 'context-menu-enter'
          }`}
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedImageIds.size > 0 && (
            <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-100 mb-1">
              已选择 {selectedImageIds.size} 张图片
            </div>
          )}
          <button
            onClick={handleBatchDownload}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{selectedImageIds.size > 0 ? `下载选中 (${selectedImageIds.size})` : '下载'}</span>
          </button>
          <button
            onClick={handleBatchClose}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>{selectedImageIds.size > 0 ? `关闭选中 (${selectedImageIds.size})` : '关闭'}</span>
          </button>
          <button
            onClick={handleBatchReset}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{selectedImageIds.size > 0 ? `重置选中 (${selectedImageIds.size})` : '重置'}</span>
          </button>
        </div>
      )}

      {/* Image Modal - 图片放大显示 */}
      {showImageModal && currentImage && (
        <div 
          className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
            imageModalClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleCloseImageModal}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <img
              src={currentImage.url}
              alt="放大显示"
              className={`max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-300 ${
                imageModalClosing ? 'opacity-0' : 'opacity-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleCloseImageModal}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;