import React, { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  opacity?: number;
}

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ opacity = 0.85 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;

    const syncSize = () => {
      const w = window.innerWidth || document.documentElement.clientWidth || 1280;
      const h = window.innerHeight || document.documentElement.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    // Try WebGL first
    const gl = (canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' }) ||
      canvas.getContext('experimental-webgl', { alpha: false, antialias: false })) as WebGLRenderingContext | null;

    if (gl) {
      // WEBGL IMPLEMENTATION FROM Image_4_eddb1652.html
      const vs = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          v_texCoord = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const fs = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        varying vec2 v_texCoord;

        // Pill function for rounded vertical slats
        float pill(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
        }

        void main() {
          vec2 aspectCoord = gl_FragCoord.xy;
          
          // Grid parameters for micro-slats
          float slatW = 10.0;
          float slatH = 26.0;
          float gap = 3.5;
          vec2 pitch = vec2(slatW + gap, slatH + gap);
          
          // Grid position
          vec2 cell = floor(aspectCoord / pitch);
          vec2 cellLocal = mod(aspectCoord, pitch) - pitch * 0.5;
          
          // MicroSlats wave simulation matching React Bits component
          float normY = gl_FragCoord.y / u_resolution.y;
          float normX = gl_FragCoord.x / u_resolution.x;
          
          // Mouse interaction / ripple
          vec2 mouseNorm = u_mouse / u_resolution;
          float distToMouse = length(vec2(normX - mouseNorm.x, (normY - mouseNorm.y) * (u_resolution.y / u_resolution.x)));
          float mouseSplat = exp(-distToMouse * distToMouse * 35.0);
          
          // Swell wave harmonics
          float t = u_time * 0.9;
          vec2 world = vec2(cell.x * 0.055, cell.y * 0.04);
          
          // Directional heading angles
          float wave1 = sin(world.x * 1.8 + world.y * 2.2 - t + sin(world.y * 0.5 + t * 0.4));
          float wave2 = cos(world.x * 2.5 - world.y * 1.6 - t * 1.25);
          float wave3 = sin((world.x + world.y) * 1.4 - t * 0.7);
          
          float waveHeight = (wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.25);
          waveHeight += mouseSplat * 1.2;
          
          float level = clamp(0.5 + 0.5 * waveHeight, 0.0, 1.0);
          
          // Slats pill dimensions & roundness
          vec2 halfSize = vec2(slatW * 0.46, slatH * 0.46 * mix(0.7, 1.15, level));
          float radius = 0.75 * min(halfSize.x, halfSize.y);
          float dist = pill(cellLocal, halfSize, radius);
          float alpha = clamp(0.5 - dist * 1.2, 0.0, 1.0);
          
          // Palette: Base deep purple background, vibrant neon magenta/pink (#ff1a8c), glint orange (#ff8703)
          vec3 deepDarkBg = vec3(0.04, 0.015, 0.08); // #0a0414
          vec3 ambientPurple = vec3(0.12, 0.03, 0.22);
          vec3 slatBaseColor = vec3(0.85, 0.08, 0.48); // Neon pink/magenta
          vec3 glintOrange = vec3(1.0, 0.52, 0.02); // Glint warm gold/orange
          vec3 highlightWhite = vec3(1.0, 0.92, 0.95);
          
          // Spatial gradient: brighter energetic wave on the top-right / right side matching reference
          float spatialIntensity = smoothstep(-0.2, 1.1, normX * 0.85 + (1.0 - normY) * 0.35);
          float waveCrest = smoothstep(0.45, 0.95, level);
          
          // Color mixing
          vec3 slatCol = mix(slatBaseColor, glintOrange, pow(waveCrest, 1.5) * 0.85);
          slatCol = mix(slatCol, highlightWhite, pow(waveCrest, 4.0) * 0.4);
          
          // Modulate slat intensity by spatial map and wave height
          float slatBrightness = mix(0.12, 1.0, spatialIntensity) * mix(0.3, 1.25, level);
          slatBrightness += mouseSplat * 0.8;
          
          // Background gradient: vignette from deep black-purple to ambient purple glow
          vec3 bg = mix(deepDarkBg, ambientPurple, spatialIntensity * 0.45);
          
          // Final composite
          vec3 finalColor = mix(bg, slatCol * slatBrightness, alpha * clamp(slatBrightness, 0.0, 1.0));
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      function compileShader(glContext: WebGLRenderingContext, type: number, src: string) {
        const shader = glContext.createShader(type);
        if (!shader) return null;
        glContext.shaderSource(shader, src);
        glContext.compileShader(shader);
        return shader;
      }

      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vs);
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
      if (!vertexShader || !fragmentShader) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const pos = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(program, 'u_time');
      const uRes = gl.getUniformLocation(program, 'u_resolution');
      const uMouse = gl.getUniformLocation(program, 'u_mouse');

      const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width && rect.height) {
          const nx = (event.clientX - rect.left) / rect.width;
          const ny = 1.0 - (event.clientY - rect.top) / rect.height;
          mouse.x = nx * canvas.width;
          mouse.y = ny * canvas.height;
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      const render = (t: number) => {
        syncSize();
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        if (resizeObserver) resizeObserver.disconnect();
      };
    } else {
      // 2D CANVAS FALLBACK IF WEBGL IS UNAVAILABLE
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

      const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width && rect.height) {
          mouse.x = event.clientX - rect.left;
          mouse.y = event.clientY - rect.top;
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      const render2D = (time: number) => {
        syncSize();
        const w = canvas.width;
        const h = canvas.height;
        ctx.fillStyle = '#0a0414';
        ctx.fillRect(0, 0, w, h);

        const slatW = 10;
        const slatH = 26;
        const gap = 3.5;
        const pitchX = slatW + gap;
        const pitchY = slatH + gap;
        const t = time * 0.0009;

        const cols = Math.ceil(w / pitchX);
        const rows = Math.ceil(h / pitchY);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * pitchX;
            const y = r * pitchY;

            const normX = x / w;
            const normY = y / h;

            const dx = normX - mouse.x / w;
            const dy = normY - mouse.y / h;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseSplat = Math.exp(-dist * dist * 35.0);

            const worldX = c * 0.055;
            const worldY = r * 0.04;
            const wave1 = Math.sin(worldX * 1.8 + worldY * 2.2 - t + Math.sin(worldY * 0.5 + t * 0.4));
            const wave2 = Math.cos(worldX * 2.5 - worldY * 1.6 - t * 1.25);
            const wave3 = Math.sin((worldX + worldY) * 1.4 - t * 0.7);

            let waveHeight = (wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.25) + mouseSplat * 1.2;
            const level = Math.max(0, Math.min(1, 0.5 + 0.5 * waveHeight));

            const spatialIntensity = Math.max(0, Math.min(1, (normX * 0.85 + (1.0 - normY) * 0.35 + 0.2) / 1.3));
            const slatBrightness = (0.15 + 0.85 * spatialIntensity) * (0.35 + 0.9 * level) + mouseSplat * 0.8;

            if (slatBrightness > 0.15) {
              const hue = level > 0.6 ? '#feb700' : '#ff1a8c';
              ctx.fillStyle = hue;
              ctx.globalAlpha = Math.min(0.85, slatBrightness * 0.8);
              ctx.beginPath();
              const currH = slatH * (0.7 + 0.45 * level);
              ctx.roundRect(x, y, slatW * 0.85, currH, 3);
              ctx.fill();
            }
          }
        }

        ctx.globalAlpha = 1.0;
        animationFrameId = requestAnimationFrame(render2D);
      };

      animationFrameId = requestAnimationFrame(render2D);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('mousemove', handleMouseMove);
        if (resizeObserver) resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};
