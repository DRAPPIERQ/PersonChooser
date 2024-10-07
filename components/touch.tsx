import { Colors } from '@/constants/Colors';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  NativeTouchEvent,
  StyleSheet,
  Text,
} from 'react-native';
import styles from '@/constants/Styles';

// Touch item type
export type TouchItem = {
  id: number;
  locked: boolean;
  event: NativeTouchEvent;
};

// Props
type Props = TouchItem;

// Get the device dimensions
const { width, height } = Dimensions.get('window');

// Calculate the center of the screen
const center = {
  x: width / 2,
  y: height / 2,
};

// Calculate the normalized coordinates based on the center of the screen
const normalize = (x: number, y: number) => {
  return {
    x: x - center.x,
    y: y - center.y,
  };
};

export default function Touch({ id, locked, event }: Props) {
  const pan = React.useRef(
    new Animated.ValueXY(normalize(event.pageX, event.pageY))
  ).current;

  // Update the Animated.ValueXY whenever the touch position changes
  useEffect(() => {
    Animated.spring(pan, {
      toValue: normalize(event.pageX, event.pageY),
      useNativeDriver: false,
    }).start();
    console.log(`touch#${id}`, normalize(event.pageX, event.pageY));
  }, [event, locked]);

  return (
    <Animated.View
      key={id}
      style={[
        {
          transform: pan.getTranslateTransform(),
        },
        styles.touchContainer,
        {
          backgroundColor: Colors.touch[id % Colors.touch.length],
        },
      ]}
    >
      <Text style={styles.touchText}>{id + 1}</Text>
    </Animated.View>
  );
}
