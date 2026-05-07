import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import { FileText, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface DocxViewerProps {
  fileUrl: string;
  documentName: string;
  className?: string;
}

interface DocxViewerState {
  content: string;
  loading: boolean;
  error: string | null;
  fileExists: boolean;
  retryCount: number;
}

const DocxViewer: React.FC<DocxViewerProps> = ({
  fileUrl,
  documentName,
  className = ''
}) => {
  const [state, setState] = useState<DocxViewerState>({
    content: '',
    loading: true,
    error: null,
    fileExists: false,
    retryCount: 0
  });

  const loadDocxFile = async (retryAttempt = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        retryCount: retryAttempt ? prev.retryCount + 1 : prev.retryCount 
      }));

      console.log('[DocxViewer] Attempting to load file:', fileUrl, 'Retry attempt:', retryAttempt);

      // First check if the file exists by doing a HEAD request
      const headResponse = await fetch(fileUrl, { method: 'HEAD' });
      console.log('[DocxViewer] HEAD request response:', headResponse.status, headResponse.statusText);
      
      if (!headResponse.ok) {
        throw new Error(`File not found (${headResponse.status}): ${fileUrl}`);
      }

      setState(prev => ({ ...prev, fileExists: true }));

      // Now fetch the actual file
      const response = await fetch(fileUrl);
      console.log('[DocxViewer] GET request response:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      // Get the file as ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      console.log('[DocxViewer] File loaded, size:', arrayBuffer.byteLength, 'bytes');

      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          // Configure mammoth options for better output
          styleMap: [
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => h2:fresh"
          ],
          // Include embedded images
          includeDefaultStyleMap: true
        }
      );

      if (result.messages.length > 0) {
        console.warn('[DocxViewer] Mammoth conversion messages:', result.messages);
      }

      // Sanitize the HTML output
      const sanitizedHtml = DOMPurify.sanitize(result.value, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's',
          'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'div', 'span', 'blockquote',
          'a', 'img'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'style',
          'colspan', 'rowspan', 'width', 'height'
        ],
        ALLOW_DATA_ATTR: false,
        FORBID_ATTR: ['onclick', 'onload', 'onerror'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed']
      });

      setState({
        content: sanitizedHtml,
        loading: false,
        error: null,
        fileExists: true,
        retryCount: 0
      });

      console.log('[DocxViewer] Successfully loaded and converted DOCX:', documentName);

    } catch (error) {
      console.error('[DocxViewer] Error loading DOCX file:', error);
      setState({
        content: '',
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        fileExists: false,
        retryCount: retryAttempt ? state.retryCount + 1 : state.retryCount
      });
    }
  };

  useEffect(() => {
    if (fileUrl && documentName) {
      loadDocxFile();
    }
  }, [fileUrl, documentName]);

  const handleRetry = () => {
    loadDocxFile(true);
  };

  if (state.loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-secondary mb-4" />
        <p className="text-muted-foreground">Loading document...</p>
        {state.retryCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Retry attempt: {state.retryCount}
          </p>
        )}
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 p-6 ${className}`}>
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Document</h3>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>File:</strong> {documentName}<br />
              <strong>Location:</strong> {fileUrl}<br />
              <strong>Status:</strong> {state.fileExists ? 'File exists' : 'File not found'}
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>

          {state.error.includes('404') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> If you're seeing a 404 error, try clearing your browser storage using the storage clearer tool at <code>/clear-storage.html</code>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!state.content) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  return (
    <div className={`docx-content ${className}`}>
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        {/* Document Header */}
        <div className="bg-secondary/5 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-secondary" />
            <div>
              <h2 className="font-semibold text-foreground">{documentName}</h2>
              <p className="text-sm text-muted-foreground">DOCX Document</p>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert
                       prose-headings:text-foreground prose-p:text-foreground
                       prose-strong:text-foreground prose-em:text-muted-foreground
                       prose-a:text-secondary hover:prose-a:text-secondary/80
                       prose-ul:text-foreground prose-ol:text-foreground
                       prose-li:text-foreground prose-blockquote:text-foreground
                       prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground
                       prose-img:rounded-lg prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: state.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default DocxViewer;