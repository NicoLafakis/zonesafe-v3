/**
 * MeasurementToolSelector Component
 * Allows users to select between different measurement modes
 */

import React from 'react'

export type MeasurementMode = 'draw' | 'pins' | 'none'

interface MeasurementToolSelectorProps {
  mode: MeasurementMode
  onModeChange: (mode: MeasurementMode) => void
  disabled?: boolean
}

export const MeasurementToolSelector: React.FC<MeasurementToolSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onModeChange(mode === 'draw' ? 'none' : 'draw')}
        disabled={disabled || mode === 'pins'}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          mode === 'draw'
            ? 'bg-primary text-white'
            : 'bg-white text-neutral border-2 border-neutral hover:bg-gray-50'
        } ${disabled || mode === 'pins' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Draw Work Zone
      </button>
      <button
        onClick={() => onModeChange(mode === 'pins' ? 'none' : 'pins')}
        disabled={disabled || mode === 'draw'}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          mode === 'pins'
            ? 'bg-primary text-white'
            : 'bg-white text-neutral border-2 border-neutral hover:bg-gray-50'
        } ${disabled || mode === 'draw' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Measure by Pins
      </button>
    </div>
  )
}
