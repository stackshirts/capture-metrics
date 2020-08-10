import { MutableRefObject } from 'react';

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

export interface PageViewProps {
  name: string;
  category?: string;
  properties?: object;
  pageKey?: string | number;
  ready?: boolean;
}

export interface PageViewInstanceProps extends PageViewProps {
  analytics: AnalyticsType
}
