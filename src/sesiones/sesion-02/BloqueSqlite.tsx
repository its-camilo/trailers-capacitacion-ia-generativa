import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {KineticText} from '../../components/KineticText';
import {ThreeSceneLayer} from '../../components/ThreeSceneLayer';
import {createDatabaseModel} from '../../threejs/createDatabaseModel';
import {FPS} from '../../constants';

/** S02 Bloque 2 (18-28s): MCP SQLite + Northwind. 3D base de datos LIGHT. */
export const BloqueSqlite: React.FC = () => {
  const frame = useCurrentFrame();
  const consultas = ['Customers', 'Orders', 'Products → SQL'];
  return (
    <AbsoluteFill>
      <ThreeSceneLayer
        createModel={createDatabaseModel}
        orbit={{radius: 12.5, height: 5.4, from: -0.3, to: 0.3, pushIn: 2.0}}
        target={[0, 0.6, 0]}
        patternVariant={2}
      />
      <AbsoluteFill
        style={{
          opacity: 0.14,
          fontFamily: 'monospace',
          fontSize: 22,
          color: '#0B63E5',
          padding: 80,
          whiteSpace: 'pre',
          lineHeight: 1.6,
        }}
      >
        {`~/datos/northwind.db\nnpx -y mcp-server-sqlite-npx /ruta/northwind.db\nSELECT * FROM "Order Details" LIMIT 5;`}
      </AbsoluteFill>
      {/* consultas flotantes */}
      <AbsoluteFill style={{opacity: 0.55}}>
        {consultas.map((t, i) => {
          const y = ((frame * (0.7 + i * 0.15) + i * 260) % 1200) - 100;
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: `${10 + i * 26}%`,
                top: y,
                fontSize: 26,
                fontFamily: 'monospace',
                color: 'rgba(11,99,229,0.9)',
                border: '1px solid rgba(11,99,229,0.25)',
                padding: '6px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.78)',
              }}
            >
              {t}
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '40px 230px', gap: 24}}>
        <KineticText fontSize={40} delay={10} color="#0B63E5" fontWeight={700}>
          PASO 1–3 · NORTHWIND
        </KineticText>
        <KineticText fontSize={104} delay={50}>
          MCP SQLITE
        </KineticText>
        <KineticText fontSize={30} delay={140} color="#000000" fontWeight={700} style={{marginTop: 22, padding: '12px 32px'}}>
          ¿Qué tablas hay? → SQL → top 5 productos y ventas por país
        </KineticText>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-end', padding: '40px 150px'}}>
        <div style={{height: 4, background: 'rgba(10,22,40,0.12)', borderRadius: 4}}>
          <div style={{width: `${interpolate(frame, [0, 10 * FPS], [0, 100])}%`, height: '100%', background: '#0B63E5', borderRadius: 4}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
