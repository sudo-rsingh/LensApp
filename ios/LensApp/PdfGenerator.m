#import "PdfGenerator.h"
#import <UIKit/UIKit.h>
#import <CoreImage/CoreImage.h>

@implementation PdfGenerator

RCT_EXPORT_MODULE();

- (UIImage *)applyMatrix:(UIImage *)image matrix:(NSArray *)m {
    CIImage *ci = [CIImage imageWithCGImage:image.CGImage];
    CIFilter *f = [CIFilter filterWithName:@"CIColorMatrix"];
    [f setValue:ci forKey:kCIInputImageKey];
    [f setValue:[CIVector vectorWithX:[m[0] floatValue] Y:[m[1] floatValue] Z:[m[2] floatValue] W:[m[3] floatValue]] forKey:@"inputRVector"];
    [f setValue:[CIVector vectorWithX:[m[5] floatValue] Y:[m[6] floatValue] Z:[m[7] floatValue] W:[m[8] floatValue]] forKey:@"inputGVector"];
    [f setValue:[CIVector vectorWithX:[m[10] floatValue] Y:[m[11] floatValue] Z:[m[12] floatValue] W:[m[13] floatValue]] forKey:@"inputBVector"];
    [f setValue:[CIVector vectorWithX:[m[15] floatValue] Y:[m[16] floatValue] Z:[m[17] floatValue] W:[m[18] floatValue]] forKey:@"inputAVector"];
    [f setValue:[CIVector vectorWithX:[m[4] floatValue] Y:[m[9] floatValue] Z:[m[14] floatValue] W:[m[19] floatValue]] forKey:@"inputBiasVector"];
    CGImageRef cg = [[CIContext context] createCGImage:f.outputImage fromRect:f.outputImage.extent];
    UIImage *result = [UIImage imageWithCGImage:cg];
    CGImageRelease(cg);
    return result;
}

RCT_EXPORT_METHOD(generate:(NSArray *)imagePaths
                  fileName:(NSString *)fileName
                  matrix:(NSArray *)matrix
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
                UIImage *image = [self applyMatrix:raw matrix:matrix];

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
