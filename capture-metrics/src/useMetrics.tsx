import React, { useContext, useEffect, useRef } from 'react';
import { MetricsContext } from './MetricsProvider';
import { AnalyticsType, MetricsType, PageViewInstanceProps, PageViewProps } from 'src/types';

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

interface Config {
  ready?: boolean;
}

export default function useMetrics(hookProps: object = {}, config: Config = {}) {

  const {
    ready,
  } = config;

  const {
    analytics: originalAnalytics,
    properties: inheritedProps,
    ready: inheritedReady,
  } = useContext(MetricsContext);

  const metrics: MetricsType = {
    analytics: originalAnalytics,
    properties: {
      ...inheritedProps,
      ...hookProps,
    },
    ready: inheritedReady && ready,
  }

  const metricsRef = useRef<MetricsType>(metrics)
  Object.assign(metricsRef.current, metrics);

  // These are only useful at this exact level in DOM heirarchy
  const { current: capturedAnalytics } = useRef<AnalyticsType>({
    track: (name, imperativeProps) => {
      originalAnalytics.track(name, {
        ...metricsRef.current.properties,
        ...imperativeProps
      })
    },
    page: (name, imperativeProps, category) => {
      originalAnalytics.page(name, {
        ...metricsRef.current.properties,
        ...imperativeProps
      }, category)
    }
  })

  const pvRef = useRef<MetricsType>(metrics);

  // if (!) {
  //   throw new Error('AddProperties must be nested within MetricsProvider')
  // }

  const Capture = React.useMemo((): React.FC => ({ children }) => {
    return (
      <MetricsContext.Provider value={metricsRef.current}>
        {children}
      </MetricsContext.Provider>
    )
  }, [])

  const PageViewInstance = React.useMemo((): React.FC<PageViewProps> => (props) => {
    const {
      children,
      name,
      category,
      properties, // even more properties can be put on <PageView />
      ready,
    } = props

    Object.assign(pvRef.current.properties, {
      pageName: name,
      pageCategory: category,
      ...properties,
    });

    return (
      <PageView ready={metrics.ready && ready} analytics={capturedAnalytics} {...props}>
        <MetricsContext.Provider value={pvRef.current}>
          {children}
        </MetricsContext.Provider>
      </PageView>
    )
  }, [])

  return {
    analytics: capturedAnalytics,
    Capture,
    PageView: PageViewInstance,
    ready,
  }
}
