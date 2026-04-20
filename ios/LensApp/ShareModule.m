#import "ShareModule.h"
#import <UIKit/UIKit.h>
#import <React/RCTUtils.h>

@implementation ShareModule

RCT_EXPORT_MODULE(FileShareModule);

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(share:(NSString *)filePath
                  title:(NSString *)title
                  mimeType:(NSString *)mimeType
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *path = [filePath hasPrefix:@"file://"] ? [filePath substringFromIndex:7] : filePath;
    NSURL *fileURL = [NSURL fileURLWithPath:path];

    UIActivityViewController *vc = [[UIActivityViewController alloc]
        initWithActivityItems:@[fileURL]
        applicationActivities:nil];

    UIViewController *root = RCTPresentedViewController();
    [root presentViewController:vc animated:YES completion:^{
        resolve(nil);
    }];
}

@end
