import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
  roomCode: string;
  size?: number;
  className?: string;
  showDetails?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  roomCode,
  size = 200,
  className = '',
  showDetails = true
}) => {
  const [qrSrc, setQrSrc] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    QRCode.toDataURL(
      url,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      },
      (err, dataUrl) => {
        if (!err && dataUrl) {
          setQrSrc(dataUrl);
        }
      }
    );
  }, [url, size]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/30 transition-transform hover:scale-105 duration-300">
        {qrSrc ? (
          <img
            src={qrSrc}
            alt={`QR Code para a sala ${roomCode}`}
            width={size}
            height={size}
            className="rounded-xl block"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-sm animate-pulse"
          >
            Gerando QR...
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 text-center">
          <div className="text-xs uppercase tracking-widest text-indigo-300 font-semibold mb-1">
            Código PIN da Sala
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-white px-4 py-1.5 bg-indigo-950/80 rounded-xl border border-indigo-500/40 inline-block shadow-inner">
            {roomCode}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Copiar Link de Convite"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Convidado</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
