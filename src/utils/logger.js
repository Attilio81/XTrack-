// Utility per gestire il logging in base all'ambiente
const isDevelopment = import.meta.env.DEV

export const logger = {
  error: (message, error) => {
    if (isDevelopment) {
      console.error(message, error)
    }
  },
  
  warn: (message, data) => {
    if (isDevelopment) {
      console.warn(message, data)
    }
  },
  
  info: (message, data) => {
    if (isDevelopment) {
      console.info(message, data)
    }
  },
  
  debug: (message, data) => {
    if (isDevelopment) {
      console.debug(message, data)
    }
  }
}
