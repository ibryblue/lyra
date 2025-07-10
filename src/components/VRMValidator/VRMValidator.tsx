import React, { useState, useEffect } from 'react';
import { VRM } from '@pixiv/three-vrm';
import { VRMBoneValidator } from '../../lib/vrmBoneValidator';
import { VRMBoneFixerTool } from '../../lib/vrmBoneFixerTool';
import * as THREE from 'three';

// Type definition for the validation result
interface ValidationResult {
  valid: boolean;
  boneMapping: { 
    valid: boolean; 
    missingBones: string[]; 
    incorrectBones: string[] 
  };
  skeletonHierarchy: { 
    valid: boolean; 
    issues: string[] 
  };
  animationReadiness: { 
    ready: boolean; 
    issues: string[] 
  };
}

interface VRMValidatorProps {
  vrm: VRM | null;
  scene?: THREE.Scene | null;
  onValidationComplete?: (result: ValidationResult) => void;
  onFixComplete?: (success: boolean) => void;
}

export default function VRMValidator({ vrm, scene, onValidationComplete, onFixComplete }: VRMValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);
  const [fixerTool, setFixerTool] = useState<VRMBoneFixerTool | null>(null);
  const [availableBones, setAvailableBones] = useState<{ name: string; path: string }[]>([]);

  // Initialize the fixer tool when VRM changes
  useEffect(() => {
    if (vrm && scene) {
      const tool = new VRMBoneFixerTool(vrm, scene);
      setFixerTool(tool);
      
      // Get available bones
      setAvailableBones(tool.getAllBones());
    } else {
      setFixerTool(null);
      setAvailableBones([]);
    }
  }, [vrm, scene]);

  const validateVRM = () => {
    if (!vrm) return;

    setIsValidating(true);
    
    // Run validation
    const result = VRMBoneValidator.validateVRM(vrm);
    
    // Update state with results
    setValidationResult(result);
    setIsValidating(false);
    
    // Call the callback if provided
    if (onValidationComplete) {
      onValidationComplete(result);
    }
  };

  const fixVRM = () => {
    if (!vrm || !fixerTool) return;

    setIsFixing(true);
    
    try {
      // Apply fixes
      const success = fixerTool.fix();
      
      // Re-validate
      const newResult = fixerTool.validate();
      setValidationResult(newResult);
      
      // Set fix result
      setFixResult({
        success,
        message: success 
          ? "Bone mapping issues have been fixed. Some manual adjustments may still be needed."
          : "Some issues could not be automatically fixed. Manual mapping is required."
      });
      
      // Call the callback if provided
      if (onFixComplete) {
        onFixComplete(success);
      }
    } catch (error) {
      console.error('Error fixing VRM:', error);
      setFixResult({
        success: false,
        message: `Error fixing VRM: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="vrm-validator bg-gray-900/50 rounded-lg p-4 max-h-[600px] overflow-y-auto w-full">
      <h2 className="text-2xl font-bold mb-4 sticky top-0 bg-gray-900/90 p-4 rounded-lg z-10 border-b border-gray-700 flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        VRM Humanoid Validation
      </h2>
      
      {!vrm && (
        <div className="text-amber-500 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            No VRM model loaded. Load a VRM model to validate.
          </div>
        </div>
      )}

      {!scene && vrm && (
        <div className="text-amber-500 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Scene not available. Cannot perform bone fixing operations.
          </div>
        </div>
      )}
      
      {vrm && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sticky top-[4.5rem] bg-gray-900/95 p-4 rounded-lg z-10 border border-gray-700/50 shadow-lg">
            <button 
              onClick={validateVRM}
              disabled={isValidating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-3 font-semibold transition-all"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Validating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validate VRM Bone Structure
                </>
              )}
            </button>
            
            {validationResult && !validationResult.valid && scene && (
              <button 
                onClick={fixVRM}
                disabled={isFixing || !fixerTool}
                className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isFixing ? (
                  <>
                    <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                    Fixing Bones...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Auto-Fix All Bone Issues
                  </>
                )}
              </button>
            )}
          </div>
          
          {fixResult && (
            <div className={`p-4 rounded-lg border ${
              fixResult.success 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={fixResult.success 
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
                <p className="font-medium">{fixResult.message}</p>
              </div>
            </div>
          )}
          
          {validationResult && (
            <div className="validation-results space-y-6">
              <div className={`validation-status p-4 rounded-lg border ${
                validationResult.valid 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <h3 className="font-bold text-lg flex items-center gap-3">
                  {validationResult.valid ? (
                    <>
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-400">VRM is valid and ready for animation</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-400">VRM has issues that need to be fixed</span>
                    </>
                  )}
                </h3>
              </div>
              
              <div className="validation-details space-y-6">
                {/* Bone Mapping Section */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <h3 className="font-bold text-lg border-b border-gray-700 pb-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span>Bone Mapping</span>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      validationResult.boneMapping.valid 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {validationResult.boneMapping.valid ? 'Valid' : 'Invalid'}
                    </span>
                  </h3>
                  
                  <div className="space-y-4">
                    {validationResult.boneMapping.missingBones.length > 0 && (
                      <div className="bg-red-900/20 p-3 rounded">
                        <h4 className="font-semibold text-red-400 mb-2">Missing Bones:</h4>
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="list-disc ml-6 text-sm space-y-1">
                            {validationResult.boneMapping.missingBones.map((bone, index) => (
                              <li key={index} className="text-red-300">{bone}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {validationResult.boneMapping.incorrectBones.length > 0 && (
                      <div className="bg-amber-900/20 p-3 rounded">
                        <h4 className="font-semibold text-amber-400 mb-2">Incorrect Bone Names:</h4>
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="list-disc ml-6 text-sm space-y-1">
                            {validationResult.boneMapping.incorrectBones.map((bone, index) => (
                              <li key={index} className="text-amber-300">{bone}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Skeleton Hierarchy Section */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <h3 className="font-bold text-lg border-b border-gray-700 pb-3 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span>Skeleton Hierarchy</span>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      validationResult.skeletonHierarchy.valid 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {validationResult.skeletonHierarchy.valid ? 'Valid' : 'Invalid'}
                    </span>
                  </h3>
                  
                  {validationResult.skeletonHierarchy.issues.length > 0 && (
                    <div className="bg-red-900/20 p-3 rounded">
                      <h4 className="font-semibold text-red-400 mb-2">Hierarchy Issues:</h4>
                      <div className="max-h-40 overflow-y-auto">
                        <ul className="list-disc ml-6 text-sm space-y-1">
                          {validationResult.skeletonHierarchy.issues.map((issue, index) => (
                            <li key={index} className="text-red-300">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 