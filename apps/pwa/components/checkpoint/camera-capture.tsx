"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onReset?: () => void;
  imageSrc?: string | null;
}

export function CameraCapture({ onCapture, onReset, imageSrc }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    const imageBase64 = webcamRef.current?.getScreenshot();
    if (imageBase64) {
      onCapture(imageBase64);
      setIsCameraActive(false);
    }
  }, [webcamRef, onCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "environment",
  };

  if (imageSrc) {
    return (
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
        <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
          <Button 
            variant="secondary" 
            className="bg-white/90 backdrop-blur-sm shadow-lg text-slate-900"
            onClick={() => {
              if (onReset) onReset();
              setIsCameraActive(true);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Retake Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 flex flex-col items-center justify-center">
        {isCameraActive ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <Button 
                size="lg" 
                className="h-16 w-16 rounded-full bg-white text-green-600 shadow-xl border-4 border-green-600/20 active:scale-95 transition-transform"
                onClick={capture}
              >
                <Camera className="h-8 w-8" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-8 space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <ImageIcon className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold">Ambil Foto Checkpoint</h4>
              <p className="text-slate-400 text-sm">Pastikan pencahayaan cukup dan objek terlihat jelas</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                onClick={() => setIsCameraActive(true)}
              >
                <Camera className="h-5 w-5 mr-2" /> Buka Kamera
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 text-slate-300 h-12 hover:bg-slate-800"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mr-2" /> Upload Galeri
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
