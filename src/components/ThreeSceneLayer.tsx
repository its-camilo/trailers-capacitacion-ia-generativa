import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {LightPattern} from './LightPattern';

type Props = {
  /** factory img2threejs: (spec, options) => THREE.Group con userData.updateFrame */
  createModel: (spec?: Record<string, unknown>, options?: Record<string, unknown>) => THREE.Group;
  /** órbita de cámara estilo Blender: [radio, altura, ánguloIni, ánguloFin, pushIn] */
  orbit?: {radius: number; height: number; from: number; to: number; pushIn: number};
  /** punto de mira */
  target?: [number, number, number];
  opacidad?: number;
  /** variante del patrón claro de fondo (0..3) */
  patternVariant?: number;
  children?: React.ReactNode;
};

/**
 * ThreeSceneLayer — capa trasera 3D procedural (img2threejs, sin Blender).
 * Render determinista por frame: useCurrentFrame → group.updateFrame →
 * cámara en órbita → renderer.render. Sin video, sin MP4, sin compresión:
 * aristas a resolución nativa en cada frame del render Remotion.
 */
export const ThreeSceneLayer: React.FC<Props> = ({
  createModel,
  orbit = {radius: 10, height: 4, from: -0.6, to: 0.7, pushIn: 2.0},
  target = [0, 0, 1.6],
  opacidad = 1,
  patternVariant = 0,
  children,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
  } | null>(null);
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  // montar una sola vez
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = 1920;
    const H = 1080;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
    renderer.setPixelRatio(1);
    renderer.setSize(W, H);
    renderer.setClearColor(new THREE.Color(0xf2f5fa), 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2f5fa);
    // niebla sutil Keynote claro (equivale al world de Blender, en modo claro)
    scene.fog = new THREE.FogExp2(0xf2f5fa, 0.012);

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);

    // luces Keynote modo claro (key + rim azul + fill)
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd7e3f4, 1.0));
    const key = new THREE.SpotLight(0xd1e6ff, 900, 60, Math.PI / 4.4, 0.6);
    key.position.set(6, -7, 8);
    scene.add(key);
    const rim = new THREE.RectAreaLight
      ? new THREE.PointLight(0x418cff, 200, 40)
      : new THREE.PointLight(0x418cff, 200, 40);
    rim.position.set(-7, 5, 4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xb3ccff, 60, 30);
    fill.position.set(0, 0, 6);
    scene.add(fill);

    const group = createModel({}, {});
    scene.add(group);

    stateRef.current = {renderer, scene, camera, group};

    return () => {
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
        else if (mat) mat.dispose();
      });
      stateRef.current = null;
    };
  }, [createModel]);

  // render determinista por frame
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const t = durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);
    const ang = orbit.from + (orbit.to - orbit.from) * t;
    const r = orbit.radius - orbit.pushIn * t;
    st.camera.position.set(
      r * Math.cos(ang),
      r * Math.sin(ang) * -1.6,
      orbit.height - 0.8 * t,
    );
    st.camera.lookAt(new THREE.Vector3(...target));
    const update = (st.group.userData.updateFrame as ((f: number, fps: number, dur: number) => void) | undefined);
    if (typeof update === 'function') update(frame, fps, durationInFrames);
    st.renderer.render(st.scene, st.camera);
  }, [frame, fps, durationInFrames, orbit, target]);

  return (
    <AbsoluteFill style={{backgroundColor: '#F2F5FA'}}>
      <AbsoluteFill style={{opacity: opacidad}}>
        <div ref={mountRef} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      {/* textura clara procedural (dots + cruces + hatch + blobs) */}
      <LightPattern variant={patternVariant} />
      {/* viñeta cinematográfica clara */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(10,22,40,0.16) 100%)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
