#import <React/RCTEventEmitter.h>
#import <ReactCommon/TurboModule.h>
#import <React/RCTBridgeModule.h>
#import <CallKit/CallKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface CallDetectionManager : RCTEventEmitter <TurboModule, CXCallObserverDelegate>
@end

NS_ASSUME_NONNULL_END
