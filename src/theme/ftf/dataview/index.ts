// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { DataViewDesignTokens } from '@primeuix/themes/types/dataview'

export default {
  root: {
    borderColor: 'transparent',
    borderWidth: '0',
    borderRadius: '0',
    padding: '0',
  },
  header: {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    borderWidth: '0 0 1px 0',
    padding: '0.625rem 0.875rem',
    borderRadius: '0',
  },
  content: {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: 'transparent',
    borderWidth: '0',
    padding: '0',
    borderRadius: '0',
  },
  footer: {
    background: '{content.background}',
    color: '{content.color}',
    borderColor: '{content.border.color}',
    borderWidth: '1px 0 0 0',
    padding: '0.625rem 0.875rem',
    borderRadius: '0',
  },
  paginatorTop: {
    borderColor: '{content.border.color}',
    borderWidth: '0 0 1px 0',
  },
  paginatorBottom: {
    borderColor: '{content.border.color}',
    borderWidth: '1px 0 0 0',
  },
} satisfies DataViewDesignTokens
