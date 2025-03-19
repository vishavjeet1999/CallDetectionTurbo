#import "CallDetectionManager.h"
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/TurboModuleUtils.h>
#import <CallKit/CallKit.h>

using namespace facebook;

@interface CallDetectionManager () <CXCallObserverDelegate>
@property(nonatomic, strong) CXCallObserver *callObserver;
@end

@implementation CallDetectionManager

RCT_EXPORT_MODULE(CallDetectionManager)

- (instancetype)init {
    self = [super init];
    if (self) {
        _callObserver = [[CXCallObserver alloc] init];
        [_callObserver setDelegate:self queue:nil];
    }
    return self;
}

- (void)startListener {
    _callObserver = [[CXCallObserver alloc] init];
    [_callObserver setDelegate:self queue:nil];
}

- (void)stopListener {
    _callObserver = nil;
}

- (void)checkPhoneState:(RCTResponseSenderBlock)callback {
    CXCallObserver *ctCallCenter = [[CXCallObserver alloc] init];
    callback(@[@(ctCallCenter.calls.count > 0)]);
}

- (void)callObserver:(CXCallObserver *)callObserver callChanged:(CXCall *)call {
    NSString *state;
    if (call.hasEnded) {
        state = @"Disconnected";
    } else if (call.isOutgoing && !call.hasConnected) {
        state = @"Dialing";
    } else if (!call.isOutgoing && !call.hasConnected) {
        state = @"Incoming";
    } else if (call.hasConnected && !call.hasEnded) {
        state = @"Connected";
    }

    if (state) {
        [self sendEventWithName:@"PhoneCallStateUpdate" body:@{@"state": state}];
    }
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"PhoneCallStateUpdate"];
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

@end
