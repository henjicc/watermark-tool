// 水印类型
export type WatermarkType = 'text' | 'image';

// 水印设置接口
export interface WatermarkSettings {
  type: WatermarkType; // 水印类型：文本或图片
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
  // 图片水印相关
  imageData?: string; // base64 图片数据
  imageName?: string; // 图片文件名
  imageWidth?: number; // 图片宽度（像素）
  imageHeight?: number; // 图片高度（像素）
  // 图片水印默认保持宽高比，不再需要单独的选项
}

// 应用设置接口
export interface AppSettings {
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
  enableConsoleOutput: boolean;
  useFilenameAsWatermark: boolean;
}

// 水印预设接口
export interface WatermarkPreset {
  id: string;
  name: string;
  settings: WatermarkSettings;
  createdAt: string;
}

// 图片数据接口
export interface ImageData {
  id: string;
  file: File;
  url: string;
  image: HTMLImageElement;
  watermarkSettings: WatermarkSettings;
  canvas?: HTMLCanvasElement;
  originalFile?: File; // 保存原始文件引用（用于HEIC转换后的EXIF处理）
}

// 翻译接口
export interface Translations {
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
    enableConsoleOutput: string;
    consoleOutputDescription: string;
    useFilenameAsWatermark: string;
    useFilenameAsWatermarkDescription: string;
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
    enableConsoleOutput: string;
    consoleOutputDescription: string;
    useFilenameAsWatermark: string;
    useFilenameAsWatermarkDescription: string;
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