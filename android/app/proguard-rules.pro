# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.tomashops.videoapp.** { *; }
-keep class com.tomashops.app.** { *; }

# Keep WebView JavaScript interface
-keepclassmembers class com.tomashops.videoapp.MainActivity {
    public *;
}
-keepclassmembers class com.tomashops.app.MainActivity {
    public *;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Firebase classes if using Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep WebView related classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep React/JavaScript related classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep JSON and data classes
-keep class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Retrofit/Network classes
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# Keep OkHttp classes
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# Keep WebRTC classes
-keep class org.webrtc.** { *; }

# Keep video/audio related classes
-keep class com.google.android.exoplayer2.** { *; }
-keep class androidx.media.** { *; }

# Keep ElevenLabs/Convai classes
-keep class com.elevenlabs.** { *; }
-keep class com.convai.** { *; }

# Preserve line numbers for debugging (optional - remove for production)
-keepattributes SourceFile,LineNumberTable

# Hide original source file name
-renamesourcefileattribute SourceFile

# Optimize
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Keep all classes in the app package
-keep class com.tomashops.** { *; }

# Keep all JavaScript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all WebView related classes
-keep class android.webkit.** { *; }

# Keep all Cordova/PhoneGap classes
-keep class org.apache.cordova.** { *; }

# Keep all Capacitor plugin classes
-keep class com.getcapacitor.plugin.** { *; }

# Keep all AndroidX classes
-keep class androidx.** { *; }

# Keep all Android support classes
-keep class android.support.** { *; }

# Keep all classes with @Keep annotation
-keep class * {
    @androidx.annotation.Keep *;
}

# Keep all classes with @SuppressLint annotation
-keep class * {
    @android.annotation.SuppressLint *;
}
