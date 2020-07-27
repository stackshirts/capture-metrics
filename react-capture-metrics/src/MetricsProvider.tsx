import React, { createContext, useRef } from 'react';
import { AnalyticsType, MetricsType } from 'src/types';

const voidAnalytics = {
  page: () => undefined,
  track: () => undefined,
}

export const MetricsContext = createContext<MetricsType>({
  // it's supposed to look like a ref object
  properties: {},
  analytics: voidAnalytics,
  ready: true,
});

// this is different from MetricsType
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
    ready = true,
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

  const metrics = { analytics, properties, ready }
  const ref = useRef<MetricsType>(metrics)
  Object.assign(ref.current, metrics);
  if (ready !== ref.current.ready) {
    ref.current = {
      ...ref.current,
      ready,
    }
  }

  return (
    <MetricsContext.Provider value={ref.current}>
      {children}
    </MetricsContext.Provider>
  );
}

export default MetricsProvider;
