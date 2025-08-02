// src/utils/LorenzSystem.ts
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface LorenzParams {
  sigma: number;
  rho: number;
  beta: number;
  dt?: number;
}

export class LorenzSystem {
  private x: number = 1;
  private y: number = 1;
  private z: number = 1;
  private dt: number = 0.01;
  private points: Point3D[] = [];

  constructor(private params: LorenzParams, initialConditions?: Partial<Point3D>) {
    this.x = initialConditions?.x ?? 1;
    this.y = initialConditions?.y ?? 1;
    this.z = initialConditions?.z ?? 1;
    this.dt = params.dt ?? 0.01;
  }

  /**
   * 洛倫茲方程組：
   * dx/dt = σ(y - x)
   * dy/dt = x(ρ - z) - y
   * dz/dt = xy - βz
   */
  private calculateDerivatives(x: number, y: number, z: number): Point3D {
    const { sigma, rho, beta } = this.params;
    
    return {
      x: sigma * (y - x),
      y: x * (rho - z) - y,
      z: x * y - beta * z
    };
  }

  /**
   * 使用四階龍格-庫塔方法進行數值積分
   */
  step(): Point3D {
    const { x, y, z, dt } = this;

    // k1
    const k1 = this.calculateDerivatives(x, y, z);
    
    // k2
    const k2 = this.calculateDerivatives(
      x + dt * k1.x / 2,
      y + dt * k1.y / 2,
      z + dt * k1.z / 2
    );
    
    // k3
    const k3 = this.calculateDerivatives(
      x + dt * k2.x / 2,
      y + dt * k2.y / 2,
      z + dt * k2.z / 2
    );
    
    // k4
    const k4 = this.calculateDerivatives(
      x + dt * k3.x,
      y + dt * k3.y,
      z + dt * k3.z
    );
    
    // 更新位置
    this.x += dt * (k1.x + 2 * k2.x + 2 * k3.x + k4.x) / 6;
    this.y += dt * (k1.y + 2 * k2.y + 2 * k3.y + k4.y) / 6;
    this.z += dt * (k1.z + 2 * k2.z + 2 * k3.z + k4.z) / 6;

    const currentPoint = { x: this.x, y: this.y, z: this.z };
    this.points.push(currentPoint);
    
    return currentPoint;
  }

  /**
   * 計算多個步驟
   */
  calculateSteps(steps: number = 1): Point3D[] {
    const newPoints: Point3D[] = [];
    for (let i = 0; i < steps; i++) {
      newPoints.push(this.step());
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
   * 獲取最新的N個點
   */
  getRecentPoints(count: number): Point3D[] {
    return this.points.slice(-count);
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
    if (newParams.dt) {
      this.dt = newParams.dt;
    }
  }

  /**
   * 限制軌跡長度（防止記憶體溢出）
   */
  limitTrailLength(maxLength: number): void {
    if (this.points.length > maxLength) {
      this.points = this.points.slice(-maxLength);
    }
  }

  /**
   * 檢查系統是否處於混沌狀態
   */
  isChaotic(): boolean {
    return this.params.rho > 24.74; // 簡化的混沌判定
  }
}