import MapView from "@arcgis/core/views/MapView";
import Widget from "@arcgis/core/widgets/Widget";
import SceneView from "@arcgis/core/views/SceneView.js";

import type { ChartConfiguration } from "chart.js/auto";

export interface ChartFiltered {
  chart: any;
  sql_filter: ArcgisFilter[];

  size?: {
    width: number;
    height: number;
  };
}

export interface ArcgisFilter {
  label?: string,
  onStatisticField: string;
  outStatisticFieldName: string;
  statisticType: string;
}
export interface LayerFilter {
  where: string;
  label: string;
}


export interface DragSearchMapParams {
  // map: WebMap | Map
  csv_url: string;
  fieldNames: string[];
  options?: {
    drag_filter?: {
      sql_filter: ArcgisFilter[];
      where?: string;
    };
    layer_filter?: LayerFilter[];
  };
  // 'on:event': (e: CustomEvent<boolean>) => void;
}


export interface MapWrapperParams {
  csv_url: string;

  charts: ChartFiltered[];
  fieldNames: string[];

  options?: {
    drag_filter?: {
      radius?: number;
      fieldNames: string[];
      where?: string;
    };
    layer_filter?: LayerFilter[];
  };
}
