package com.lensapp

import android.content.Intent
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class ShareModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "FileShareModule"

    @ReactMethod
    fun share(filePath: String, title: String, mimeType: String, promise: Promise) {
        try {
            val file = File(filePath.removePrefix("file://"))
            val uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                file,
            )
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, title)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(intent, title).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(chooser)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("SHARE_ERROR", e.message, e)
        }
    }
}
