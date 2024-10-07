import { Colors } from '@/constants/Colors';
import styles from '@/constants/Styles';
import Touch, { TouchItem } from '@/components/touch';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Animated,
  GestureResponderEvent,
  NativeTouchEvent,
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

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

export default function Index() {
  // === COUNTER LOGIC ===
  // Counter state
  const INITIAL_COUNT = 3;
  const [count, setCount] = React.useState(INITIAL_COUNT);
  const [counterStarted, setCounterStarted] = React.useState(false);
  // Trigger the counter
  const triggerCounter = (callback: Function) => {
    setCounterStarted(true);
    const interval = setInterval(() => {
      setCount((count: number) => {
        if (count > 1) return count - 1;

        clearInterval(interval);
        setCounterStarted(false);
        callback && callback();
        return INITIAL_COUNT;
      });
    }, 1000);
  };

  // === SELECTED TOUCH LOGIC ===
  // Selected touch state
  const [selectedTouch, setSelectedTouch] = React.useState<TouchItem | null>(
    null
  );
  // Select a random touch
  const selectRandomTouch = () => {
    if (touches.length === 0) return;
    const randomIndex = Math.floor(Math.random() * touches.length);
    const chosenTouch = touches[randomIndex];
    // Set the selected touch
    setSelectedTouch(chosenTouch);
  };

  // === TOUCHES LOGIC ===
  // Store touches
  const [touches, setTouches] = React.useState<TouchItem[]>([]);
  // Event handlers
  const isTouchAllowed = useMemo(() => {
    return !selectedTouch && !counterStarted;
  }, [selectedTouch, counterStarted]);
  // Allow the component to respond to touch
  const onStartShouldSetResponder = (event: GestureResponderEvent): boolean => {
    // Allow the component to respond to touch
    return true;
  };
  // Add touches
  const onResponderMove = (event: GestureResponderEvent) => {
    if (!isTouchAllowed) return;
    // Update touches with current touch positions
    event.nativeEvent.touches.forEach((event: NativeTouchEvent) => {
      if (
        touches.some(
          (touch: TouchItem) => touch.id === parseInt(event.identifier)
        )
      ) {
        setTouches((touches: TouchItem[]) =>
          touches.map((touch: TouchItem) => {
            if (touch.id === parseInt(event.identifier)) {
              touch.event = event;
              touch.locked = false;
            }
            return touch;
          })
        );
      } else {
        setTouches((touches: TouchItem[]) =>
          touches.concat([
            {
              id: parseInt(event.identifier),
              locked: false,
              event,
            },
          ])
        );
      }
    });
  };
  // Release touches and lock them then trigger the counter after a second
  const onResponderRelease = (event: GestureResponderEvent) => {
    if (!isAnimating && selectedTouch) restart();
    if (!isTouchAllowed) {
      return;
    }
    // If every touch has been released, lock each touch
    if (event.nativeEvent.touches.length === 0) {
      setTouches((touches: TouchItem[]) =>
        touches.map((touch: TouchItem) => {
          touch.locked = true;
          return touch;
        })
      );
      // wait for a second before triggering the counter
      setTimeout(() => {
        triggerCounter(selectRandomTouch);
      }, 800);
    }
  };

  // === RESTART LOGIC ===
  const [isRestarting, setIsRestarting] = React.useState(false);
  const restart = () => {
    // Prevent multiple restarts
    if (isAnimating || !selectedTouch) return;

    // Reset the counter
    setCount(INITIAL_COUNT);
    setCounterStarted(false);
    // Reset the touches
    setTouches([]);

    // Reset the animation value
    animationValue.setValue(1);

    // Start the animation
    setIsAnimating(true);
    setIsRestarting(true);
    Animated.timing(animationValue, {
      toValue: 0, // End the animation at full uncoverage
      duration: 1000, // Set the duration to 1 seconds
      useNativeDriver: false,
    }).start(() => {
      // Stop the isAnimating state
      setIsAnimating(false);
      // Reset the isRestarting state
      setIsRestarting(false);
      // Reset the selected touch
      setSelectedTouch(null);
    });
  };

  // === BACKGROUND FILL LOGIC ===
  // Animation values
  const [isAnimating, setIsAnimating] = React.useState(false);
  const fillPoint = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const animationValue = React.useRef(new Animated.Value(0)).current;
  // Use useEffect to start the animation when selectedTouch is updated
  React.useEffect(() => {
    if (selectedTouch) {
      // Set the fill point to the selected touch
      fillPoint.setValue(
        normalize(selectedTouch.event.pageX, selectedTouch.event.pageY)
      );

      // Reset the animation value
      animationValue.setValue(0);

      // Start the animation
      setIsAnimating(true);
      Animated.timing(animationValue, {
        toValue: 1, // End the animation at full coverage
        duration: 2500, // Set the duration to 2.5 seconds
        useNativeDriver: false,
      }).start(() => {
        // Stop the isAnimating state
        setIsAnimating(false);
      });
    }
  }, [selectedTouch]);
  // Interpolating the animation value for radius
  const radius = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(width, height) * 3], // Extend radius to ensure full screen coverage
  });

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderRelease={onResponderRelease}
    >
      {/* Display counter */}
      {counterStarted && (
        <Animated.View
          style={[styles.overlayContainer, { backgroundColor: 'black' }]}
        >
          <Text style={styles.counterText}>{count}</Text>
        </Animated.View>
      )}

      {/* Display selected touch */}
      {selectedTouch && (
        <Animated.View
          style={[
            styles.overlayContainer,
            {
              backgroundColor: isRestarting
                ? 'transparent'
                : 'rgba(0, 0, 0, 0.75)',
            },
          ]}
        >
          {/* Bakcground filler */}
          <Animated.View
            style={[
              {
                transform: fillPoint.getTranslateTransform(),
              },
              {
                width: radius,
                height: radius,
                borderRadius: radius,
              },
              {
                backgroundColor:
                  Colors.touch[selectedTouch.id % Colors.touch.length],
              },
            ]}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* <Touch key={selectedTouch.id} {...selectedTouch} /> */}
              <Text
                style={{
                  color: 'white',
                  fontSize: 32,
                }}
              >
                {selectedTouch.id + 1}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {/* Display touches */}
      {touches.map((touch: TouchItem) => (
        <Touch key={touch.id} {...touch} />
      ))}
    </View>
  );
}
