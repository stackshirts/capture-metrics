import React, { useContext, useEffect, useRef } from 'react';
import { MetricsContext, voidAnalytics } from './MetricsProvider';
import { AnalyticsType, MetricsType, PageViewInstanceProps, PageViewProps } from 'src/types';

const PageView: React.FC<PageViewInstanceProps> = (props) => {

  const {
    name,
    properties,
    category,
    pageKey,
    analytics,
    children = null,
  } = props

  useEffect(() => {
    analytics.page(name, properties, category)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, pageKey])

  return (
    <>
      {children}
    </>
  );
}

export default function useMetrics(properties: object = {}) {

  const parentMetrics = useContext(MetricsContext);

  // think of this like a node in an n-tree
  const metricsRef = useRef<MetricsType>({
    analytics: {
      track: (name, bubbledProps) => {
        parentMetrics.analytics.track(name, {
          ...metricsRef.current.properties,
          ...bubbledProps
        })
      },
      page: (name, bubbledProps, category) => {
        parentMetrics.analytics.page(name, {
          ...metricsRef.current.properties,
          ...bubbledProps
        }, category)
      }
    },
    properties,
  })
  Object.assign(metricsRef.current, { properties })

  const pageViewAnalyticsRef = useRef<AnalyticsType>(voidAnalytics)

  // if (!metricsProvided) {
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
      name: pageName,
      category: pageCategory,
    } = props

    Object.assign(pageViewAnalyticsRef.current, {
      track: (name, bubbledProps = {}) => {
        parentMetrics.analytics.track(name, {
          ...metricsRef.current.properties,
          ...properties,
          ...bubbledProps,
          pageName,
          pageCategory,
        })
      },
      page: (name, bubbledProps = {}, category) => {
        parentMetrics.analytics.page(name, {
          ...metricsRef.current.properties,
          ...properties,
          ...bubbledProps,
          pageName,
          pageCategory,
        }, category)
      }
    } as AnalyticsType)

    return (
      <PageView analytics={metricsRef.current.analytics} {...props}>
        <MetricsContext.Provider value={metricsRef.current}>
          {children}
        </MetricsContext.Provider>
      </PageView>
    )
  }, [])

  return {
    analytics: metricsRef.current.analytics,
    Capture,
    PageView: PageViewInstance,
  }
}
