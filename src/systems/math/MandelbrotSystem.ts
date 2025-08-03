// src/utils/MandelbrotSystem.ts
export interface MandelbrotParams {
  maxIterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  colorIntensity: number;
}

export interface Complex {
  re: number;  // 實部
  im: number;  // 虛部
}

export class MandelbrotSystem {
  constructor(private params: MandelbrotParams) {}

  /**
   * 複數乘法: (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
   */
  private complexMultiply(a: Complex, b: Complex): Complex {
    return {
      re: a.re * b.re - a.im * b.im,
      im: a.re * b.im + a.im * b.re
    };
  }

  /**
   * 複數模長的平方: |z|² = re² + im²
   */
  private complexMagnitudeSquared(z: Complex): number {
    return z.re * z.re + z.im * z.im;
  }

  /**
   * 計算單個點是否屬於曼德布洛特集合
   * z(n+1) = z(n)² + c
   */
  calculatePoint(c: Complex): { iterations: number; escaped: boolean } {
    let z: Complex = { re: 0, im: 0 };
    let iterations = 0;

    while (iterations < this.params.maxIterations) {
      // z = z² + c
      z = {
        re: z.re * z.re - z.im * z.im + c.re,
        im: 2 * z.re * z.im + c.im
      };

      // 檢查是否發散 (|z| > 2)
      if (this.complexMagnitudeSquared(z) > 4) {
        return { iterations, escaped: true };
      }

      iterations++;
    }

    return { iterations, escaped: false };
  }

  /**
   * 將屏幕坐標轉換為複數平面坐標
   */
  screenToComplex(screenX: number, screenY: number, width: number, height: number): Complex {
    const aspectRatio = width / height;
    const scale = 4 / this.params.zoom;
    
    const re = this.params.centerX + (screenX / width - 0.5) * scale * aspectRatio;
    const im = this.params.centerY + (screenY / height - 0.5) * scale;
    
    return { re, im };
  }

  /**
   * 根據迭代次數生成顏色
   */
  iterationsToColor(iterations: number, escaped: boolean): { r: number; g: number; b: number } {
    if (!escaped) {
      return { r: 0, g: 0, b: 0 };  // 黑色表示在集合內
    }

    // 使用平滑的顏色映射
    const t = iterations / this.params.maxIterations;
    const intensity = this.params.colorIntensity;

    // HSV 到 RGB 轉換
    const hue = (t * 360 * intensity) % 360;
    const saturation = 0.8;
    const value = t < 1 ? 0.8 : 0;

    return this.hsvToRgb(hue, saturation, value);
  }

  /**
   * HSV 到 RGB 顏色轉換
   */
  private hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * 更新參數
   */
  updateParams(newParams: Partial<MandelbrotParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  /**
   * 獲取當前參數
   */
  getParams(): MandelbrotParams {
    return { ...this.params };
  }
}