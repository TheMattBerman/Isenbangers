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
  };

  return (
    <View className="items-center">
      {/* Pointer */}
      <View className="absolute top-0 z-10" style={{ marginTop: -10 }}>
        <View className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-red-500" />
      </View>
      
      {/* Wheel */}
      <Animated.View style={[animatedStyle, { marginTop: 20 }]}>
        {renderWheel()}
      </Animated.View>
      
      {/* Spin Button */}
      <Pressable
        onPress={spin}
        disabled={isSpinning}
        className={`mt-8 px-8 py-4 rounded-2xl flex-row items-center ${
          isSpinning ? "bg-gray-400" : "bg-orange-500"
        }`}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color="white" 
        />
        <Text className="text-white font-bold text-lg ml-2">
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Text>
      </Pressable>
    </View>
  );
}