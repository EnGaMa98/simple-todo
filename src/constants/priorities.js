export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Alta', shortLabel: 'Alta' },
  { value: 'medium', label: 'Media', shortLabel: 'Media' },
  { value: 'low', label: 'Baja', shortLabel: 'Baja' },
]

export const PRIORITY_META = {
  high: {
    label: 'Alta',
    helper: 'Atender hoy',
    weight: 3,
  },
  medium: {
    label: 'Media',
    helper: 'Seguimiento',
    weight: 2,
  },
  low: {
    label: 'Baja',
    helper: 'Sin prisa',
    weight: 1,
  },
}
