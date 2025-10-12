'use client';

import React from 'react';

interface OrbitalLoaderProps {
  overlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OrbitalLoader: React.FC<OrbitalLoaderProps> = ({
  overlay = false,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const orbeSizes = {
    sm: '6px',
    md: '10px',
    lg: '14px'
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className={`orbital-loader-wrapper ${className}`}>
            <div className={`orbital-loader ${sizeClasses[size]}`}>
              <div className="orbe" style={{ '--index': 0, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
              <div className="orbe" style={{ '--index': 1, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
              <div className="orbe" style={{ '--index': 2, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
              <div className="orbe" style={{ '--index': 3, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
              <div className="orbe" style={{ '--index': 4, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
            </div>
            <div className="mt-4 text-center">
              <div className="text-navy-900 font-medium">Loading...</div>
              <div className="text-charcoal-600 text-sm">Please wait</div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .orbital-loader-wrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          
          .orbital-loader {
            position: relative;
            transform: rotate(45deg);
          }

          .orbe {
            position: absolute;
            width: 100%;
            height: 100%;
            --delay: calc(var(--index) * 0.1s);
            animation: orbit7456 ease-in-out 1.5s var(--delay) infinite;
            opacity: calc(1 - calc(0.15 * var(--index)));
          }

          .orbe::after {
            position: absolute;
            content: '';
            top: 0;
            left: 0;
            width: var(--orbe-size);
            height: var(--orbe-size);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            box-shadow: 0px 0px 15px 2px rgba(255, 215, 0, 0.4);
            border-radius: 50%;
          }

          @keyframes orbit7456 {
            0% {}
            80% {
              transform: rotate(360deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`orbital-loader-wrapper ${className}`}>
      <div className={`orbital-loader ${sizeClasses[size]}`}>
        <div className="orbe" style={{ '--index': 0, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 1, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 2, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 3, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 4, '--orbe-size': orbeSizes[size] } as React.CSSProperties} />
      </div>

      <style jsx>{`
        .orbital-loader-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .orbital-loader {
          position: relative;
          transform: rotate(45deg);
        }

        .orbe {
          position: absolute;
          width: 100%;
          height: 100%;
          --delay: calc(var(--index) * 0.1s);
          animation: orbit7456 ease-in-out 1.5s var(--delay) infinite;
          opacity: calc(1 - calc(0.15 * var(--index)));
        }

        .orbe::after {
          position: absolute;
          content: '';
          top: 0;
          left: 0;
          width: var(--orbe-size);
          height: var(--orbe-size);
          background: linear-gradient(135deg, #FFD700, #FFA500);
          box-shadow: 0px 0px 15px 2px rgba(255, 215, 0, 0.4);
          border-radius: 50%;
        }

        @keyframes orbit7456 {
          0% {}
          80% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default OrbitalLoader;