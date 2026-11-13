// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ColorPickerDesignTokens } from '@primeuix/themes/types/colorpicker'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  preview: {
    width: '1.375rem',
    height: '1.375rem',
    borderRadius: '{form.field.border.radius}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
  panel: {
    shadow: '{overlay.popover.shadow}',
    borderRadius: '{overlay.popover.borderRadius}',
    background: 'light-dark({surface.800}, {surface.900})',
    borderColor: 'light-dark({surface.900}, {surface.700})',
  },
  colorScheme: {
    light: {
      panel: {
        background: '{surface.800}',
        borderColor: '{surface.900}',
      },
      handle: {
        color: '{surface.0}',
      },
    },
    dark: {
      panel: {
        background: '{surface.900}',
        borderColor: '{surface.700}',
      },
      handle: {
        color: '{surface.0}',
      },
    },
  },
  handle: {
    color: '{surface.0}',
  },
} satisfies ColorPickerDesignTokens
