import React from "react";
import { Image, ImageSourcePropType, TouchableOpacity } from "react-native";

interface ArrowButtonProps {
  vertical: boolean;
  source: ImageSourcePropType;
  onPress(): void;
  disabled: boolean;
}

const ArrowButton = ({
  vertical = false,
  source,
  onPress,
  disabled = false,
}: ArrowButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Image
        style={
          vertical
            ? {
                width: 11 * 1.3,
                height: 22 * 1.3,
                margin: 20,
              }
            : {
                height: 11 * 1.3,
                width: 22 * 1.3,
                margin: 20,
              }
        }
        source={source}
      />
    </TouchableOpacity>
  );
};

export default ArrowButton;
