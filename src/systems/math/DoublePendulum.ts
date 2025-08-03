// src/utils/DoublePendulumSystem.ts
export interface PendulumParams {
  gravity: number;
  damping: number;
  length1: number;
  length2: number;
  mass1: number;
  mass2: number;
  trailLength: number;
}

export interface PendulumState {
  theta1: number;  // 第一個擺的角度
  theta2: number;  // 第二個擺的角度
  omega1: number;  // 第一個擺的角速度
  omega2: number;  // 第二個擺的角速度
}

export interface Point2D {
  x: number;
  y: number;
}

export class DoublePendulumSystem {
  private state: PendulumState;
  private trail: Point2D[] = [];
  private dt: number = 0.01;

  constructor(
    private params: PendulumParams,
    initialState?: Partial<PendulumState>
  ) {
    this.state = {
      theta1: initialState?.theta1 ?? Math.PI / 2 + (Math.random() - 0.5) * 0.1,
      theta2: initialState?.theta2 ?? Math.PI / 2 + (Math.random() - 0.5) * 0.1,
      omega1: initialState?.omega1 ?? 0,
      omega2: initialState?.omega2 ?? 0
    };
  }

  /**
   * 雙擺的運動方程（拉格朗日力學）
   */
  private calculateDerivatives(): {
    dtheta1: number;
    dtheta2: number;
    domega1: number;
    domega2: number;
  } {
    const { theta1, theta2, omega1, omega2 } = this.state;
    const { gravity, length1, length2, mass1, mass2, damping } = this.params;

    const dtheta = theta1 - theta2;
    const den1 = (mass1 + mass2) * length1 - mass2 * length1 * Math.cos(dtheta) * Math.cos(dtheta);
    const den2 = (length2 / length1) * den1;

    // 第一個擺的角加速度
    const num1 = -mass2 * length1 * omega1 * omega1 * Math.sin(dtheta) * Math.cos(dtheta) +
                  mass2 * gravity * Math.sin(theta2) * Math.cos(dtheta) +
                  mass2 * length2 * omega2 * omega2 * Math.sin(dtheta) -
                  (mass1 + mass2) * gravity * Math.sin(theta1);

    const domega1 = num1 / den1;

    // 第二個擺的角加速度
    const num2 = -mass2 * length2 * omega2 * omega2 * Math.sin(dtheta) * Math.cos(dtheta) -
                  (mass1 + mass2) * gravity * Math.sin(theta1) * Math.cos(dtheta) -
                  (mass1 + mass2) * length1 * omega1 * omega1 * Math.sin(dtheta) +
                  (mass1 + mass2) * gravity * Math.sin(theta2);

    const domega2 = num2 / den2;

    return {
      dtheta1: omega1,
      dtheta2: omega2,
      domega1: domega1 * damping,  // 添加阻尼
      domega2: domega2 * damping
    };
  }

  /**
   * 使用龍格-庫塔方法進行數值積分
   */
  step(): void {
    const { theta1, theta2, omega1, omega2 } = this.state;

    // k1
    const k1 = this.calculateDerivatives();

    // k2
    this.state = {
      theta1: theta1 + this.dt * k1.dtheta1 / 2,
      theta2: theta2 + this.dt * k1.dtheta2 / 2,
      omega1: omega1 + this.dt * k1.domega1 / 2,
      omega2: omega2 + this.dt * k1.domega2 / 2
    };
    const k2 = this.calculateDerivatives();

    // k3
    this.state = {
      theta1: theta1 + this.dt * k2.dtheta1 / 2,
      theta2: theta2 + this.dt * k2.dtheta2 / 2,
      omega1: omega1 + this.dt * k2.domega1 / 2,
      omega2: omega2 + this.dt * k2.domega2 / 2
    };
    const k3 = this.calculateDerivatives();

    // k4
    this.state = {
      theta1: theta1 + this.dt * k3.dtheta1,
      theta2: theta2 + this.dt * k3.dtheta2,
      omega1: omega1 + this.dt * k3.domega1,
      omega2: omega2 + this.dt * k3.domega2
    };
    const k4 = this.calculateDerivatives();

    // 最終更新
    this.state = {
      theta1: theta1 + this.dt * (k1.dtheta1 + 2 * k2.dtheta1 + 2 * k3.dtheta1 + k4.dtheta1) / 6,
      theta2: theta2 + this.dt * (k1.dtheta2 + 2 * k2.dtheta2 + 2 * k3.dtheta2 + k4.dtheta2) / 6,
      omega1: omega1 + this.dt * (k1.domega1 + 2 * k2.domega1 + 2 * k3.domega1 + k4.domega1) / 6,
      omega2: omega2 + this.dt * (k1.domega2 + 2 * k2.domega2 + 2 * k3.domega2 + k4.domega2) / 6
    };

    // 計算第二個擺的位置並添加到軌跡
    const x2 = this.params.length1 * Math.sin(this.state.theta1) + 
               this.params.length2 * Math.sin(this.state.theta2);
    const y2 = this.params.length1 * Math.cos(this.state.theta1) + 
               this.params.length2 * Math.cos(this.state.theta2);

    this.trail.push({ x: x2, y: y2 });

    // 限制軌跡長度
    if (this.trail.length > this.params.trailLength) {
      this.trail.shift();
    }
  }

  /**
   * 計算擺的位置
   */
  getPendulumPositions(): { x1: number; y1: number; x2: number; y2: number } {
    const { theta1, theta2 } = this.state;
    const { length1, length2 } = this.params;

    const x1 = length1 * Math.sin(theta1);
    const y1 = length1 * Math.cos(theta1);
    const x2 = x1 + length2 * Math.sin(theta2);
    const y2 = y1 + length2 * Math.cos(theta2);

    return { x1, y1, x2, y2 };
  }

  /**
   * 獲取軌跡
   */
  getTrail(): Point2D[] {
    return [...this.trail];
  }

  /**
   * 獲取當前狀態
   */
  getState(): PendulumState {
    return { ...this.state };
  }

  /**
   * 重置系統
   */
  reset(initialState?: Partial<PendulumState>): void {
    this.state = {
      theta1: initialState?.theta1 ?? Math.PI / 2 + (Math.random() - 0.5) * 0.1,
      theta2: initialState?.theta2 ?? Math.PI / 2 + (Math.random() - 0.5) * 0.1,
      omega1: initialState?.omega1 ?? 0,
      omega2: initialState?.omega2 ?? 0
    };
    this.trail = [];
  }

  /**
   * 更新參數
   */
  updateParams(newParams: Partial<PendulumParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  /**
   * 計算系統總能量
   */
  getTotalEnergy(): number {
    const { theta1, theta2, omega1, omega2 } = this.state;
    const { gravity, length1, length2, mass1, mass2 } = this.params;

    // 動能
    const T1 = 0.5 * mass1 * length1 * length1 * omega1 * omega1;
    const T2 = 0.5 * mass2 * (
      length1 * length1 * omega1 * omega1 +
      length2 * length2 * omega2 * omega2 +
      2 * length1 * length2 * omega1 * omega2 * Math.cos(theta1 - theta2)
    );

    // 位能
    const V1 = -mass1 * gravity * length1 * Math.cos(theta1);
    const V2 = -mass2 * gravity * (length1 * Math.cos(theta1) + length2 * Math.cos(theta2));

    return T1 + T2 + V1 + V2;
  }
}