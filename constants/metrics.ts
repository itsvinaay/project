// Define metric types and their default units
export const metricConfig = {
  weight: {
    id: 'weight',
    label: 'Weight',
    defaultValue: '70',
    units: ['kg', 'lb'],
    icon: 'scale'
  },
  chest: {
    id: 'chest',
    label: 'Chest',
    defaultValue: '90',
    units: ['cm', 'in'],
    icon: 'ruler'
  },
  shoulders: {
    id: 'shoulders',
    label: 'Shoulders',
    defaultValue: '110',
    units: ['cm', 'in'],
    icon: 'ruler'
  },
  waist: {
    id: 'waist',
    label: 'Waist',
    defaultValue: '80',
    units: ['cm', 'in'],
    icon: 'ruler'
  },
  thigh: {
    id: 'thigh',
    label: 'Thigh',
    defaultValue: '55',
    units: ['cm', 'in'],
    icon: 'ruler'
  },
  hip: {
    id: 'hip',
    label: 'Hip',
    defaultValue: '95',
    units: ['cm', 'in'],
    icon: 'ruler'
  },
  bodyFat: {
    id: 'bodyFat',
    label: 'Body Fat',
    defaultValue: '15',
    units: ['%'],
    icon: 'percent'
  },
  bicep: {
    id: 'bicep',
    label: 'Bicep',
    defaultValue: '35',
    units: ['cm', 'in'],
    icon: 'ruler'
  },
  waterIntake: {
    id: 'waterIntake',
    label: 'Water Intake',
    defaultValue: '2000',
    units: ['ml', 'oz'],
    icon: 'droplet'
  },
  steps: {
    id: 'steps',
    label: 'Steps',
    defaultValue: '10000',
    units: ['steps'],
    icon: 'footprints'
  }
};

// List of metrics for display
export const metricsList = Object.values(metricConfig);
