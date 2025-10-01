declare module 'formidable' {
  import { IncomingMessage } from 'http';

  interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size?: number;
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  interface IncomingForm {
    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;
  }

  function formidable(options?: Record<string, unknown>): IncomingForm;

  export default formidable;
  export { File };
}
