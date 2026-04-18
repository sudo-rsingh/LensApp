import React, {useRef} from 'react';
import {View, StyleSheet, PanResponder, Animated} from 'react-native';
import {Corners, Point} from '../types';

interface Props {
  corners: Corners;
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  onChange: (corners: Corners) => void;
}

type CornerKey = keyof Corners;

const HANDLE_SIZE = 24;

export default function EdgeOverlay({
  corners,
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight,
  onChange,
}: Props) {
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;

  const toDisplay = (p: Point) => ({x: p.x * scaleX, y: p.y * scaleY});
  const toImage = (p: Point) => ({x: p.x / scaleX, y: p.y / scaleY});

  const makeHandle = (key: CornerKey) => {
    const pos = toDisplay(corners[key]);
    const pan = useRef(new Animated.ValueXY({x: pos.x, y: pos.y})).current;

    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const nx = Math.max(0, Math.min(containerWidth, pos.x + gs.dx));
        const ny = Math.max(0, Math.min(containerHeight, pos.y + gs.dy));
        pan.setValue({x: nx, y: ny});
      },
      onPanResponderRelease: (_, gs) => {
        const nx = Math.max(0, Math.min(containerWidth, pos.x + gs.dx));
        const ny = Math.max(0, Math.min(containerHeight, pos.y + gs.dy));
        onChange({...corners, [key]: toImage({x: nx, y: ny})});
      },
    });

    return (
      <Animated.View
        key={key}
        style={[
          styles.handle,
          {transform: [{translateX: Animated.subtract(pan.x, HANDLE_SIZE / 2)}, {translateY: Animated.subtract(pan.y, HANDLE_SIZE / 2)}]},
        ]}
        {...responder.panHandlers}
      />
    );
  };

  const pts = (Object.keys(corners) as CornerKey[]).map(k => toDisplay(corners[k]));
  const polygon = pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.overlay, {width: containerWidth, height: containerHeight}]} pointerEvents="box-none">
      {/* SVG-style quad outline using absolute positioned thin lines via borders */}
      {(Object.keys(corners) as CornerKey[]).map(k => makeHandle(k))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
});
