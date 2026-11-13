// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { IftaLabelDesignTokens } from '@primeuix/themes/types/iftalabel'

export default {
  root: {
    color: '{form.field.float.label.color}',
    focusColor: '{form.field.float.label.focus.color}',
    invalidColor: '{form.field.float.label.invalid.color}',
    transitionDuration: '0.2s',
    positionX: '{form.field.padding.x}',
    top: '{form.field.padding.y}',
    fontSize: '0.625rem',
    fontWeight: '400',
  },
  input: {
    paddingTop: '1.125rem',
    paddingBottom: '{form.field.padding.y}',
  },
} satisfies IftaLabelDesignTokens
