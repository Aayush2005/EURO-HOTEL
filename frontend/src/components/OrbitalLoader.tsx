'use client';

import React from 'react';

const OrbitalLoader = () => {
  return (
    <div className="orbital-loader-wrapper">
      <div className="orbital-loader">
        <div className="orbe" style={{ '--index': 0 } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 1 } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 2 } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 3 } as React.CSSProperties} />
        <div className="orbe" style={{ '--index': 4 } as React.CSSProperties} />
      </div>
      
      <style jsx>{`
        .orbital-loader-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .orbital-loader {
          --size-loader: 50px;
          --size-orbe: 10px;
          width: var(--size-loader);
          height: var(--size-loader);
          position: relative;
          transform: rotate(45deg);
        }

        .orbe {
          position: absolute;
          width: 100%;
          height: 100%;
          --delay: calc(var(--index) * 0.1s);
          animation: orbit7456 ease-in-out 1.5s var(--delay) infinite;
          opacity: calc(1 - calc(0.2 * var(--index)));
        }

        .orbe::after {
          position: absolute;
          content: '';
          top: 0;
          left: 0;
          width: var(--size-orbe);
          height: var(--size-orbe);
          background-color: #FFD700;
          box-shadow: 0px 0px 20px 2px #C9A227;
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