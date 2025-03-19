import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  startListener(): void;
  stopListener(): void;
  checkPhoneState(callback: (isInCall: boolean) => void): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CallDetectionManager');