import TagManager from 'react-gtm-module'

export const sendEvent = (eventName, eventData = {}) => {
  TagManager.dataLayer({
    dataLayer: {
      event: eventName,
      ...eventData
    }
  })
}