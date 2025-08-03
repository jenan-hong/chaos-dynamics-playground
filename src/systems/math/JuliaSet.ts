// src/systems/math/JuliaSystem.ts
export interface JuliaParams {
  cReal: number;      // Julia集合參數c的實部
  cImag: number;      // Julia集合參數c的虛部
  maxIterations: number;
  escapeRadius: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorIntensity: number;
}

export interface Complex {
  re: number;
  im: number;
}

export interface IterationResult {
  iterations: number;
  escaped: boolean;
  finalZ?: Complex;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export class JuliaSystem {
  private params: JuliaParams;

  constructor(params: JuliaParams) {
    this.params = { ...params };
  }

  /**
   * 更新參數
   */
  updateParams(newParams: Partial<JuliaParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  /**
   * 獲取當前參數
   */
  getParams(): JuliaParams {
    return { ...this.params };
  }

  /**
   * 將螢幕坐標轉換為複數平面坐標
   */
  screenToComplex(x: number, y: number, width: number, height: number): Complex {
    const { zoom, centerX, centerY } = this.params;
    
    // 計算複數平面的範圍
    const scale = 4.0 / zoom; // 基礎範圍是 [-2, 2]
    const aspectRatio = width / height;
    
    const rangeX = scale * aspectRatio;
    const rangeY = scale;
    
    const re = centerX + (x / width - 0.5) * rangeX;
    const im = centerY + (y / height - 0.5) * rangeY;
    
    return { re, im };
  }

  /**
   * 計算單個點的Julia集合迭代
   * Julia集合公式: z_{n+1} = z_n^2 + c
   * 其中c是固定參數，z_0是起始點
   */
  calculatePoint(z0: Complex): IterationResult {
    const { cReal, cImag, maxIterations, escapeRadius } = this.params;
    const c = { re: cReal, im: cImag };
    
    let z = { re: z0.re, im: z0.im };
    let iterations = 0;
    const escapeRadiusSquared = escapeRadius * escapeRadius;

    while (iterations < maxIterations) {
      // 計算 |z|^2
      const zMagnitudeSquared = z.re * z.re + z.im * z.im;
      
      // 檢查是否逃逸
      if (zMagnitudeSquared > escapeRadiusSquared) {
        return {
          iterations,
          escaped: true,
          finalZ: z
        };
      }

      // z_{n+1} = z_n^2 + c
      const newRe = z.re * z.re - z.im * z.im + c.re;
      const newIm = 2 * z.re * z.im + c.im;
      
      z.re = newRe;
      z.im = newIm;
      iterations++;
    }

    return {
      iterations: maxIterations,
      escaped: false,
      finalZ: z
    };
  }

  /**
   * 將迭代次數轉換為顏色
   */
  iterationsToColor(iterations: number, escaped: boolean): ColorRGB {
    const { maxIterations, colorIntensity } = this.params;

    if (!escaped) {
      // 屬於Julia集合 - 使用深色
      return { r: 0, g: 0, b: 0 };
    }

    // 不屬於Julia集合 - 使用彩色梯度
    const normalizedIterations = iterations / maxIterations;
    const adjustedIterations = Math.pow(normalizedIterations, 1 / colorIntensity);
    
    // 使用HSL到RGB的轉換創建彩虹色彩
    const hue = (adjustedIterations * 360 + 180) % 360; // 色相
    const saturation = 0.8; // 飽和度
    const lightness = 0.3 + adjustedIterations * 0.6; // 亮度

    return this.hslToRgb(hue, saturation, lightness);
  }

  /**
   * HSL到RGB顏色空間轉換
   */
  private hslToRgb(h: number, s: number, l: number): ColorRGB {
    h /= 360;
    
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l; // 無彩色
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * 生成一些有趣的Julia集合預設參數
   */
  static getPresets(): Record<string, Partial<JuliaParams>> {
    return {
      dragon: {
        cReal: -0.8,
        cImag: 0.156,
        maxIterations: 100,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorIntensity: 1.5
      },
      spiral: {
        cReal: -0.7269,
        cImag: 0.1889,
        maxIterations: 150,
        zoom: 1.2,
        centerX: 0,
        centerY: 0,
        colorIntensity: 2
      },
      dendrite: {
        cReal: -0.75,
        cImag: 0.11,
        maxIterations: 80,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorIntensity: 1
      },
      lightning: {
        cReal: -0.1,
        cImag: 0.8,
        maxIterations: 120,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorIntensity: 1.8
      },
      classic: {
        cReal: -0.4,
        cImag: 0.6,
        maxIterations: 100,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorIntensity: 1
      },
      connected: {
        cReal: 0.285,
        cImag: 0.01,
        maxIterations: 100,
        zoom: 1,
        centerX: 0,
        centerY: 0,
        colorIntensity: 1.2
      }
    };
  }

  /**
   * 計算Julia集合的連通性（近似）
   * 檢查原點附近的軌道是否有界
   */
  isConnected(): boolean {
    const testResult = this.calculatePoint({ re: 0, im: 0 });
    return !testResult.escaped;
  }

  /**
   * 獲取當前參數對應的Julia集合類型描述
   */
  getSetDescription(): string {
    const isConn = this.isConnected();
    const { cReal, cImag } = this.params;
    const magnitude = Math.sqrt(cReal * cReal + cImag * cImag);
    
    if (isConn) {
      if (magnitude < 0.5) {
        return "連通的Julia集合 - 形成連續的圖形";
      } else {
        return "連通的Julia集合 - 可能有複雜的邊界";
      }
    } else {
      return "塵埃型Julia集合 - 由不連通的點組成";
    }
  }

  /**
   * 批次計算多個點（用於多線程優化）
   */
  calculateBatch(points: Complex[]): IterationResult[] {
    return points.map(point => this.calculatePoint(point));
  }
}