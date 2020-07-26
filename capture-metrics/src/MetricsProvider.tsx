import React, { createContext, MutableRefObject, useRef } from 'react';

export interface Track {
  (name: string, properties?: object): any;
}

export interface Page {
  (name: string, properties?: object, category?: string): any;
}

export interface AnalyticsType {
  track: Track;
  page: Page;
}

export interface MetricsType {
  properties: object,
  analytics: AnalyticsType,
}

export type MetricsRef = MutableRefObject<MetricsType>

const voidAnalytics = {
  page: () => undefined,
  track: () => undefined,
}

export const MetricsContext = createContext<MetricsRef>({
  // 👇 supposed to look like a ref object
  current: {
    properties: {},
    analytics: voidAnalytics
  }
});

interface Props {
  analytics: AnalyticsType;
  properties?: any;
}

const MetricsProvider: React.FC<Props> = (props) => {
  const {
    children,
    analytics,
    properties = {}
  } = props

  const metrics = { analytics, properties }
  const ref = useRef<MetricsType>(metrics)
  Object.assign(ref.current.analytics, metrics.analytics);
  Object.assign(ref.current.properties, metrics.properties);

  if (!analytics) {
    throw new Error('The "analytics" prop must be passed to MetricsProvider');
  }
  if (!analytics.page) {
    throw new Error('Your "analytics" API should have a "page" method');
  }
  if (!analytics.track) {
    throw new Error('Your "analytics" API should have a "track" method');
  }


  return (
    <MetricsContext.Provider value={ref}>
      {children}
    </MetricsContext.Provider>
  );
}

export default MetricsProvider;
