import React, { createContext, useRef } from 'react';
import { AnalyticsType, MetricsRef, MetricsType } from 'src/types';

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
