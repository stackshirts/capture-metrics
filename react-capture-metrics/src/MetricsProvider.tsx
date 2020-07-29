import React, { createContext, useRef } from 'react';
import { AnalyticsType, MetricsType } from 'src/types';

export const voidAnalytics = {
  page: () => undefined,
  track: () => undefined,
}

export const MetricsContext = createContext<MetricsType>({
  analytics: voidAnalytics,
  properties: {}
});

interface Props {
  analytics: AnalyticsType;
  properties?: any;
  ready?: boolean;
}

const MetricsProvider: React.FC<Props> = (props) => {
  const {
    children,
    analytics,
    properties = {},
  } = props

  if (!analytics) {
    throw new Error('The "analytics" prop must be passed to MetricsProvider');
  }
  if (!analytics.page) {
    throw new Error('Your "analytics" API should have a "page" method');
  }
  if (!analytics.track) {
    throw new Error('Your "analytics" API should have a "track" method');
  }

  const metricsRef = useRef<MetricsType>({
    analytics: {
      track: (name, bubbledProps = {}) => {
        analytics.track(name, {
          ...metricsRef.current.properties,
          ...bubbledProps
        })
      },
      page: (name, bubbledProps = {}, category) => {
        analytics.page(name, {
          ...metricsRef.current.properties,
          ...bubbledProps
        }, category)
      }
    },
    properties,
  })
  Object.assign(metricsRef.current, { properties })

  return (
    <MetricsContext.Provider value={metricsRef.current}>
      {children}
    </MetricsContext.Provider>
  );
}

export default MetricsProvider;
