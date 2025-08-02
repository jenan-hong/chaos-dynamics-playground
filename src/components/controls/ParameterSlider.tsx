import React from 'react';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: string;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  description
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  };

  // 計算滑桿進度百分比
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-sm font-medium text-chaos-text/80">
        {label}
      </label>
      
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="parameter-slider w-full"
          style={{
            background: `linear-gradient(to right, 
              rgba(102, 126, 234, 0.6) 0%, 
              rgba(102, 126, 234, 0.6) ${progress}%, 
              rgba(224, 224, 224, 0.2) ${progress}%, 
              rgba(224, 224, 224, 0.2) 100%)`
          }}
        />
      </div>
      
      <div className="flex flex-col items-center space-y-1">
        <span className="text-xs font-mono text-chaos-accent font-bold">
          {value.toFixed(step < 1 ? 1 : 0)}
        </span>
        {description && (
          <span className="text-xs text-chaos-text/50 text-center">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default ParameterSlider;