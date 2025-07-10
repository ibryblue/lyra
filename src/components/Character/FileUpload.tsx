import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Upload, X, FileUp, Play, Pause, Trash2 } from 'lucide-react';
import { getVRMAManager } from '../../lib/vrmManager';

interface FileUploadProps {
  type: 'vrm' | 'vrma';
  accept: string;
  title: string;
  description: string;
}

export function FileUpload({ type, accept, title, description }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const { 
    character, 
    addVRMFile, 
    addVRMAFile, 
    removeVRMFile, 
    removeVRMAFile,
    setCurrentVRM,
    setCurrentVRMA
  } = useStore();
  
  const files = type === 'vrm' ? character.vrmFiles : character.vrmaFiles;
  const currentFile = type === 'vrm' ? character.currentVRM : character.currentVRMA;
  
  const handleFileSelect = (selectedFiles: FileList) => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    Array.from(selectedFiles).forEach(async (file) => {
      try {
        const fileId = `${type}-${Date.now()}-${Math.random()}`;
        
        if (type === 'vrm') {
          const vrmFileData = {
            id: fileId,
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            file: file,
            url: URL.createObjectURL(file),
            vrm: null
          };
          
          addVRMFile(vrmFileData);
          if (!currentFile) {
            setCurrentVRM(vrmFileData);
          }
        } else {
          // For VRMA files, try to load the animation right away
          const vrmaManager = getVRMAManager();
          
          let animation = null;
          if (vrmaManager) {
            try {
              const url = URL.createObjectURL(file);
              const animations = await vrmaManager.loadVRMA(url);
              if (animations && animations.length > 0) {
                animation = animations[0];
                console.log('Successfully loaded animation from file:', file.name);
              }
            } catch (err) {
              console.error('Failed to load animation from file:', err);
            }
          }
          
          const vrmaFileData = {
            id: fileId,
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            file: file,
            url: URL.createObjectURL(file),
            animation: animation
          };
          
          addVRMAFile(vrmaFileData);
          if (!currentFile) {
            setCurrentVRMA(vrmaFileData);
          }
        }
        
        console.log(`${type.toUpperCase()} file added:`, file.name);
      } catch (error) {
        console.error(`${type.toUpperCase()} file processing failed:`, error);
      }
    });
    
    setIsUploading(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };
  
  const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation(); // Prevent file selection when deleting
    console.log(`Removing ${type} file with ID:`, fileId);
    
    if (type === 'vrm') {
      removeVRMFile(fileId);
    } else {
      removeVRMAFile(fileId);
    }
  };
  
  const handleSelectFile = (file: any) => {
    if (type === 'vrm') {
      setCurrentVRM(file);
    } else {
      // For VRMA, if clicking the current animation, stop it by setting to null
      if (currentFile?.id === file.id) {
        setCurrentVRMA(null);
      } else {
        setCurrentVRMA(file);
      }
    }
  };
  
  const handlePlayAnimation = (e: React.MouseEvent, file: any) => {
    e.stopPropagation(); // Prevent file selection
    if (type === 'vrma') {
      setCurrentVRMA(file);
    }
  };
  
  const handleStopAnimation = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent file selection
    if (type === 'vrma') {
      setCurrentVRMA(null);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-blue-400 bg-blue-50/10' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={type === 'vrma'}
          onChange={handleFileInputChange}
          className="hidden"
          title={`Upload ${type.toUpperCase()} file`}
        />
        
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
          
          <div className="text-xs text-gray-500">
            {type === 'vrm' ? 'Supports .vrm format' : 'Supports .vrma format'}
          </div>
        </div>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </motion.div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">
            Uploaded {type.toUpperCase()} files ({files.length})
          </h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file) => (
              <motion.div
                key={file.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  transition-all duration-200
                  ${currentFile?.id === file.id 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div 
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={() => handleSelectFile(file)}
                >
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded">
                    <FileUp className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentFile?.id === file.id 
                        ? type === 'vrma' ? 'Currently playing' : 'Currently active'
                        : 'Click to use'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {type === 'vrma' && (
                    currentFile?.id === file.id ? (
                      <button
                        onClick={handleStopAnimation}
                        className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-400/10"
                        title="Stop animation"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handlePlayAnimation(e, file)}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors rounded-full hover:bg-green-400/10"
                        title="Play animation"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )
                  )}
                  
                  <button
                    onClick={(e) => handleRemoveFile(e, file.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-full hover:bg-red-400/10 z-10"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// VRM file upload component
export function VRMUpload() {
  return (
    <FileUpload
      type="vrm"
      accept=".vrm"
      title="Upload VRM Character"
      description="Drag and drop or click to upload VRM 3D character file"
    />
  );
}

// VRMA file upload component
export function VRMAUpload() {
  return (
    <FileUpload
      type="vrma"
      accept=".vrma"
      title="Upload VRMA Animation"
      description="Drag and drop or click to upload VRMA animation file"
    />
  );
}
