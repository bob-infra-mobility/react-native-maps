import * as React from 'react';
import type { MapMarkerProps } from './MapMarker';
/**
 * - `pin`: teardrop pin under a white tooltip (Swiggy / Zomato style)
 * - `pill`: dot pin under a dark label pill
 * - `endpoint`: square end-point with the label to its right (Uber style)
 */
export type DropMarkerVariant = 'pin' | 'pill' | 'endpoint';
export type DropMarkerProps = Omit<MapMarkerProps, 'title' | 'description' | 'anchor' | 'centerOffset' | 'calloutAnchor' | 'calloutOffset' | 'image' | 'icon' | 'pinColor' | 'hideMarkerVisual' | 'children'> & {
    /**
     * The place name. One line, ellipsised past `maxLabelWidth`.
     */
    title: string;
    /**
     * Small muted label beside the title. Pass `null` to hide it.
     *
     * @default "Drop" for `pin` and `pill`, none for `endpoint`
     */
    caption?: string | null;
    /**
     * @default 'pin'
     */
    variant?: DropMarkerVariant;
    /**
     * Pin colour.
     *
     * @default '#D92D20'
     */
    color?: string;
    /**
     * Font of the title. Must be a family the app has loaded.
     *
     * @default 'Geist-Medium'
     */
    fontFamily?: string;
    /**
     * Font of the caption. Must be a family the app has loaded.
     *
     * @default 'Geist-Regular'
     */
    captionFontFamily?: string;
    /**
     * Widest the label can get, in dp.
     *
     * @default 200
     */
    maxLabelWidth?: number;
};
/**
 * How far (dp) a drop marker reaches past its coordinate on each side.
 */
export type DropMarkerExtent = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare const DROP_MARKER_COLOR = "#D92D20";
/**
 * How far (dp) the drop marker reaches past its coordinate on each side.
 *
 * Use it to frame the camera: padding a fit by these keeps the whole label on
 * screen, not just the coordinate it points at.
 */
export declare function dropMarkerExtent(options?: {
    variant?: DropMarkerVariant;
    caption?: string | null;
    maxLabelWidth?: number;
}): DropMarkerExtent;
declare const _default: React.NamedExoticComponent<DropMarkerProps>;
export default _default;
