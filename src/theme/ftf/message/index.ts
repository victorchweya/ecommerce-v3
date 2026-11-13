// Aura-derived FTF theme. MIT Copyright (c) 2025 PrimeTek. See LICENSE and PROVENANCE.md.
import type { MessageDesignTokens } from '@primeuix/themes/types/message'

export default {
  root: {
    borderRadius: '{content.border.radius}',
    borderWidth: '1px',
    transitionDuration: '{transition.duration}',
  },
  content: {
    padding: '0.375rem 0.625rem',
    gap: '0.5rem',
    sm: {
      padding: '0.25rem 0.5rem',
    },
    lg: {
      padding: '0.5rem 0.75rem',
    },
  },
  text: {
    fontSize: '0.875rem',
    fontWeight: '500',
    sm: {
      fontSize: '0.75rem',
    },
    lg: {
      fontSize: '1rem',
    },
  },
  icon: {
    size: '1rem',
    sm: {
      size: '0.875rem',
    },
    lg: {
      size: '1.125rem',
    },
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
    sm: {
      size: '0.75rem',
    },
    lg: {
      size: '1rem',
    },
  },
  outlined: {
    root: {
      borderWidth: '1px',
    },
  },
  simple: {
    content: {
      padding: '0',
    },
  },
  colorScheme: {
    light: {
      info: {
        background: 'color-mix(in srgb, {blue.50}, transparent 5%)',
        borderColor: '{blue.200}',
        color: '{blue.600}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{blue.100}',
          focusRing: {
            color: '{blue.600}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{blue.600}',
          borderColor: '{blue.600}',
        },
        simple: {
          color: '{blue.600}',
        },
      },
      success: {
        background: 'color-mix(in srgb, {green.50}, transparent 5%)',
        borderColor: '{green.200}',
        color: '{green.600}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{green.100}',
          focusRing: {
            color: '{green.600}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{green.600}',
          borderColor: '{green.600}',
        },
        simple: {
          color: '{green.600}',
        },
      },
      warn: {
        background: 'color-mix(in srgb,{yellow.50}, transparent 5%)',
        borderColor: '{yellow.200}',
        color: '{yellow.600}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{yellow.100}',
          focusRing: {
            color: '{yellow.600}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{yellow.600}',
          borderColor: '{yellow.600}',
        },
        simple: {
          color: '{yellow.600}',
        },
      },
      error: {
        background: 'color-mix(in srgb, {red.50}, transparent 5%)',
        borderColor: '{red.200}',
        color: '{red.600}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{red.100}',
          focusRing: {
            color: '{red.600}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{red.600}',
          borderColor: '{red.600}',
        },
        simple: {
          color: '{red.600}',
        },
      },
      secondary: {
        background: '{surface.100}',
        borderColor: '{surface.200}',
        color: '{surface.600}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.200}',
          focusRing: {
            color: '{surface.600}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{surface.500}',
          borderColor: '{surface.500}',
        },
        simple: {
          color: '{surface.500}',
        },
      },
      contrast: {
        background: '{surface.900}',
        borderColor: '{surface.950}',
        color: '{surface.50}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.800}',
          focusRing: {
            color: '{surface.50}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{surface.950}',
          borderColor: '{surface.950}',
        },
        simple: {
          color: '{surface.950}',
        },
      },
    },
    dark: {
      info: {
        background: 'color-mix(in srgb, {blue.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {blue.700}, transparent 64%)',
        color: '{blue.500}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{blue.500}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{blue.500}',
          borderColor: '{blue.500}',
        },
        simple: {
          color: '{blue.500}',
        },
      },
      success: {
        background: 'color-mix(in srgb, {green.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {green.700}, transparent 64%)',
        color: '{green.500}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{green.500}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{green.500}',
          borderColor: '{green.500}',
        },
        simple: {
          color: '{green.500}',
        },
      },
      warn: {
        background: 'color-mix(in srgb, {yellow.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {yellow.700}, transparent 64%)',
        color: '{yellow.500}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{yellow.500}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{yellow.500}',
          borderColor: '{yellow.500}',
        },
        simple: {
          color: '{yellow.500}',
        },
      },
      error: {
        background: 'color-mix(in srgb, {red.500}, transparent 84%)',
        borderColor: 'color-mix(in srgb, {red.700}, transparent 64%)',
        color: '{red.500}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)',
        closeButton: {
          hoverBackground: 'rgba(255, 255, 255, 0.05)',
          focusRing: {
            color: '{red.500}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{red.500}',
          borderColor: '{red.500}',
        },
        simple: {
          color: '{red.500}',
        },
      },
      secondary: {
        background: '{surface.800}',
        borderColor: '{surface.700}',
        color: '{surface.300}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.700}',
          focusRing: {
            color: '{surface.300}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{surface.400}',
          borderColor: '{surface.400}',
        },
        simple: {
          color: '{surface.400}',
        },
      },
      contrast: {
        background: '{surface.0}',
        borderColor: '{surface.100}',
        color: '{surface.950}',
        shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)',
        closeButton: {
          hoverBackground: '{surface.100}',
          focusRing: {
            color: '{surface.950}',
            shadow: 'none',
          },
        },
        outlined: {
          color: '{surface.0}',
          borderColor: '{surface.0}',
        },
        simple: {
          color: '{surface.0}',
        },
      },
    },
  },
  info: {
    background:
      'light-dark(color-mix(in srgb, {blue.50}, transparent 5%), color-mix(in srgb, {blue.500}, transparent 84%))',
    borderColor: 'light-dark({blue.200}, color-mix(in srgb, {blue.700}, transparent 64%))',
    color: 'light-dark({blue.600}, {blue.500})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {blue.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({blue.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({blue.600}, {blue.500})',
        shadow: 'none',
      },
    },
    outlined: {
      color: 'light-dark({blue.600}, {blue.500})',
      borderColor: 'light-dark({blue.600}, {blue.500})',
    },
    simple: {
      color: 'light-dark({blue.600}, {blue.500})',
    },
  },
  success: {
    background:
      'light-dark(color-mix(in srgb, {green.50}, transparent 5%), color-mix(in srgb, {green.500}, transparent 84%))',
    borderColor: 'light-dark({green.200}, color-mix(in srgb, {green.700}, transparent 64%))',
    color: 'light-dark({green.600}, {green.500})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {green.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({green.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({green.600}, {green.500})',
        shadow: 'none',
      },
    },
    outlined: {
      color: 'light-dark({green.600}, {green.500})',
      borderColor: 'light-dark({green.600}, {green.500})',
    },
    simple: {
      color: 'light-dark({green.600}, {green.500})',
    },
  },
  warn: {
    background:
      'light-dark(color-mix(in srgb,{yellow.50}, transparent 5%), color-mix(in srgb, {yellow.500}, transparent 84%))',
    borderColor: 'light-dark({yellow.200}, color-mix(in srgb, {yellow.700}, transparent 64%))',
    color: 'light-dark({yellow.600}, {yellow.500})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {yellow.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({yellow.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({yellow.600}, {yellow.500})',
        shadow: 'none',
      },
    },
    outlined: {
      color: 'light-dark({yellow.600}, {yellow.500})',
      borderColor: 'light-dark({yellow.600}, {yellow.500})',
    },
    simple: {
      color: 'light-dark({yellow.600}, {yellow.500})',
    },
  },
  error: {
    background:
      'light-dark(color-mix(in srgb, {red.50}, transparent 5%), color-mix(in srgb, {red.500}, transparent 84%))',
    borderColor: 'light-dark({red.200}, color-mix(in srgb, {red.700}, transparent 64%))',
    color: 'light-dark({red.600}, {red.500})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {red.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({red.100}, rgba(255, 255, 255, 0.05))',
      focusRing: {
        color: 'light-dark({red.600}, {red.500})',
        shadow: 'none',
      },
    },
    outlined: {
      color: 'light-dark({red.600}, {red.500})',
      borderColor: 'light-dark({red.600}, {red.500})',
    },
    simple: {
      color: 'light-dark({red.600}, {red.500})',
    },
  },
  secondary: {
    background: 'light-dark({surface.100}, {surface.800})',
    borderColor: 'light-dark({surface.200}, {surface.700})',
    color: 'light-dark({surface.600}, {surface.300})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.500}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({surface.200}, {surface.700})',
      focusRing: {
        color: 'light-dark({surface.600}, {surface.300})',
        shadow: 'none',
      },
    },
    outlined: {
      color: 'light-dark({surface.500}, {surface.400})',
      borderColor: 'light-dark({surface.500}, {surface.400})',
    },
    simple: {
      color: 'light-dark({surface.500}, {surface.400})',
    },
  },
  contrast: {
    background: 'light-dark({surface.900}, {surface.0})',
    borderColor: 'light-dark({surface.950}, {surface.100})',
    color: 'light-dark({surface.50}, {surface.950})',
    shadow: '0px 4px 8px 0px color-mix(in srgb, {surface.950}, transparent 96%)',
    closeButton: {
      hoverBackground: 'light-dark({surface.800}, {surface.100})',
      focusRing: {
        color: 'light-dark({surface.50}, {surface.950})',
        shadow: 'none',
      },
    },
    outlined: {
      color: 'light-dark({surface.950}, {surface.0})',
      borderColor: 'light-dark({surface.950}, {surface.0})',
    },
    simple: {
      color: 'light-dark({surface.950}, {surface.0})',
    },
  },
} satisfies MessageDesignTokens
