package com.lensapp

import android.graphics.BitmapFactory
import android.graphics.RectF
import android.graphics.pdf.PdfDocument
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.io.File
import java.io.FileOutputStream

class PdfGeneratorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "PdfGenerator"

    @ReactMethod
    fun generate(imagePaths: ReadableArray, fileName: String, promise: Promise) {
        try {
            val outDir = File(reactContext.filesDir, "pdfs").also { it.mkdirs() }
            val outFile = File(outDir, "$fileName.pdf")
            val doc = PdfDocument()

            for (i in 0 until imagePaths.size()) {
                val path = imagePaths.getString(i)!!.removePrefix("file://")
                val bitmap = BitmapFactory.decodeFile(path)
                    ?: throw Exception("Failed to decode image: $path")

                // A4 at 72 DPI: 595 x 842 points
                val pageWidth = 595
                val pageHeight = 842
                val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, i + 1).create()
                val page = doc.startPage(pageInfo)

                val scale = minOf(pageWidth.toFloat() / bitmap.width, pageHeight.toFloat() / bitmap.height)
                val scaledW = bitmap.width * scale
                val scaledH = bitmap.height * scale
                val left = (pageWidth - scaledW) / 2f
                val top = (pageHeight - scaledH) / 2f

                page.canvas.drawBitmap(bitmap, null, RectF(left, top, left + scaledW, top + scaledH), null)
                bitmap.recycle()
                doc.finishPage(page)
            }

            FileOutputStream(outFile).use { doc.writeTo(it) }
            doc.close()
            promise.resolve("file://${outFile.absolutePath}")
        } catch (e: Exception) {
            promise.reject("PDF_ERROR", e.message, e)
        }
    }
}
