declare module 'piexifjs' {
  interface ExifDict {
    [key: string]: any;
    '0th'?: { [key: number]: any };
    'Exif'?: { [key: number]: any };
    'GPS'?: { [key: number]: any };
    '1st'?: { [key: number]: any };
    'thumbnail'?: any;
  }

  interface PiexifStatic {
    ExifIFD: {
      PixelXDimension: number;
      PixelYDimension: number;
      [key: string]: number;
    };
    
    load(jpegData: string): ExifDict;
    dump(exifDict: ExifDict): string;
    insert(exifBytes: string, jpegData: string): string;
    remove(jpegData: string): string;
  }

  const piexif: PiexifStatic;
  export default piexif;
}