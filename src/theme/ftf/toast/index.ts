// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { ToastDesignTokens } from '@primeuix/themes/types/toast'

export default {
  root: {
    width: '22rem',
    borderRadius: '{content.border.radius}',
    borderWidth: '1px',
    transitionDuration: '{transition.duration}',
    blur: '10px',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      color: '{primary.color}',
      offset: '{focus.ring.offset}',
      shadow: '{focus.ring.shadow}',
    },
  },
  icon: {
    size: '1rem',
    margin: '1px 0 0 0',
  },
  content: {
    padding: '{overlay.popover.padding}',
    gap: '0.5rem',
  },
  text: {
    gap: '0.25rem',
  },
  summary: {
    fontWeight: '500',
    fontSize: '0.875rem',
  },
  detail: {
    fontWeight: '500',
    fontSize: '0.75rem',
  },
  closeButton: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    focusRing: {
      width: '{focus.ring.width}',
      style: '{focus.ring.style}',
      offset: '{focus.ring.offset}',
    },
  },
  closeIcon: {
    size: '0.875rem',
  },
  colorScheme: {
    light: {
      root: {
        blur: '10px',
      },
      info: {
        background: 'color-mix(in srgb, {blue.50}, transparent 5%)',
        borderColor: '{blue.200}',
        color: '{blue.600}',
        detailColor: '{surface.700}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{blue.100}',
          focusRing: {
            color: '{blue.600}',
            shadow: 'none',
          },
        },
      },
      success: {
        background: 'color-mix(in srgb, {green.50}, transparent 5%)',
        borderColor: '{green.200}',
        color: '{green.600}',
        detailColor: '{surface.700}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{green.100}',
          focusRing: {
            color: '{green.600}',
            shadow: 'none',
          },
        },
      },
      warn: {
        background: 'color-mix(in srgb,{yellow.50}, transparent 5%)',
        borderColor: '{yellow.200}',
        color: '{yellow.600}',
        detailColor: '{surface.700}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{yellow.100}',
          focusRing: {
            color: '{yellow.600}',
            shadow: 'none',
          },
        },
      },
      error: {
        background: 'color-mix(in srgb, {red.50}, transparent 5%)',
        borderColor: '{red.200}',
        color: '{red.600}',
        detailColor: '{surface.700}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{red.100}',
          focusRing: {
            color: '{red.600}',
            shadow: 'none',
          },
        },
      },
      secondary: {
        background: '{surface.100}',
        borderColor: '{surface.200}',
        color: '{surface.600}',
        detailColor: '{surface.700}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.200}',
          focusRing: {
            color: '{surface.600}',
            shadow: 'none',
          },
        },
      },
      contrast: {
        background: '{surface.900}',
        borderColor: '{surface.950}',
        color: '{surface.50}',
        detailColor: '{surface.0}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.800}',
          focusRing: {
            color: '{surface.50}',
            shadow: 'none',
          },
        },
      },
    },
    dark: {
      root: {
        blur: '10px',
      },
      info: {
        background: 'color-mix(in srgb, {blue.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {blue.700}, transparent 64%)',
        color: '{blue.500}',
        detailColor: '{surface.0}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{blue.500}',
            shadow: 'none',
          },
        },
      },
      success: {
        background: 'color-mix(in srgb, {green.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {green.700}, transparent 64%)',
        color: '{green.500}',
        detailColor: '{surface.0}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{green.500}',
            shadow: 'none',
          },
        },
      },
      warn: {
        background: 'color-mix(in srgb, {yellow.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {yellow.700}, transparent 64%)',
        color: '{yellow.500}',
        detailColor: '{surface.0}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{yellow.500}',
            shadow: 'none',
          },
        },
      },
      error: {
        background: 'color-mix(in srgb, {red.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {red.700}, transparent 64%)',
        color: '{red.500}',
        detailColor: '{surface.0}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{red.500}',
            shadow: 'none',
          },
        },
      },
      secondary: {
        background: '{surface.800}',
        borderColor: '{surface.700}',
        color: '{surface.300}',
        detailColor: '{surface.0}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.700}',
          focusRing: {
            color: '{surface.300}',
            shadow: 'none',
          },
        },
      },
      contrast: {
        background: '{surface.0}',
        borderColor: '{surface.100}',
        color: '{surface.950}',
        detailColor: '{surface.950}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.100}',
          focusRing: {
            color: '{surface.950}',
            shadow: 'none',
          },
        },
      },
    },
  },
  normal: {
    background: '{content.background}',
    borderColor: '{content.border.color}',
    color: '{text.color}',
    detailColor: '{text.muted.color}',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    closeButton: {
      hoverBackground: 'light-dark({surface.100},{surface.800})',
      focusRing: {
        color: '{primary.color}',
        shadow: '{focus.ring.shadow}',
      },
    },
  },
  info: {
    background:
      'light-dark(color-mix(in srgb, {blue.50}, transparent 5%), color-mix(in srgb, {blue.500}, transparent 84%))',
    borderColor: 'light-dark({blue.200}, color-mix(in srgb, {blue.700}, transparent 64%))',
    color: 'light-dark({blue.600}, {blue.500})',
    detailColor: 'light-dark({surface.700}, {surface.0})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({blue.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({blue.600}, {blue.500})',
        shadow: 'none',
      },
    },
  },
  success: {
    background:
      'light-dark(color-mix(in srgb, {green.50}, transparent 5%), color-mix(in srgb, {green.500}, transparent 84%))',
    borderColor: 'light-dark({green.200}, color-mix(in srgb, {green.700}, transparent 64%))',
    color: 'light-dark({green.600}, {green.500})',
    detailColor: 'light-dark({surface.700}, {surface.0})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({green.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({green.600}, {green.500})',
        shadow: 'none',
      },
    },
  },
  warn: {
    background:
      'light-dark(color-mix(in srgb,{yellow.50}, transparent 5%), color-mix(in srgb, {yellow.500}, transparent 84%))',
    borderColor: 'light-dark({yellow.200}, color-mix(in srgb, {yellow.700}, transparent 64%))',
    color: 'light-dark({yellow.600}, {yellow.500})',
    detailColor: 'light-dark({surface.700}, {surface.0})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({yellow.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({yellow.600}, {yellow.500})',
        shadow: 'none',
      },
    },
  },
  error: {
    background:
      'light-dark(color-mix(in srgb, {red.50}, transparent 5%), color-mix(in srgb, {red.500}, transparent 84%))',
    borderColor: 'light-dark({red.200}, color-mix(in srgb, {red.700}, transparent 64%))',
    color: 'light-dark({red.600}, {red.500})',
    detailColor: 'light-dark({surface.700}, {surface.0})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({red.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({red.600}, {red.500})',
        shadow: 'none',
      },
    },
  },
  secondary: {
    background: 'light-dark({surface.100}, {surface.800})',
    borderColor: 'light-dark({surface.200}, {surface.700})',
    color: 'light-dark({surface.600}, {surface.300})',
    detailColor: 'light-dark({surface.700}, {surface.0})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({surface.200}, {surface.700})',
      focusRing: {
        color: 'light-dark({surface.600}, {surface.300})',
        shadow: 'none',
      },
    },
  },
  contrast: {
    background: 'light-dark({surface.900}, {surface.0})',
    borderColor: 'light-dark({surface.950}, {surface.100})',
    color: 'light-dark({surface.50}, {surface.950})',
    detailColor: 'light-dark({surface.0}, {surface.950})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({surface.800}, {surface.100})',
      focusRing: {
        color: 'light-dark({surface.50}, {surface.950})',
        shadow: 'none',
      },
    },
  },
} satisfies ToastDesignTokens
