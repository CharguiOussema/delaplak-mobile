import { useMemo, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

type Touch = { pageX: number; pageY: number };

function distance([a, b]: Touch[]): number {
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;

/**
 * Single-finger drag + two-finger pinch-to-resize, built on PanResponder/Animated
 * (both ship with React Native core — no gesture-handler/reanimated dependency needed).
 * Reads Animated.Value's current value via the documented setOffset/flattenOffset
 * pattern from RN's own PanResponder docs.
 */
export function useDragResize(baseScale = 1) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(baseScale)).current;
  const pinchOrigin = useRef<{ distance: number; scale: number } | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.extractOffset();
          pinchOrigin.current = null;
        },
        onPanResponderMove: (event, gesture) => {
          const touches = event.nativeEvent.touches;
          if (touches.length >= 2) {
            const currentDistance = distance(touches as Touch[]);
            if (!pinchOrigin.current) {
              pinchOrigin.current = { distance: currentDistance, scale: (scale as unknown as { _value: number })._value };
            } else {
              const ratio = currentDistance / pinchOrigin.current.distance;
              scale.setValue(Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchOrigin.current.scale * ratio)));
            }
            return;
          }
          pinchOrigin.current = null;
          Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(event, gesture);
        },
        onPanResponderRelease: () => {
          pan.flattenOffset();
          pinchOrigin.current = null;
        },
      }),
    [pan, scale],
  );

  const reset = () => {
    pan.setValue({ x: 0, y: 0 });
    pan.setOffset({ x: 0, y: 0 });
    scale.setValue(baseScale);
    pinchOrigin.current = null;
  };

  return { pan, scale, panHandlers: panResponder.panHandlers, reset };
}
