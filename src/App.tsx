import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WatermarkSettings, AppSettings, WatermarkPreset, ImageData, WatermarkType } from './types';
import { translations, defaultAppSettings } from './i18n';
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


type Language = 'zh' | 'en';



function App() {
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // 控制台输出辅助函数
  const debugLog = (message: string, data?: any) => {
    if (appSettings.enableConsoleOutput) {
      if (data !== undefined) {
        console.log(`[水印工具] ${message}`, data);
      } else {
        console.log(`[水印工具] ${message}`);
      }
    }
  };
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
    type: 'text',
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
    spacingY: appSettings.defaultSpacingY,
    // 图片水印相关设置 - 初始化为空值避免受控/非受控组件警告
    imageData: '',
    imageName: '',
    imageWidth: 0,
    imageHeight: 0
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
      // 检查当前焦点是否在输入框或文本区域中
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      );
      
      // 如果焦点在输入框中，不处理全局快捷键
      if (isInputFocused) {
        return;
      }
      
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
        // Settings are now auto-saved, no need for temp settings
        
        // Update watermark settings with loaded defaults
        setWatermarkSettings({
          type: 'text',
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
          spacingY: parsed.defaultSpacingY || 4,
          // 图片水印相关设置 - 初始化为空值
          imageData: '',
          imageName: '',
          imageWidth: 0,
          imageHeight: 0
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
        debugLog('从本地存储加载预设', parsed);
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
      debugLog('保存预设到本地存储', presets);
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
    
    debugLog(`保存水印预设: ${newPreset.name}`, {
      id: newPreset.id,
      settings: newPreset.settings
    });
    
    setPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setShowPresetModal(false);
  };

  const loadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      debugLog(`加载水印预设: ${preset.name}`, {
        id: preset.id,
        settings: preset.settings
      });
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
      debugLog('本地字体访问API不支持');
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
      debugLog(`加载了 ${uniqueFonts.length} 个本地字体`);
    } catch (error) {
      console.error('Failed to load local fonts:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        debugLog('用户拒绝访问本地字体权限');
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

    debugLog(`开始上传 ${files.length} 个文件`, files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
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
            
            debugLog(`HEIC/HEIF文件转换完成: ${file.name} -> JPEG`);
          } catch (conversionError) {
            console.error('Failed to convert HEIC/HEIF file:', conversionError);
            // 如果转换失败，尝试直接使用原文件
            debugLog('尝试直接使用原始HEIC/HEIF文件');
          }
        }
        
        const img = new Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${processedFile.name}`));
          img.src = url;
        });

        // 根据设置决定水印文本
        const finalWatermarkSettings = { ...watermarkSettings };
        if (appSettings.useFilenameAsWatermark) {
          // 使用文件名作为水印文本（去除扩展名）
          const filename = processedFile.name;
          const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.')) || filename;
          finalWatermarkSettings.text = nameWithoutExtension;
        }

        const imageData: ImageData = {
          id: `${Date.now()}-${Math.random()}`,
          file: processedFile,
          url,
          image: img,
          watermarkSettings: finalWatermarkSettings,
          originalFile: isHeicFormat ? file : undefined // 保存原始HEIC文件引用
        };
        
        newImages.push(imageData);
      }

      setImages(prev => {
        const updatedImages = [...prev, ...newImages];
        const newIndex = updatedImages.length - 1;
        setCurrentImageIndex(newIndex);
        // 同步更新当前水印设置为新上传图片的设置
        if (newImages.length > 0) {
          setWatermarkSettings(newImages[newImages.length - 1].watermarkSettings);
        }
        return updatedImages;
      });
      
      debugLog(`成功上传 ${newImages.length} 个图片`, newImages.map(img => ({ 
        id: img.id, 
        name: img.file.name, 
        size: `${img.image.width}x${img.image.height}`,
        watermarkText: img.watermarkSettings.text
      })));
      
      // Add fade-in animation delay
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
      
    } catch (error) {
      console.error('Error loading images:', error);
      setIsLoading(false);
    }
  };

  // 处理水印图片上传
  const handleWatermarkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // 创建图片对象来获取尺寸
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        // 转换为base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = canvas.toDataURL();
        
        // 更新水印设置
        updateSetting('imageData', imageData);
        updateSetting('imageName', file.name);
        updateSetting('imageWidth', img.width);
        updateSetting('imageHeight', img.height);
        
        // 清理URL
        URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        console.error('Failed to load watermark image');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error uploading watermark image:', error);
    }
    
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  // 优化的水印绘制函数，提高渲染性能
  const drawWatermark = useCallback(() => {
    if (!currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false }); // 支持透明通道，优化性能
    if (!ctx) return;

    const { image } = currentImage;
    // 使用 latestSettingsRef 获取最新设置，避免状态更新延迟
    const settings = latestSettingsRef.current;
    
    // 性能优化：启用图像平滑
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 图片水印绘制函数
    const drawImageWatermark = (ctx: CanvasRenderingContext2D, watermarkImg: HTMLImageElement, settings: WatermarkSettings, image: HTMLImageElement) => {
      // 计算字体大小用于图片水印尺寸
      const baseFontSize = settings.size;
      
      // 计算图片水印尺寸
      const imgAspectRatio = watermarkImg.width / watermarkImg.height;
      let watermarkWidth, watermarkHeight;
      
      if (appSettings.fontSizeUnit === 'percent') {
        // 百分比模式：基于图片宽度的百分比
        watermarkWidth = (image.width * baseFontSize) / 100;
        // 图片水印默认保持宽高比
        watermarkHeight = watermarkWidth / imgAspectRatio;
      } else {
        // 像素模式：直接使用像素值
        watermarkWidth = Math.max(10, Math.min(image.width, baseFontSize));
        // 图片水印默认保持宽高比
        watermarkHeight = watermarkWidth / imgAspectRatio;
      }
      
      // 绘制图片水印
      if (settings.position === 'full-screen') {
        // 全屏模式
        const spacingX = watermarkWidth + settings.spacingX;
        const spacingY = watermarkHeight + settings.spacingY;
        const offsetX = (settings.offsetX / 100) * canvas.width;
        const offsetY = (settings.offsetY / 100) * canvas.height;
        
        const cols = Math.ceil(canvas.width / spacingX) + 2;
        const rows = Math.floor(canvas.height / spacingY) + 2;
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * spacingX - spacingX / 2 + offsetX;
            const y = row * spacingY + offsetY;
            
            ctx.save();
            ctx.translate(x + watermarkWidth / 2, y + watermarkHeight / 2);
            ctx.rotate((settings.rotation * Math.PI) / 180);
            ctx.drawImage(watermarkImg, -watermarkWidth / 2, -watermarkHeight / 2, watermarkWidth, watermarkHeight);
            ctx.restore();
          }
        }
      } else {
        // 单个水印模式
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const angle = (settings.rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(angle));
        const cos = Math.abs(Math.cos(angle));
        const rotatedWidth = watermarkWidth * cos + watermarkHeight * sin;
        const rotatedHeight = watermarkWidth * sin + watermarkHeight * cos;
        
        const safeWidth = canvas.width - rotatedWidth;
        const safeHeight = canvas.height - rotatedHeight;
        
        const offsetX = (settings.offsetX / 100) * (safeWidth / 2);
        const offsetY = (settings.offsetY / 100) * (safeHeight / 2);
        
        const x = centerX + offsetX;
        const y = centerY - offsetY;
        
        const clampedX = Math.max(rotatedWidth / 2, Math.min(x, canvas.width - rotatedWidth / 2));
        const clampedY = Math.max(rotatedHeight / 2, Math.min(y, canvas.height - rotatedHeight / 2));
        
        ctx.save();
        ctx.translate(clampedX, clampedY);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.drawImage(watermarkImg, -watermarkWidth / 2, -watermarkHeight / 2, watermarkWidth, watermarkHeight);
        ctx.restore();
      }
    };

    // 获取预览容器的尺寸 - 查找最外层的预览容器
    let container = canvas.parentElement;
    while (container && !container.classList.contains('bg-white')) {
      container = container.parentElement;
    }
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    // 减去一些padding，确保有足够的边距
    const containerWidth = Math.max(200, containerRect.width);
    const containerHeight = Math.max(200, containerRect.height);
    
    // 计算图片的缩放比例以完整铺满容器
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const scale = Math.min(scaleX, scaleY); // 保持宽高比，适应容器
    
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

    // 根据水印类型设置样式
    if (settings.type === 'image' && settings.imageData) {
      // 图片水印处理
      ctx.globalAlpha = settings.opacity;
      
      // 使用缓存的图片对象，避免重复加载导致闪烁
      const cacheKey = settings.imageData;
      let watermarkImg = watermarkImageCache.current.get(cacheKey);
      
      if (watermarkImg && watermarkImg.complete && watermarkImg.naturalWidth > 0) {
        // 图片已缓存且加载完成，直接绘制
        drawImageWatermark(ctx, watermarkImg, settings, image);
      } else {
        // 图片未缓存或未加载完成，创建新的图片对象
        watermarkImg = new Image();
        watermarkImg.crossOrigin = 'anonymous'; // 避免跨域问题
        watermarkImg.onload = () => {
          // 缓存图片对象
          watermarkImageCache.current.set(cacheKey, watermarkImg!);
          // 使用requestAnimationFrame确保在下一帧绘制，避免阻塞
          requestAnimationFrame(() => {
            drawImageWatermark(ctx, watermarkImg!, settings, image);
          });
        };
        watermarkImg.onerror = () => {
          console.warn('水印图片加载失败');
        };
        watermarkImg.src = settings.imageData;
      }
      
      ctx.globalAlpha = 1;
      return; // 图片水印处理完毕，直接返回
    }
    

    
    // 文字水印处理
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
    
    debugLog(`开始下载图片: ${currentImage.file.name}`, {
      originalSize: `${currentImage.image.width}x${currentImage.image.height}`,
      watermarkText: currentImage.watermarkSettings.text,
      position: currentImage.watermarkSettings.position
    });
    
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
          debugLog('检测到HEIC格式，使用exifreader提取EXIF信息...');
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
            debugLog(`成功从HEIC文件提取EXIF信息: 总共${Object.keys(tags).length}个标签，映射了${mappedCount}个标签`);
            
            // 输出未映射的标签以便调试
            const unmappedTags = Object.keys(tags).filter(tagName => !tagMapping[tagName]);
            if (unmappedTags.length > 0) {
              debugLog('未映射的EXIF标签:', unmappedTags.slice(0, 10)); // 只显示前10个
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
            debugLog('成功从JPEG文件提取EXIF信息');
          } catch (exifError) {
            debugLog('原始图片没有EXIF信息或格式不支持:', exifError);
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
          
          debugLog('成功保留EXIF信息到导出图片');
        }
      } catch (error) {
        console.error('处理EXIF信息时出错:', error);
        // 如果处理EXIF失败，继续使用原始dataURL
      }
    }
    
    const fileName = `watermarked-${currentImage.file.name.replace(/\.[^/.]+$/, fileExtension)}`;
    link.download = fileName;
    link.href = dataURL;
    link.click();
    
    debugLog(`图片下载完成: ${fileName}`, {
      format: outputFormat,
      quality: quality,
      hasExif: outputFormat === 'image/jpeg'
    });
  };

  // 使用 useRef 跟踪最新的设置值，避免频繁的状态更新
  const latestSettingsRef = useRef(watermarkSettings);
  const watermarkImageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const drawTimeoutRef = useRef<number>();
  const isComposing = useRef(false);
  const animationFrameRef = useRef<number>();
  
  // 优化的设置更新函数，特别针对拖动调整的场景
  const updateSetting = (key: keyof WatermarkSettings, value: string | number | undefined) => {
    debugLog(`更新水印设置: ${key} = ${value}`);
    
    if (key === 'position' && value === 'full-screen') {
      setWatermarkSettings(prev => ({
        ...prev,
        position: 'full-screen',
        rotation: -30,
      }));
      debugLog('切换到全屏水印模式，自动设置旋转角度为 -30°');
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
    
    const updateState = () => {
      setWatermarkSettings(newSettings);
      
      // 更新当前图片设置
      if (currentImage) {
        setImages(prev => prev.map(img => 
          img.id === currentImage.id 
            ? { ...img, watermarkSettings: newSettings }
            : img
        ));
      }
    };

    // For text input, update immediately to avoid issues with IME
    if (key === 'text') {
      updateState();
    } else {
      // 清除之前的定时器和动画帧
      if (drawTimeoutRef.current) {
        clearTimeout(drawTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // 对于图片水印的参数调整，使用更短的防抖延迟和requestAnimationFrame优化
      if (newSettings.type === 'image' && newSettings.imageData) {
        // 使用更短的防抖延迟（20ms）提高响应性
        drawTimeoutRef.current = window.setTimeout(() => {
          // 在防抖后使用requestAnimationFrame确保在下一帧更新
          animationFrameRef.current = requestAnimationFrame(() => {
            updateState();
          });
        }, 20); // 减少到20ms防抖延迟
      } else {
        // Use requestAnimationFrame for other controls to optimize performance
        animationFrameRef.current = requestAnimationFrame(updateState);
      }
    }
  };
  
  // 同步 latestSettingsRef 和 watermarkSettings
  useEffect(() => {
    latestSettingsRef.current = watermarkSettings;
  }, [watermarkSettings]);
  
  // 清理函数：组件卸载时清理定时器和动画帧，避免内存泄漏
  useEffect(() => {
    return () => {
      if (drawTimeoutRef.current) {
        clearTimeout(drawTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const handleResetSettings = () => {
    setAppSettings(defaultAppSettings);
    localStorage.setItem('watermark-app-settings', JSON.stringify(defaultAppSettings));
  };

  const updateAppSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...appSettings, [key]: value };
    setAppSettings(newSettings);
    localStorage.setItem('watermark-app-settings', JSON.stringify(newSettings));
    
    // Update current watermark settings if they match defaults
    if (key === 'defaultWatermark' && watermarkSettings.text === appSettings.defaultWatermark) {
      setWatermarkSettings(prev => ({ ...prev, text: value }));
    }
  };

  const resetToDefaults = () => {
    const newSettings = {
      type: 'text' as const,
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
      spacingY: appSettings.defaultSpacingY,
      // 图片水印相关设置 - 重置为空值
      imageData: '',
      imageName: '',
      imageWidth: 0,
      imageHeight: 0
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
      debugLog(`开始批量下载 ${selectedImageIds.size} 个图片`, Array.from(selectedImageIds));
      
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
                  debugLog('检测到HEIC格式，使用exifreader提取EXIF信息...');
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
                     debugLog(`成功从HEIC文件提取EXIF信息: 总共${Object.keys(tags).length}个标签，映射了${mappedCount}个标签`);
                     
                     // 输出未映射的标签以便调试
                     const unmappedTags = Object.keys(tags).filter(tagName => !tagMapping[tagName]);
                     if (unmappedTags.length > 0) {
                       debugLog('未映射的EXIF标签:', unmappedTags.slice(0, 10)); // 只显示前10个
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
                    debugLog('成功从JPEG文件提取EXIF信息');
                  } catch (exifError) {
                    debugLog('原始图片没有EXIF信息或格式不支持:', exifError);
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
                  
                  debugLog('成功保留EXIF信息到导出图片');
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
              type: 'text' as WatermarkType,
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
              spacingY: appSettings.defaultSpacingY || 4,
              imageData: undefined,
              imageName: undefined,
              imageWidth: undefined,
              imageHeight: undefined
            } as WatermarkSettings
          };
        }
        return img;
      });
      setImages(newImages);
      
      // 如果当前图片在选中列表中，也更新当前的水印设置
      if (currentImage && selectedImageIds.has(currentImage.id)) {
        setWatermarkSettings({
          type: 'text' as WatermarkType,
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
          spacingY: appSettings.defaultSpacingY || 4,
          imageData: undefined,
          imageName: undefined,
          imageWidth: undefined,
          imageHeight: undefined
        } as WatermarkSettings);
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
              {isLoading && images.length === 0 ? (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-600">{t.loadingImages}</p>
                  </div>
                </div>
              ) : images.length === 0 ? (
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
                    onChange={(e) => { setIsLoading(true); handleImageUpload(e); }}
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
                    onChange={(e) => { setIsLoading(true); handleImageUpload(e); }}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 0 && (
            <div className="hidden md:flex bg-white border-t border-gray-200 p-4 min-h-[112px] flex-shrink-0" onContextMenu={handleThumbnailContextMenu}>
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

                {/* Watermark Type Selection */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Type className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-semibold text-gray-900">水印类型</h3>
                  </div>
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => updateSetting('type', 'text')}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm flex items-center justify-center space-x-2 ${
                        watermarkSettings.type === 'text'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Type className="w-4 h-4" />
                      <span>文字水印</span>
                    </button>
                    <button
                      onClick={() => updateSetting('type', 'image')}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all text-sm flex items-center justify-center space-x-2 ${
                        watermarkSettings.type === 'image'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>图片水印</span>
                    </button>
                  </div>
                  
                  {/* Text Watermark Content */}
                  {watermarkSettings.type === 'text' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">{t.watermarkText}</label>
                      <textarea
                        value={watermarkSettings.text}
                        onChange={(e) => updateSetting('text', e.target.value)}
                        onCompositionStart={() => isComposing.current = true}
                        onCompositionEnd={(e) => {
                          isComposing.current = false;
                          updateSetting('text', (e.target as HTMLTextAreaElement).value);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm resize-vertical min-h-[60px]"
                        placeholder={t.enterWatermarkText}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {/* Image Watermark Content */}
                  {watermarkSettings.type === 'image' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">水印图片</label>
                        <div className="flex items-center space-x-3">
                          <label className="flex-1 cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                              {watermarkSettings.imageData ? (
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={watermarkSettings.imageData} 
                                    alt="水印预览" 
                                    className="w-8 h-8 object-contain rounded"
                                  />
                                  <span className="text-sm text-gray-600">
                                    {watermarkSettings.imageName || '已选择图片'}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center space-y-1">
                                  <Upload className="w-6 h-6 text-gray-400" />
                                  <span className="text-sm text-gray-600">点击上传图片</span>
                                  <span className="text-xs text-gray-400">支持 PNG, JPG, SVG</span>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*,.svg"
                              onChange={handleWatermarkImageUpload}
                              className="hidden"
                            />
                          </label>
                          {watermarkSettings.imageData && (
                            <button
                              onClick={() => {
                                updateSetting('imageData', undefined);
                                updateSetting('imageName', undefined);
                                updateSetting('imageWidth', undefined);
                                updateSetting('imageHeight', undefined);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除图片"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Maintain Aspect Ratio */}

                    </div>
                  )}
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

                    {/* Color - Only for text watermarks */}
                    {watermarkSettings.type === 'text' && (
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
                    )}

                    {/* Font Family - Only for text watermarks */}
                    {watermarkSettings.type === 'text' && (
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
                    )}
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
                  onClick={() => setShowSettingsModal(false)}
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
                      value={appSettings.language}
                      onChange={(e) => updateAppSetting('language', e.target.value as Language)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <option value="zh">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Default Settings */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">{translations[appSettings.language].defaultSettings}</h3>
                  
                  <div className="space-y-4">
                    {/* Default Watermark Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].defaultWatermark}
                        </label>
                        <input
                          type="text"
                          value={appSettings.defaultWatermark}
                          onChange={(e) => updateAppSetting('defaultWatermark', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                    {/* Use Filename as Watermark */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {translations[appSettings.language].useFilenameAsWatermark}
                          </label>
                          <p className="text-xs text-gray-500">
                            {translations[appSettings.language].useFilenameAsWatermarkDescription}
                          </p>
                        </div>
                        <div className="ml-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appSettings.useFilenameAsWatermark}
                              onChange={(e) => updateAppSetting('useFilenameAsWatermark', e.target.checked)}
                              className="sr-only peer"
                            />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Default Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[appSettings.language].defaultPosition}
                      </label>
                      <select
                        value={appSettings.defaultPosition}
                        onChange={(e) => updateAppSetting('defaultPosition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {positions.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {translations[appSettings.language].positions[pos.id as keyof typeof translations.zh.positions]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Default Style Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].size}
                        </label>
                        <input
                          type="number"
                          value={appSettings.defaultSize}
                          onChange={(e) => updateAppSetting('defaultSize', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].fontSizeUnit}
                        </label>
                        <select
                          value={appSettings.fontSizeUnit}
                          onChange={(e) => updateAppSetting('fontSizeUnit', e.target.value as 'px' | 'percent')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="percent">{translations[appSettings.language].fontSizeUnitPercent}</option>
                          <option value="px">{translations[appSettings.language].fontSizeUnitPx}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].rotation}
                        </label>
                        <input
                          type="number"
                          value={appSettings.defaultRotation}
                          onChange={(e) => updateAppSetting('defaultRotation', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].opacity}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={appSettings.defaultOpacity}
                          onChange={(e) => updateAppSetting('defaultOpacity', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].color}
                        </label>
                        <input
                          type="color"
                          value={appSettings.defaultColor}
                          onChange={(e) => updateAppSetting('defaultColor', e.target.value)}
                          className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Default Font */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[appSettings.language].font}
                      </label>
                      <select
                        value={appSettings.defaultFontFamily}
                        onChange={(e) => updateAppSetting('defaultFontFamily', e.target.value)}
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
                          {translations[appSettings.language].offsetX}
                        </label>
                        <input
                          type="number"
                          value={appSettings.defaultOffsetX}
                          onChange={(e) => updateAppSetting('defaultOffsetX', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].offsetY}
                        </label>
                        <input
                          type="number"
                          value={appSettings.defaultOffsetY}
                          onChange={(e) => updateAppSetting('defaultOffsetY', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Default Spacing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].spacingX}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={appSettings.defaultSpacingX}
                          onChange={(e) => updateAppSetting('defaultSpacingX', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translations[appSettings.language].spacingY}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={appSettings.defaultSpacingY}
                          onChange={(e) => updateAppSetting('defaultSpacingY', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Range Settings */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">{translations[appSettings.language].rangeSettings}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[appSettings.language].minSize}
                      </label>
                      <input
                        type="number"
                        value={appSettings.minSize}
                        onChange={(e) => updateAppSetting('minSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[appSettings.language].maxSize}
                      </label>
                      <input
                        type="number"
                        value={appSettings.maxSize}
                        onChange={(e) => updateAppSetting('maxSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[appSettings.language].minOpacity}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={appSettings.minOpacity}
                        onChange={(e) => updateAppSetting('minOpacity', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {translations[appSettings.language].maxOpacity}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={appSettings.maxOpacity}
                        onChange={(e) => updateAppSetting('maxOpacity', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{translations[appSettings.language].exportFormat}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations[appSettings.language].exportFormat}
                    </label>
                    <select
                      value={appSettings.exportFormat}
                      onChange={(e) => updateAppSetting('exportFormat', e.target.value as 'auto' | 'jpeg' | 'png' | 'webp')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="auto">{translations[appSettings.language].formatAuto}</option>
                      <option value="jpeg">{translations[appSettings.language].formatJpeg}</option>
                      <option value="png">{translations[appSettings.language].formatPng}</option>
                      <option value="webp">{translations[appSettings.language].formatWebp}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations[appSettings.language].exportQuality}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={appSettings.exportQuality}
                        onChange={(e) => updateAppSetting('exportQuality', parseFloat(e.target.value))}
                        onDoubleClick={() => updateAppSetting('exportQuality', defaultAppSettings.exportQuality)}
                        className="flex-1"
                        disabled={appSettings.exportFormat === 'png'}
                        title="双击恢复默认值"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {Math.round(appSettings.exportQuality * 100)}%
                      </span>
                    </div>
                    {appSettings.exportFormat === 'png' && (
                      <p className="text-xs text-gray-500 mt-1">
                        PNG格式无损压缩，不需要质量设置
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Developer Settings */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-4 h-4 text-green-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {appSettings.language === 'zh' ? '开发者设置' : 'Developer Settings'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {translations[appSettings.language].enableConsoleOutput}
                      </label>
                      <p className="text-xs text-gray-500">
                        {translations[appSettings.language].consoleOutputDescription}
                      </p>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={appSettings.enableConsoleOutput}
                          onChange={(e) => updateAppSetting('enableConsoleOutput', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  

                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-center items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleResetSettings}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {translations[appSettings.language].reset}
                </button>
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