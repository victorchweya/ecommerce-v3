// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { StepperDesignTokens } from '@primeuix/themes/types/stepper'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  separator: {
    background: '{content.border.color}',
    activeBackground: '{primary.color}',
    margin: '0 0 0 1.375rem',
    size: '2px',
  },
  step: {
    padding: '0.375rem',
    gap: '0.875rem',
  },
  stepHeader: {
    padding: '0',
    borderRadius: '{content.border.radius}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    gap: '0.5rem',
  },
  stepTitle: {
    color: '{text.muted.color}',
    activeColor: '{primary.color}',
    fontWeight: '500',
    fontSize: '{typography.font.size}',
  },
  stepNumber: {
    background: '{content.background}',
    activeBackground: '{content.background}',
    borderColor: '{content.border.color}',
    activeBorderColor: '{content.border.color}',
    color: '{text.muted.color}',
    activeColor: '{primary.color}',
    size: '2rem',
    fontSize: '1rem',
    fontWeight: '500',
    borderRadius: '50%',
    shadow: '0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)',
  },
  steppanels: {
    padding: '0.75rem 0.375rem 1rem 0.375rem',
  },
  steppanel: {
    background: '{content.background}',
    color: '{content.color}',
    padding: '0',
    indent: '0.875rem',
  },
} satisfies StepperDesignTokens
