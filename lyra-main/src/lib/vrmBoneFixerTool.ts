import { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { VRMBoneValidator } from './vrmBoneValidator';
import { VRMBoneMapper } from './vrmBoneMapper';

/**
 * Tool for validating and fixing VRM bone issues
 */
export class VRMBoneFixerTool {
  private vrm: VRM;
  private scene: THREE.Scene;
  private validationResult: ReturnType<typeof VRMBoneValidator.validateVRM> | null = null;

  constructor(vrm: VRM, scene: THREE.Scene) {
    this.vrm = vrm;
    this.scene = scene;
  }

  /**
   * Validate the VRM model
   */
  validate(): ReturnType<typeof VRMBoneValidator.validateVRM> {
    this.validationResult = VRMBoneValidator.validateVRM(this.vrm);
    return this.validationResult;
  }

  /**
   * Fix the VRM model's bone issues
   */
  fix(): boolean {
    if (!this.validationResult) {
      this.validate();
    }

    // Apply fixes
    const success = VRMBoneMapper.fixVRMBones(this.vrm, this.scene);
    
    // Re-validate after fixes
    this.validationResult = VRMBoneValidator.validateVRM(this.vrm);
    
    return success;
  }

  /**
   * Get a list of all bones in the scene
   */
  getAllBones(): { name: string; path: string }[] {
    const bones: { name: string; path: string }[] = [];
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Bone) {
        // Build the path to this bone
        let path = object.name;
        let parent = object.parent;
        
        while (parent && !(parent instanceof THREE.Scene)) {
          path = `${parent.name}/${path}`;
          parent = parent.parent;
        }
        
        bones.push({ name: object.name, path });
      }
    });
    
    return bones;
  }

  /**
   * Manually map a bone
   */
  mapBone(vrmBoneName: string, sceneBoneName: string): boolean {
    return VRMBoneMapper.mapBone(this.vrm, vrmBoneName as any, sceneBoneName);
  }

  /**
   * Get the validation status
   */
  getValidationStatus(): { 
    valid: boolean; 
    missingBones: string[]; 
    incorrectBones: string[];
    hierarchyIssues: string[];
    animationIssues: string[];
  } {
    if (!this.validationResult) {
      this.validate();
    }
    
    return {
      valid: this.validationResult!.valid,
      missingBones: this.validationResult!.boneMapping.missingBones,
      incorrectBones: this.validationResult!.boneMapping.incorrectBones,
      hierarchyIssues: this.validationResult!.skeletonHierarchy.issues,
      animationIssues: this.validationResult!.animationReadiness.issues
    };
  }

  /**
   * Export the fixed VRM model
   */
  getFixedVRM(): VRM {
    return this.vrm;
  }

  /**
   * Static method to create a fixer tool for a VRM model
   */
  static createFixerTool(vrm: VRM, scene: THREE.Scene): VRMBoneFixerTool {
    return new VRMBoneFixerTool(vrm, scene);
  }
} 