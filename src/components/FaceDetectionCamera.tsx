import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera as CameraIcon, Square, AlertCircle, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface FaceDetectionCameraProps {
  onCapture: (imageData: string) => void;
  isCapturing?: boolean;
}

const FaceDetectionCamera: React.FC<FaceDetectionCameraProps> = ({ onCapture, isCapturing = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const detectionInterval = useRef<number | null>(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Starting to load face detection models...');
        setIsLoading(true);
        
        // Load each model one by one with error handling
        try {
          console.log('Loading Tiny Face Detector model...');
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
          console.log('Tiny Face Detector model loaded successfully');
          
          console.log('Loading Face Landmark model...');
          await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
          console.log('Face Landmark model loaded successfully');
          
          console.log('Loading Face Recognition model...');
          await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
          console.log('Face Recognition model loaded successfully');
          
          setModelsLoaded(true);
        } catch (modelError) {
          console.error('Error loading models:', modelError);
          // Check if models are accessible
          try {
            const response = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
            if (!response.ok) {
              throw new Error(`Failed to fetch model manifest: ${response.status} ${response.statusText}`);
            }
            console.log('Model manifest is accessible');
          } catch (fetchError) {
            console.error('Could not access model files:', fetchError);
          }
          throw modelError;
        }
      } catch (error) {
        console.error('Error in loadModels:', error);
        setModelsLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Start camera and face detection
  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
    
    return () => {
      stopCamera();
      stopFaceDetection();
    };
  }, [modelsLoaded]);

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const constraints = {
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      };
      
      console.log('Camera constraints:', constraints);
      
      // Check if browser supports mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support camera access');
      }
      
      // Check camera permissions
      const permissionResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
      console.log('Camera permission state:', permissionResult.state);
      
      if (permissionResult.state === 'denied') {
        throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream active:', mediaStream.active);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }
          
          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            setIsCameraReady(true);
            resolve();
          };
          
          const onError = (error: Event) => {
            console.error('Video error:', error);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load video stream'));
          };
          
          video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
          video.addEventListener('error', onError, { once: true });
          
          // Set a timeout in case the video never loads
          setTimeout(() => {
            if (!video.videoWidth) {
              onError(new Event('timeout') as unknown as Event);
            }
          }, 5000);
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Provide user-friendly error message
      alert(`Camera error: ${error instanceof Error ? error.message : 'Failed to access camera'}`);
      setModelsLoaded(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
  };

  const stopFaceDetection = () => {
    if (detectionInterval.current) {
      cancelAnimationFrame(detectionInterval.current);
      detectionInterval.current = null;
    }
  };

  // Start face detection when camera is ready
  useEffect(() => {
    if (isCameraReady && modelsLoaded && videoRef.current) {
      startFaceDetection();
    }
    return () => stopFaceDetection();
  }, [isCameraReady, modelsLoaded]);

  const startFaceDetection = () => {
    if (!videoRef.current || !detectionCanvasRef.current) return;

    const video = videoRef.current;
    const detectionCanvas = detectionCanvasRef.current;
    const displaySize = { 
      width: video.videoWidth || 640, 
      height: video.videoHeight || 480 
    };
    
    // Set canvas size to match video
    faceapi.matchDimensions(detectionCanvas, displaySize);

    const detectFaces = async () => {
      if (!video || video.readyState !== 4) {
        detectionInterval.current = requestAnimationFrame(detectFaces);
        return;
      }

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

        setFaceCount(detections.length);

        // Clear previous drawings
        const context = detectionCanvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, detectionCanvas.width, detectionCanvas.height);
          
          // Draw face detection boxes (for debugging)
          // faceapi.draw.drawDetections(detectionCanvas, detections);
        }
      } catch (error) {
        console.error('Error detecting faces:', error);
      }

      detectionInterval.current = requestAnimationFrame(detectFaces);
    };

    detectionInterval.current = requestAnimationFrame(detectFaces);
  };

  const captureImage = useCallback(() => {
    if (faceCount !== 1) return; // Don't capture if not exactly one face

    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg');
      onCapture(imageData);
    }
  }, [faceCount, onCapture]);

  const isCaptureDisabled = !isCameraReady || isCapturing || faceCount !== 1 || isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-100 rounded-lg">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-700">Loading face detection models...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md h-auto object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror the video
        />
        <canvas
          ref={detectionCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        {!isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <CameraIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {faceCount > 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white/90 p-4 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <span className="font-medium">Only one face should be visible</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600">
        {faceCount === 0 ? (
          <span className="text-amber-600">No face detected</span>
        ) : faceCount === 1 ? (
          <span className="text-green-600">Face detected - Ready to capture</span>
        ) : (
          <span className="text-red-600">{faceCount} faces detected - Only one face allowed</span>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <Button
        onClick={captureImage}
        disabled={isCaptureDisabled}
        className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
          isCaptureDisabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        <Square className="w-4 h-4" />
        <span>{isCapturing ? 'Processing...' : 'Capture Face'}</span>
      </Button>
    </div>
  );
};

export default FaceDetectionCamera;
