// 系統類型定義
export type SystemType = 'lorenz' | 'mandelbrot' | 'pendulum' | 'logistic' | 'julia';

// 基礎點結構
export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

// 洛倫茲系統參數
export interface LorenzParams {
  sigma: number;
  rho: number;
  beta: number;
  speed: number;
  scale: number;
  trailLength: number;
}

// 曼德布洛特參數
export interface MandelbrotParams {
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorIntensity: number;
}

// 雙擺參數
export interface PendulumParams {
  gravity: number;
  damping: number;
  length1: number;
  length2: number;
  mass1: number;
  mass2: number;
  trailLength: number;
}

// 邏輯映射參數
export interface LogisticParams {
  r: number;
  x0: number;
  iterations: number;
  historyLength: number;
}

// Julia集合參數
export interface JuliaParams {
  cReal: number;
  cImag: number;
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
}

// 渲染配置
export interface RenderConfig {
  width: number;
  height: number;
  backgroundColor: string;
  showGrid: boolean;
  showAxes: boolean;
}

// 系統信息
export interface SystemInfo {
  id: SystemType;
  name: string;
  description: string;
  equations?: string[];
  keyFeatures?: string[];
}

// 性能指標
export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  calculationTime: number;
  memoryUsage: number;
  pointCount: number;
  lastUpdate: number;
}