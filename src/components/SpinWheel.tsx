import React from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = width * 0.8;
const RADIUS = WHEEL_SIZE / 2;

interface SpinWheelProps {
  onSpinComplete: (isRare: boolean) => void;
  isSpinning: boolean;
}

export default function SpinWheel({ onSpinComplete, isSpinning }: SpinWheelProps) {
  const rotation = useSharedValue(0);
  
  const segments = [
    { label: "Regular", color: "#3b82f6", isRare: false },
    { label: "Rare", color: "#fbbf24", isRare: true },
    { label: "Regular", color: "#10b981", isRare: false },
    { label: "Regular", color: "#8b5cf6", isRare: false },
    { label: "Regular", color: "#ef4444", isRare: false },
    { label: "Regular", color: "#f97316", isRare: false },
  ];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const spin = () => {
    if (isSpinning) return;

    const randomRotation = Math.random() * 360 + 1440; // At least 4 full rotations
    const finalAngle = randomRotation % 360;
    const segmentAngle = 360 / segments.length;
    const selectedSegmentIndex = Math.floor((360 - finalAngle) / segmentAngle) % segments.length;
    const selectedSegment = segments[selectedSegmentIndex];

    rotation.value = withSequence(
      withTiming(randomRotation, { duration: 3000 }),
      withTiming(randomRotation, { duration: 0 }, () => {
        runOnJS(onSpinComplete)(selectedSegment.isRare);
      })
    );
  };

  const renderWheel = () => {
    const segmentAngle = 360 / segments.length;
    
    try {
      return (
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          {segments.map((segment, index) => {
            const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
            const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
            
            const x1 = RADIUS + (RADIUS - 20) * Math.cos(startAngle);
            const y1 = RADIUS + (RADIUS - 20) * Math.sin(startAngle);
            const x2 = RADIUS + (RADIUS - 20) * Math.cos(endAngle);
            const y2 = RADIUS + (RADIUS - 20) * Math.sin(endAngle);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${RADIUS} ${RADIUS}`,
              `L ${x1} ${y1}`,
              `A ${RADIUS - 20} ${RADIUS - 20} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z"
            ].join(" ");

            const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
            const textX = RADIUS + (RADIUS - 60) * Math.cos(textAngle);
            const textY = RADIUS + (RADIUS - 60) * Math.sin(textAngle);

            return (
              <React.Fragment key={index}>
                <Path d={pathData} fill={segment.color} stroke="#fff" strokeWidth="2" />
                <SvgText
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {segment.label}
                </SvgText>
              </React.Fragment>
            );
          })}
          
          {/* Center circle */}
          <Circle cx={RADIUS} cy={RADIUS} r="30" fill="#1f2937" stroke="#fff" strokeWidth="3" />
        </Svg>
      );
    } catch (error) {
      // Fallback wheel if SVG fails
      return (
        <View
          style={{
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            borderRadius: WHEEL_SIZE / 2,
            backgroundColor: '#f97316',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: 'white',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            🎯
          </Text>
          <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Spin Wheel
          </Text>
        </View>
      );
    }
  };

  return (
    <View 
      className="items-center"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {/* Pointer */}
      <View 
        className="absolute top-0 z-10" 
        style={{ 
          position: 'absolute',
          top: -10,
          zIndex: 10,
          alignItems: 'center',
        }}
      >
        <View 
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 15,
            borderRightWidth: 15,
            borderBottomWidth: 30,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#ef4444',
          }}
        />
      </View>
      
      {/* Wheel */}
      <Animated.View style={[animatedStyle, { marginTop: 20 }]}>
        {renderWheel()}
      </Animated.View>
      
      {/* Spin Button */}
      <Pressable
        onPress={spin}
        disabled={isSpinning}
        style={{
          marginTop: 32,
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isSpinning ? '#9ca3af' : '#f97316',
        }}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color="white" 
        />
        <Text 
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
            marginLeft: 8,
          }}
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Text>
      </Pressable>
    </View>
  );
}