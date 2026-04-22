#import "PdfGenerator.h"
#import <UIKit/UIKit.h>
#import <CoreImage/CoreImage.h>

@implementation PdfGenerator

RCT_EXPORT_MODULE();

- (UIImage *)applyFilter:(UIImage *)image filter:(NSString *)filter {
    CIImage *ci = [CIImage imageWithCGImage:image.CGImage];
    CIFilter *f = [CIFilter filterWithName:@"CIColorControls"];
    [f setValue:ci forKey:kCIInputImageKey];
    if ([filter isEqualToString:@"grayscale"]) {
        [f setValue:@0.0 forKey:@"inputSaturation"];
    } else if ([filter isEqualToString:@"blackwhite"]) {
        [f setValue:@0.0 forKey:@"inputSaturation"];
        [f setValue:@4.0 forKey:@"inputContrast"];
        [f setValue:@(-0.5) forKey:@"inputBrightness"];
    } else if ([filter isEqualToString:@"enhanced"]) {
        [f setValue:@1.4 forKey:@"inputContrast"];
        [f setValue:@0.05 forKey:@"inputBrightness"];
    } else {
        return image;
    }
    CGImageRef cg = [[CIContext context] createCGImage:f.outputImage fromRect:f.outputImage.extent];
    UIImage *result = [UIImage imageWithCGImage:cg];
    CGImageRelease(cg);
    return result;
}

RCT_EXPORT_METHOD(generate:(NSArray *)imagePaths
                  fileName:(NSString *)fileName
                  filter:(NSString *)filter
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSArray *docPaths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *pdfsDir = [docPaths[0] stringByAppendingPathComponent:@"pdfs"];
        [[NSFileManager defaultManager] createDirectoryAtPath:pdfsDir
                                  withIntermediateDirectories:YES
                                                   attributes:nil
                                                        error:nil];

        NSString *outPath = [[pdfsDir stringByAppendingPathComponent:fileName]
                              stringByAppendingPathExtension:@"pdf"];

        // A4 at 72 DPI: 595 x 842 points
        CGRect pageRect = CGRectMake(0, 0, 595, 842);
        UIGraphicsPDFRendererFormat *format = [UIGraphicsPDFRendererFormat defaultFormat];
        UIGraphicsPDFRenderer *renderer = [[UIGraphicsPDFRenderer alloc] initWithBounds:pageRect format:format];

        NSError *error;
        BOOL success = [renderer writePDFToURL:[NSURL fileURLWithPath:outPath]
                                   withActions:^(UIGraphicsPDFRendererContext *ctx) {
            for (NSString *rawPath in imagePaths) {
                NSString *path = [rawPath hasPrefix:@"file://"] ? [rawPath substringFromIndex:7] : rawPath;
                UIImage *raw = [UIImage imageWithContentsOfFile:path];
                if (!raw) continue;
                UIImage *image = [self applyFilter:raw filter:filter];

                [ctx beginPage];

                CGFloat scale = MIN(pageRect.size.width / image.size.width,
                                    pageRect.size.height / image.size.height);
                CGFloat w = image.size.width * scale;
                CGFloat h = image.size.height * scale;
                CGFloat x = (pageRect.size.width - w) / 2;
                CGFloat y = (pageRect.size.height - h) / 2;

                [image drawInRect:CGRectMake(x, y, w, h)];
            }
        } error:&error];

        if (success) {
            resolve([@"file://" stringByAppendingString:outPath]);
        } else {
            reject(@"PDF_ERROR", error.localizedDescription, error);
        }
    });
}

@end
