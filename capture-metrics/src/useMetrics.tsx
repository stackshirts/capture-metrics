import React, { useContext, useEffect, useRef } from 'react';
import { AnalyticsType, MetricsContext, MetricsType } from './MetricsProvider';

export interface PageViewProps {
  name: string;
  category?: string;
  properties?: object;
  pageKey?: string | number;
  ready?: boolean;
}

interface PageViewInstanceProps extends PageViewProps {
  analytics: AnalyticsType
}

const PageView: React.FC<PageViewInstanceProps> = (props) => {

  const {
    name,
    properties,
    category,
    ready = true,
    pageKey,
    analytics,
    children = null,
  } = props

  useEffect(() => {
    if (ready) {
      analytics.page(name, properties, category)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, ready, pageKey])

  return (
    <>
      {children}
    </>
  );
}

export default function useMetrics(hookProps: object = {}) {

  const {
    current: {
      analytics: baseAnalytics,
      properties: inheritedProps,
    }
  } = useContext(MetricsContext);

  const metrics: MetricsType = {
    analytics: baseAnalytics,
    properties: {
      ...inheritedProps,
      ...hookProps,
    }
  }

  const metricsRef = useRef<MetricsType>(metrics)
  Object.assign(metricsRef.current.properties, metrics.properties);

  const analyticsRef = useRef<AnalyticsType>({
    track: (name, imperativeProps) => {
      baseAnalytics.track(name, {
        ...metricsRef.current.properties,
        ...imperativeProps
      })
    },
    page: (name, imperativeProps, category) => {
      baseAnalytics.page(name, {
        ...metricsRef.current.properties,
        ...imperativeProps
      }, category)
    }
  })

  // if (!) {
  //   throw new Error('AddProperties must be nested within MetricsProvider')
  // }

  const Capture = React.useMemo((): React.FC => ({ children }) => {
    return (
      <MetricsContext.Provider value={metricsRef}>
        {children}
      </MetricsContext.Provider>
    )
  }, [])

  const PageViewInstance = React.useMemo((): React.FC<PageViewProps> => (props) => {
    const {
      children,
    } = props
    return (
      <PageView analytics={analyticsRef.current} {...props}>
        {children}
      </PageView>
    )
  }, [])

  return {
    analytics: analyticsRef.current,
    Capture,
    PageView: PageViewInstance
  }
}
