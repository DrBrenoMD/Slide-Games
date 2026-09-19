import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
  roomCode: string;
  size?: number;
  className?: string;
  showDetails?: boolean;
  showActionButtons?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  roomCode,
  size = 140,
  className = '',
  showDetails = true,
  showActionButtons = false
}) => {
  const [qrSrc, setQrSrc] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    QRCode.toDataURL(
      url,
      {
        width: size,
        margin: 1.5,
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
      <div className="p-2 sm:p-2.5 bg-white rounded-xl sm:rounded-2xl shadow-xl border-2 sm:border-4 border-indigo-500/30 transition-transform hover:scale-105 duration-300">
        {qrSrc ? (
          <img
            src={qrSrc}
            alt={`QR Code para a sala ${roomCode}`}
            width={size}
            height={size}
            className="rounded-lg sm:rounded-xl block"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 rounded-lg sm:rounded-xl text-slate-400 text-xs animate-pulse"
          >
            Gerando QR...
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-2 sm:mt-2.5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-0.5 sm:mb-1">
            Código PIN da Sala
          </div>
          <div className="font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white px-3 sm:px-4 py-1 bg-indigo-950/90 rounded-xl border border-indigo-500/40 inline-block shadow-inner">
            {roomCode}
          </div>

          {showActionButtons && (
            <div className="mt-2.5 flex items-center justify-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
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
                className="px-2.5 py-1 text-xs font-medium bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Convidado</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
