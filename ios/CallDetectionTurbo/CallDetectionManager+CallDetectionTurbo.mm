#import "CallDetectionManager.h"
#import <React/RCTBridgeModule.h>
#import <ReactCommon/TurboModule.h>
#import <ReactCommon/TurboModuleUtils.h>

using namespace facebook;
using namespace react;

namespace facebook::react {
class CallDetectionManagerModule : public TurboModule {
public:
  CallDetectionManagerModule(std::shared_ptr<CallInvoker> jsInvoker)
      : TurboModule("CallDetectionManager", jsInvoker) {
    methodMap_["startListener"] = MethodMetadata{
        .func = [this] (jsi::Runtime& rt, const jsi::Value* args, size_t count) -> jsi::Value {
            auto instance = [CallDetectionManager new];
            [instance startListener];
            return jsi::Value::undefined();
        }
    };

    methodMap_["stopListener"] = MethodMetadata{
        .func = [this] (jsi::Runtime& rt, const jsi::Value* args, size_t count) -> jsi::Value {
            auto instance = [CallDetectionManager new];
            [instance stopListener];
            return jsi::Value::undefined();
        }
    };

    methodMap_["checkPhoneState"] = MethodMetadata{
        .func = [this] (jsi::Runtime& rt, const jsi::Value* args, size_t count) -> jsi::Value {
            auto instance = [CallDetectionManager new];
            instance.checkPhoneState(^(NSArray *response) {
                return jsi::Value((int)response[0]);
            });
            return jsi::Value::undefined();
        }
    };
  }
};
}

extern "C" __attribute__((visibility("default"))) __attribute__((used))
std::shared_ptr<facebook::react::TurboModule> createTurboModule(
    const std::string &name,
    const std::shared_ptr<facebook::react::CallInvoker> jsInvoker) {
  if (name == "CallDetectionManager") {
    return std::make_shared<facebook::react::CallDetectionManagerModule>(jsInvoker);
  }
  return nullptr;
}
