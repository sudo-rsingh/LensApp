package com.lensapp

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
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

    private fun applyFilter(src: Bitmap, matrixValues: ReadableArray): Bitmap {
        val floats = FloatArray(20) { matrixValues.getDouble(it).toFloat() }
        val out = Bitmap.createBitmap(src.width, src.height, Bitmap.Config.ARGB_8888)
        Canvas(out).drawBitmap(src, 0f, 0f, Paint().apply { colorFilter = ColorMatrixColorFilter(ColorMatrix(floats)) })
        return out
    }

    @ReactMethod
    fun generateIdCard(imagePaths: ReadableArray, fileName: String, matrix: ReadableArray, promise: Promise) {
        try {
            if (imagePaths.size() < 2) throw Exception("Need at least 2 images for ID card export")
            val outDir = File(reactContext.filesDir, "pdfs").also { it.mkdirs() }
            val outFile = File(outDir, "$fileName.pdf")
            val doc = PdfDocument()

            // A4 portrait: 595 x 842 points
            // Two ID slots placed side by side, centered on the page
            val pageWidth = 595
            val pageHeight = 842
            val slotW = 250
            val slotH = 180
            val gap = 16
            val totalW = slotW * 2 + gap
            val startX = (pageWidth - totalW) / 2f
            val startY = (pageHeight - slotH) / 2f

            val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create()
            val page = doc.startPage(pageInfo)

            for (i in 0 until 2) {
                val path = imagePaths.getString(i)!!.removePrefix("file://")
                val raw = BitmapFactory.decodeFile(path) ?: throw Exception("Failed to decode image: $path")
                val bitmap = applyFilter(raw, matrix)
                if (raw !== bitmap) raw.recycle()

                val slotLeft = startX + i * (slotW + gap)
                val scale = minOf(slotW.toFloat() / bitmap.width, slotH.toFloat() / bitmap.height)
                val scaledW = bitmap.width * scale
                val scaledH = bitmap.height * scale
                val left = slotLeft + (slotW - scaledW) / 2f
                val top = startY + (slotH - scaledH) / 2f

                page.canvas.drawBitmap(bitmap, null, RectF(left, top, left + scaledW, top + scaledH), null)
                bitmap.recycle()
            }

            doc.finishPage(page)
            FileOutputStream(outFile).use { doc.writeTo(it) }
            doc.close()
            promise.resolve("file://${outFile.absolutePath}")
        } catch (e: Exception) {
            promise.reject("PDF_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun generate(imagePaths: ReadableArray, fileName: String, matrix: ReadableArray, promise: Promise) {
        try {
            val outDir = File(reactContext.filesDir, "pdfs").also { it.mkdirs() }
            val outFile = File(outDir, "$fileName.pdf")
            val doc = PdfDocument()

            for (i in 0 until imagePaths.size()) {
                val path = imagePaths.getString(i)!!.removePrefix("file://")
                val raw = BitmapFactory.decodeFile(path)
                    ?: throw Exception("Failed to decode image: $path")
                val bitmap = applyFilter(raw, matrix)
                if (raw !== bitmap) raw.recycle()

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
