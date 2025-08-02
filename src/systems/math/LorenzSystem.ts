import { Point3D, LorenzParams } from '../../types/systems';

export class LorenzSystem {
  private x: number = 1;
  private y: number = 1;
  private z: number = 1;
  private dt: number = 0.01;
  private points: Point3D[] = [];
  
  constructor(
    private params: LorenzParams = {
      sigma: 10,
      rho: 28,
      beta: 8/3,
      speed: 5,
      scale: 8,
      trailLength: 2000
    }
  ) {}

  /**
   * 洛倫茲方程：
   * dx/dt = σ(y - x)
   * dy/dt = x(ρ - z) - y  
   * dz/dt = xy - βz
   */
  private calculateDerivatives(): Point3D {
    const { sigma, rho, beta } = this.params;
    
    const dx = sigma * (this.y - this.x);
    const dy = this.x * (rho - this.z) - this.y;
    const dz = this.x * this.y - beta * this.z;
    
    return { x: dx, y: dy, z: dz };
  }

  /**
   * 使用四階 Runge-Kutta 方法進行數值積分
   */
  private step(): Point3D {
    const { x, y, z } = this;
    const dt = this.dt;
    
    // k1
    const k1 = this.calculateDerivativesAt(x, y, z);
    
    // k2
    const k2 = this.calculateDerivativesAt(
      x + dt * k1.x / 2,
      y + dt * k1.y / 2,
      z + dt * k1.z / 2
    );
    
    // k3
    const k3 = this.calculateDerivativesAt(
      x + dt * k2.x / 2,
      y + dt * k2.y / 2,
      z + dt * k2.z / 2
    );
    
    // k4
    const k4 = this.calculateDerivativesAt(
      x + dt * k3.x,
      y + dt * k3.y,
      z + dt * k3.z
    );
    
    // 更新位置
    this.x += dt * (k1.x + 2 * k2.x + 2 * k3.x + k4.x) / 6;
    this.y += dt * (k1.y + 2 * k2.y + 2 * k3.y + k4.y) / 6;
    this.z += dt * (k1.z + 2 * k2.z + 2 * k3.z + k4.z) / 6;
    
    return { x: this.x, y: this.y, z: this.z };
  }

  private calculateDerivativesAt(x: number, y: number, z: number): Point3D {
    const { sigma, rho, beta } = this.params;
    
    return {
      x: sigma * (y - x),
      y: x * (rho - z) - y,
      z: x * y - beta * z
    };
  }

  /**
   * 計算多個步驟
   */
  calculateSteps(steps: number = 1): Point3D[] {
    const newPoints: Point3D[] = [];
    
    for (let i = 0; i < steps; i++) {
      const point = this.step();
      newPoints.push({ ...point });
    }
    
    // 添加到點數組並控制長度
    this.points.push(...newPoints);
    while (this.points.length > this.params.trailLength) {
      this.points.shift();
    }
    
    return newPoints;
  }

  /**
   * 獲取所有點
   */
  getPoints(): Point3D[] {
    return [...this.points];
  }

  /**
   * 獲取當前位置
   */
  getCurrentPosition(): Point3D {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * 重置系統
   */
  reset(initialConditions?: Partial<Point3D>): void {
    this.x = initialConditions?.x ?? 1;
    this.y = initialConditions?.y ?? 1;
    this.z = initialConditions?.z ?? 1;
    this.points = [];
  }

  /**
   * 更新參數
   */
  updateParams(newParams: Partial<LorenzParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  /**
   * 獲取當前參數
   */
  getParams(): LorenzParams {
    return { ...this.params };
  }

  /**
   * 檢查系統是否處於混沌狀態
   */
  isChaotic(): boolean {
    const { rho } = this.params;
    // 當 ρ > 24.74 時系統通常處於混沌狀態
    return rho > 24.74;
  }

  /**
   * 計算李亞普諾夫指數（簡化版本）
   */
  calculateLyapunovExponent(iterations: number = 1000): number {
    // 這是一個簡化的李亞普諾夫指數計算
    // 實際應用中需要更複雜的計算
    const initialX = this.x;
    const perturbation = 1e-8;
    
    // 記錄初始狀態
    const originalState = { x: this.x, y: this.y, z: this.z };
    
    // 運行原始系統
    const originalPoints: Point3D[] = [];
    for (let i = 0; i < iterations; i++) {
      originalPoints.push(this.step());
    }
    
    // 重置並添加微小擾動
    this.x = originalState.x + perturbation;
    this.y = originalState.y;
    this.z = originalState.z;
    
    // 運行擾動系統
    let totalDivergence = 0;
    for (let i = 0; i < iterations; i++) {
      const perturbedPoint = this.step();
      const originalPoint = originalPoints[i];
      
      const distance = Math.sqrt(
        Math.pow(perturbedPoint.x - originalPoint.x, 2) +
        Math.pow(perturbedPoint.y - originalPoint.y, 2) +
        Math.pow(perturbedPoint.z - originalPoint.z, 2)
      );
      
      if (distance > 0) {
        totalDivergence += Math.log(distance / perturbation);
      }
    }
    
    // 恢復原始狀態
    this.x = originalState.x;
    this.y = originalState.y;
    this.z = originalState.z;
    
    return totalDivergence / (iterations * this.dt);
  }
}