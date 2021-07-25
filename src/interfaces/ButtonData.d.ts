import { ImageSourcePropType } from "react-native";

interface ButtonData {
  source: ImageSourcePropType;
  sourceActive: ImageSourcePropType;
  onPress?: (params: any) => void;
  onLongPress?: (params: any) => void;
  flex?: number;
  disabled?: boolean;
  active?: boolean;
}

export default ButtonData;
