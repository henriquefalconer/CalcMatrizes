/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./src";
import { name as appName } from "./app.json";

// TODO: Make app icon work again in iOS (after updating to react-native v0.76, the app icon stopped working for some reason)

AppRegistry.registerComponent(appName, () => App);
