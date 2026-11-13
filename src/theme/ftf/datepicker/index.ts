// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { DatePickerDesignTokens } from '@primeuix/themes/types/datepicker'

export default {
  root: {
    transitionDuration: '{transition.duration}',
  },
  panel: {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    color: '{content.color}',
    borderRadius: '{content.border.radius}',
    shadow: '{overlay.popover.shadow}',
    padding: '{overlay.popover.padding}',
  },
  header: {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    color: '{content.color}',
    padding: '0 0 0.5rem 0',
  },
  title: {
    gap: '0.5rem',
    fontWeight: '500',
    fontSize: '{typography.font.size}',
  },
  dropdown: {
    width: '2.25rem',
    sm: {
      width: '1.75rem',
    },
    lg: {
      width: '2.625rem',
    },
    borderColor: '{form.field.border.color}',
    hoverBorderColor: '{form.field.border.color}',
    activeBorderColor: '{form.field.border.color}',
    borderRadius: '{form.field.border.radius}',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    background: 'light-dark({surface.100}, {surface.800})',
    hoverBackground: 'light-dark({surface.200}, {surface.700})',
    activeBackground: 'light-dark({surface.300}, {surface.600})',
    color: 'light-dark({surface.600}, {surface.300})',
    hoverColor: 'light-dark({surface.700}, {surface.200})',
    activeColor: 'light-dark({surface.800}, {surface.100})',
  },
  inputIcon: {
    color: '{form.field.icon.color}',
  },
  selectMonth: {
    hoverBackground: '{content.hover.background}',
    color: '{content.color}',
    hoverColor: '{content.hover.color}',
    padding: '0.25rem 0.5rem',
    borderRadius: '{content.border.radius}',
    fontWeight: '500',
    fontSize: '{typography.font.size}',
  },
  selectYear: {
    hoverBackground: '{content.hover.background}',
    color: '{content.color}',
    hoverColor: '{content.hover.color}',
    padding: '0.25rem 0.5rem',
    borderRadius: '{content.border.radius}',
    fontWeight: '500',
    fontSize: '{typography.font.size}',
  },
  group: {
    borderColor: '{content.border.color}',
    gap: '{overlay.popover.padding}',
  },
  dayView: {
    margin: '0.5rem 0 0 0',
  },
  weekDay: {
    padding: '0.25rem',
    fontWeight: '500',
    color: '{content.color}',
    fontSize: '{typography.font.size}',
  },
  date: {
    hoverBackground: '{content.hover.background}',
    selectedBackground: '{primary.color}',
    rangeSelectedBackground: '{highlight.background}',
    color: '{content.color}',
    hoverColor: '{content.hover.color}',
    selectedColor: '{primary.contrast.color}',
    rangeSelectedColor: '{highlight.color}',
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '50%',
    padding: '0.25rem',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{focus.ring.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
  monthView: {
    margin: '0.5rem 0 0 0',
  },
  month: {
    padding: '0.25rem',
    borderRadius: '{content.border.radius}',
  },
  yearView: {
    margin: '0.5rem 0 0 0',
  },
  year: {
    padding: '0.25rem',
    borderRadius: '{content.border.radius}',
  },
  buttonbar: {
    padding: '0.5rem 0 0 0',
    borderColor: '{content.border.color}',
  },
  timePicker: {
    padding: '0.5rem 0 0 0',
    borderColor: '{content.border.color}',
    gap: '0.5rem',
    buttonGap: '0.125rem',
    color: '{text.color}',
    fontWeight: '{typography.font.weight}',
    fontSize: '{typography.font.size}',
  },
  colorScheme: {
    light: {
      dropdown: {
        background: '{surface.100}',
        hoverBackground: '{surface.200}',
        activeBackground: '{surface.300}',
        color: '{surface.600}',
        hoverColor: '{surface.700}',
        activeColor: '{surface.800}',
      },
      today: {
        background: '{surface.200}',
        color: '{surface.900}',
      },
    },
    dark: {
      dropdown: {
        background: '{surface.800}',
        hoverBackground: '{surface.700}',
        activeBackground: '{surface.600}',
        color: '{surface.300}',
        hoverColor: '{surface.200}',
        activeColor: '{surface.100}',
      },
      today: {
        background: '{surface.700}',
        color: '{surface.0}',
      },
    },
  },
  today: {
    background: 'light-dark({surface.200}, {surface.700})',
    color: 'light-dark({surface.900}, {surface.0})',
  },
} satisfies DatePickerDesignTokens
