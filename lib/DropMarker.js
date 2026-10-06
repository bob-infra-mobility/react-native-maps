"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DROP_MARKER_COLOR = void 0;
exports.dropMarkerExtent = dropMarkerExtent;
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const MapMarker_1 = __importDefault(require("./MapMarker"));
/**
 * bob's drop-location marker: a red pin with the place name set in the app
 * font, in one of three styles.
 *
 * - `pin`: teardrop pin under a white tooltip (Swiggy / Zomato style)
 * - `pill`: dot pin under a dark label pill
 * - `endpoint`: square end-point with the label to its right (Uber style)
 *
 * Google Maps snapshots a marker's children into a bitmap (Android) or an icon
 * view (iOS), and a snapshot taken before text has been measured is what made
 * earlier drop labels draw half a pill. So every variant draws inside a box
 * whose size is fixed before layout: the label can be any width inside the
 * box, but the box, and with it the anchor, never depends on the text.
 */
exports.DROP_MARKER_COLOR = '#D92D20';
// bob's dark surface tokens (BPRIMARY, CLICKABLE2, TPRIMARY, TSECONDARY,
// TTERTIARY in bob-native's tailwind.config.js).
const SURFACE = '#161616';
const SURFACE_BORDER = '#464646';
const ON_SURFACE = '#FFFFFF';
const ON_SURFACE_MUTED = '#A1A1A1';
const TOOLTIP = '#FFFFFF';
const ON_TOOLTIP = '#161616';
const ON_TOOLTIP_MUTED = '#585858';
const OUTLINE = '#FFFFFF';
const GROUND_SHADOW = 'rgba(0, 0, 0, 0.4)';
const DEFAULT_VARIANT = 'pin';
const DEFAULT_MAX_LABEL_WIDTH = 200;
const DEFAULT_CAPTION = { pin: 'Drop', pill: 'Drop', endpoint: null };
// Line heights are explicit and font scaling is off, so a bubble's height is
// known before layout and the anchor can be computed up front.
const CAPTION_FONT_SIZE = 11;
const CAPTION_LINE_HEIGHT = 14;
const TITLE_FONT_SIZE = 13;
const TITLE_LINE_HEIGHT = 18;
// How long the marker keeps re-snapshotting after its content changes: long
// enough for the first layout and font draw to land, short enough that the map
// is not redrawing an unchanging bitmap every frame.
const TRACKING_WINDOW_MS = 1000;
// pin
const TOOLTIP_PADDING_V = 7;
const TOOLTIP_PADDING_H = 12;
const TOOLTIP_TAIL = 7;
const TOOLTIP_GAP = 3;
const PIN_HEAD = 26;
const PIN_BOX_WIDTH = 32;
const PIN_BOX_HEIGHT = 36;
const PIN_HEAD_CENTER_Y = 15;
// The head is a square with three rounded corners, rotated 45°: the sharp
// corner lands half a diagonal straight below the centre.
const PIN_TIP_Y = PIN_HEAD_CENTER_Y + (PIN_HEAD / 2) * Math.SQRT2;
const PIN_CORE = 12;
const PIN_CORE_DOT = 6;
const SHADOW_WIDTH = 16;
const SHADOW_HEIGHT = 5;
// pill
const PILL_BORDER = 1;
const PILL_PADDING_V = 6;
const PILL_PADDING_H = 12;
const PILL_TAIL = 7;
const PILL_STEM = 7;
const DOT_SIZE = 14;
const DOT_HALO = 26;
// endpoint
const ENDPOINT_SIZE = 16;
const ENDPOINT_CORE = 8;
const ENDPOINT_CONNECTOR = 8;
const LABEL_BORDER = 1;
const LABEL_PADDING_V = 5;
const LABEL_PADDING_H = 10;
const LABEL_HEIGHT = LABEL_BORDER * 2 + LABEL_PADDING_V * 2 + TITLE_LINE_HEIGHT;
const LABEL_LEFT = ENDPOINT_SIZE + ENDPOINT_CONNECTOR;
const resolveCaption = (variant, caption) => caption === undefined ? DEFAULT_CAPTION[variant] : caption;
/** The marker's box and where the coordinate sits in it, all in dp. */
function layoutFor(variant, hasCaption, maxLabelWidth) {
    const textHeight = TITLE_LINE_HEIGHT + (hasCaption ? CAPTION_LINE_HEIGHT : 0);
    if (variant === 'endpoint') {
        const width = LABEL_LEFT + maxLabelWidth;
        return {
            width,
            height: LABEL_HEIGHT,
            anchor: { x: ENDPOINT_SIZE / 2 / width, y: 0.5 },
            anchorY: LABEL_HEIGHT / 2,
        };
    }
    if (variant === 'pill') {
        const bubbleHeight = PILL_BORDER * 2 + PILL_PADDING_V * 2 + textHeight;
        const tailTop = bubbleHeight - PILL_BORDER;
        const stemTop = tailTop + PILL_TAIL - 1;
        const dotTop = stemTop + PILL_STEM - 1;
        const dotCenter = dotTop + DOT_SIZE / 2;
        const height = dotCenter + DOT_HALO / 2;
        const width = Math.max(maxLabelWidth, DOT_HALO);
        return {
            width,
            height,
            anchor: { x: 0.5, y: dotCenter / height },
            anchorY: dotCenter,
            bubbleHeight,
            tailTop,
            stemTop,
            dotTop,
        };
    }
    const bubbleHeight = TOOLTIP_PADDING_V * 2 + textHeight;
    const tailTop = bubbleHeight - 1;
    const pinTop = tailTop + TOOLTIP_TAIL + TOOLTIP_GAP;
    const tipY = pinTop + PIN_TIP_Y;
    const height = Math.ceil(tipY + SHADOW_HEIGHT / 2) + 1;
    const width = Math.max(maxLabelWidth, PIN_BOX_WIDTH);
    return {
        width,
        height,
        anchor: { x: 0.5, y: tipY / height },
        anchorY: tipY,
        bubbleHeight,
        tailTop,
        pinTop,
        tipY,
    };
}
/**
 * How far (dp) the drop marker reaches past its coordinate on each side.
 *
 * Use it to frame the camera: padding a fit by these keeps the whole label on
 * screen, not just the coordinate it points at.
 */
function dropMarkerExtent({ variant = DEFAULT_VARIANT, caption, maxLabelWidth = DEFAULT_MAX_LABEL_WIDTH, } = {}) {
    const layout = layoutFor(variant, !!resolveCaption(variant, caption), maxLabelWidth);
    const left = layout.anchor.x * layout.width;
    return {
        top: layout.anchorY,
        right: layout.width - left,
        bottom: layout.height - layout.anchorY,
        left,
    };
}
const triangle = (width, height, color) => ({
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: width / 2,
    borderRightWidth: width / 2,
    borderTopWidth: height,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: color,
});
const centered = (boxWidth, width) => (boxWidth - width) / 2;
function Caption({ text, fontFamily, color }) {
    return (<react_native_1.Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={[styles.caption, { fontFamily, color }]}>
      {text}
    </react_native_1.Text>);
}
function Title({ text, fontFamily, color }) {
    return (<react_native_1.Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { fontFamily, color }]}>
      {text}
    </react_native_1.Text>);
}
function PinBody({ layout, title, caption, color, fontFamily, captionFontFamily }) {
    const { width, bubbleHeight, tailTop, pinTop, tipY } = layout;
    return (<>
      <react_native_1.View style={styles.row}>
        <react_native_1.View style={[styles.tooltip, { height: bubbleHeight, maxWidth: width }]}>
          {caption ? (<Caption text={caption} fontFamily={captionFontFamily} color={ON_TOOLTIP_MUTED}/>) : null}
          <Title text={title} fontFamily={fontFamily} color={ON_TOOLTIP}/>
        </react_native_1.View>
      </react_native_1.View>
      <react_native_1.View style={[
            styles.absolute,
            triangle(12, TOOLTIP_TAIL, TOOLTIP),
            { top: tailTop, left: centered(width, 12) },
        ]}/>
      <react_native_1.View style={[
            styles.absolute,
            styles.groundShadow,
            { top: tipY - SHADOW_HEIGHT / 2, left: centered(width, SHADOW_WIDTH) },
        ]}/>
      <react_native_1.View style={[
            styles.absolute,
            styles.pinBox,
            { top: pinTop, left: centered(width, PIN_BOX_WIDTH) },
        ]}>
        <react_native_1.View style={[styles.pinHead, { backgroundColor: color }]}/>
        <react_native_1.View style={styles.pinCore}>
          <react_native_1.View style={[styles.pinCoreDot, { backgroundColor: color }]}/>
        </react_native_1.View>
      </react_native_1.View>
    </>);
}
function PillBody({ layout, title, caption, color, fontFamily, captionFontFamily }) {
    const { width, bubbleHeight, tailTop, stemTop, dotTop } = layout;
    return (<>
      <react_native_1.View style={styles.row}>
        <react_native_1.View style={[styles.pill, { height: bubbleHeight, maxWidth: width }]}>
          {caption ? (<Caption text={caption} fontFamily={captionFontFamily} color={ON_SURFACE_MUTED}/>) : null}
          <Title text={title} fontFamily={fontFamily} color={ON_SURFACE}/>
        </react_native_1.View>
      </react_native_1.View>
      {/* Outline first, fill 1dp inside it: the fill covers the pill's bottom
            border where the tail joins, so the tail reads as part of the pill. */}
      <react_native_1.View style={[
            styles.absolute,
            triangle(14, PILL_TAIL, SURFACE_BORDER),
            { top: tailTop, left: centered(width, 14) },
        ]}/>
      <react_native_1.View style={[
            styles.absolute,
            triangle(12, PILL_TAIL - 1, SURFACE),
            { top: tailTop, left: centered(width, 12) },
        ]}/>
      <react_native_1.View style={[
            styles.absolute,
            styles.dotHalo,
            {
                backgroundColor: color,
                top: dotTop + DOT_SIZE / 2 - DOT_HALO / 2,
                left: centered(width, DOT_HALO),
            },
        ]}/>
      <react_native_1.View style={[
            styles.absolute,
            styles.stem,
            { top: stemTop, left: centered(width, 2) },
        ]}/>
      <react_native_1.View style={[
            styles.absolute,
            styles.dot,
            { backgroundColor: color, top: dotTop, left: centered(width, DOT_SIZE) },
        ]}/>
    </>);
}
function EndpointBody({ layout, title, caption, color, fontFamily, captionFontFamily }) {
    const { width } = layout;
    return (<>
      <react_native_1.View style={[styles.absolute, styles.endpoint]}>
        <react_native_1.View style={[styles.endpointCore, { backgroundColor: color }]}/>
      </react_native_1.View>
      <react_native_1.View style={[styles.absolute, styles.connector]}/>
      <react_native_1.View style={[styles.absolute, styles.label, { maxWidth: width - LABEL_LEFT }]}>
        <react_native_1.Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { fontFamily, color: ON_SURFACE }]}>
          {caption ? (<react_native_1.Text style={[styles.caption, { fontFamily: captionFontFamily, color: ON_SURFACE_MUTED }]}>
              {`${caption}  `}
            </react_native_1.Text>) : null}
          {title}
        </react_native_1.Text>
      </react_native_1.View>
    </>);
}
function DropMarker(props) {
    // `description`, `anchor` and `children` are dropped rather than forwarded: a
    // native description pops Google's stock info window over the label, and the
    // anchor and children are what this component draws.
    const { title, caption: captionProp, variant = DEFAULT_VARIANT, color = exports.DROP_MARKER_COLOR, fontFamily = 'Geist-Medium', captionFontFamily = 'Geist-Regular', maxLabelWidth = DEFAULT_MAX_LABEL_WIDTH, tracksViewChanges, description: _description, anchor: _anchor, children: _children, ...markerProps } = props;
    const caption = resolveCaption(variant, captionProp);
    const layout = layoutFor(variant, !!caption, maxLabelWidth);
    const [tracking, setTracking] = React.useState(true);
    React.useEffect(() => {
        setTracking(true);
        const timer = setTimeout(() => setTracking(false), TRACKING_WINDOW_MS);
        return () => clearTimeout(timer);
    }, [variant, title, caption, color, fontFamily, captionFontFamily, maxLabelWidth]);
    const Body = variant === 'endpoint' ? EndpointBody : variant === 'pill' ? PillBody : PinBody;
    return (<MapMarker_1.default {...markerProps} anchor={layout.anchor} tracksViewChanges={tracksViewChanges ?? tracking}>
      <react_native_1.View collapsable={false} pointerEvents="none" style={{ width: layout.width, height: layout.height }}>
        <Body layout={layout} title={title} caption={caption} color={color} fontFamily={fontFamily} captionFontFamily={captionFontFamily}/>
      </react_native_1.View>
    </MapMarker_1.default>);
}
const styles = react_native_1.StyleSheet.create({
    absolute: {
        position: 'absolute',
    },
    row: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    caption: {
        fontSize: CAPTION_FONT_SIZE,
        lineHeight: CAPTION_LINE_HEIGHT,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    title: {
        fontSize: TITLE_FONT_SIZE,
        lineHeight: TITLE_LINE_HEIGHT,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    tooltip: {
        justifyContent: 'center',
        backgroundColor: TOOLTIP,
        borderRadius: 12,
        paddingHorizontal: TOOLTIP_PADDING_H,
        paddingVertical: TOOLTIP_PADDING_V,
    },
    groundShadow: {
        width: SHADOW_WIDTH,
        height: SHADOW_HEIGHT,
        borderRadius: SHADOW_HEIGHT / 2,
        backgroundColor: GROUND_SHADOW,
    },
    pinBox: {
        width: PIN_BOX_WIDTH,
        height: PIN_BOX_HEIGHT,
    },
    pinHead: {
        position: 'absolute',
        left: (PIN_BOX_WIDTH - PIN_HEAD) / 2,
        top: PIN_HEAD_CENTER_Y - PIN_HEAD / 2,
        width: PIN_HEAD,
        height: PIN_HEAD,
        borderTopLeftRadius: PIN_HEAD / 2,
        borderTopRightRadius: PIN_HEAD / 2,
        borderBottomLeftRadius: PIN_HEAD / 2,
        borderBottomRightRadius: 0,
        borderWidth: 2,
        borderColor: OUTLINE,
        transform: [{ rotate: '45deg' }],
    },
    pinCore: {
        position: 'absolute',
        left: (PIN_BOX_WIDTH - PIN_CORE) / 2,
        top: PIN_HEAD_CENTER_Y - PIN_CORE / 2,
        width: PIN_CORE,
        height: PIN_CORE,
        borderRadius: PIN_CORE / 2,
        backgroundColor: OUTLINE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pinCoreDot: {
        width: PIN_CORE_DOT,
        height: PIN_CORE_DOT,
        borderRadius: PIN_CORE_DOT / 2,
    },
    pill: {
        justifyContent: 'center',
        backgroundColor: SURFACE,
        borderColor: SURFACE_BORDER,
        borderWidth: PILL_BORDER,
        borderRadius: 12,
        paddingHorizontal: PILL_PADDING_H,
        paddingVertical: PILL_PADDING_V,
    },
    dotHalo: {
        width: DOT_HALO,
        height: DOT_HALO,
        borderRadius: DOT_HALO / 2,
        opacity: 0.22,
    },
    stem: {
        width: 2,
        height: PILL_STEM,
        backgroundColor: OUTLINE,
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        borderWidth: 3,
        borderColor: OUTLINE,
    },
    endpoint: {
        left: 0,
        top: (LABEL_HEIGHT - ENDPOINT_SIZE) / 2,
        width: ENDPOINT_SIZE,
        height: ENDPOINT_SIZE,
        borderRadius: 4,
        backgroundColor: OUTLINE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    endpointCore: {
        width: ENDPOINT_CORE,
        height: ENDPOINT_CORE,
        borderRadius: 2,
    },
    connector: {
        left: ENDPOINT_SIZE,
        top: LABEL_HEIGHT / 2 - 1,
        width: ENDPOINT_CONNECTOR,
        height: 2,
        backgroundColor: OUTLINE,
    },
    label: {
        left: LABEL_LEFT,
        top: 0,
        height: LABEL_HEIGHT,
        justifyContent: 'center',
        backgroundColor: SURFACE,
        borderColor: SURFACE_BORDER,
        borderWidth: LABEL_BORDER,
        borderRadius: 10,
        paddingHorizontal: LABEL_PADDING_H,
    },
});
exports.default = React.memo(DropMarker);
