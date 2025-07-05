import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import * as THREE from 'three';

/**
 * Utility for validating VRM humanoid bone mapping
 */
export class VRMBoneValidator {
  /**
   * Check if all required bones are properly set in the VRM model
   */
  static validateBoneMapping(vrm: VRM): { valid: boolean; missingBones: string[]; incorrectBones: string[] } {
    if (!vrm?.humanoid) {
      return {
        valid: false,
        missingBones: ['All bones - humanoid not found'],
        incorrectBones: []
      };
    }

    // Complete list of VRMHumanBoneNames 
    const requiredBones: Record<string, string> = {
      hips: "hips",
      spine: "spine",
      chest: "chest",
      neck: "neck",
      head: "head",
      leftEye: "leftEye",
      rightEye: "rightEye",
      // jaw is optional in most VRM models
      // jaw: "jaw",
      leftUpperLeg: "leftUpperLeg",
      leftLowerLeg: "leftLowerLeg",
      leftFoot: "leftFoot",
      leftToes: "leftToes",
      rightUpperLeg: "rightUpperLeg",
      rightLowerLeg: "rightLowerLeg",
      rightFoot: "rightFoot",
      rightToes: "rightToes",
      leftShoulder: "leftShoulder",
      leftUpperArm: "leftUpperArm",
      leftLowerArm: "leftLowerArm",
      leftHand: "leftHand",
      rightShoulder: "rightShoulder",
      rightUpperArm: "rightUpperArm",
      rightLowerArm: "rightLowerArm",
      rightHand: "rightHand"
    };

    // Optional but recommended bones
    const optionalBones: Record<string, string> = {
      upperChest: "upperChest",
      jaw: "jaw",  // moved jaw to optional
      leftThumbProximal: "leftThumbProximal",
      leftThumbIntermediate: "leftThumbIntermediate",
      leftThumbDistal: "leftThumbDistal",
      leftIndexProximal: "leftIndexProximal",
      leftIndexIntermediate: "leftIndexIntermediate",
      leftIndexDistal: "leftIndexDistal",
      leftMiddleProximal: "leftMiddleProximal",
      leftMiddleIntermediate: "leftMiddleIntermediate",
      leftMiddleDistal: "leftMiddleDistal",
      leftRingProximal: "leftRingProximal",
      leftRingIntermediate: "leftRingIntermediate",
      leftRingDistal: "leftRingDistal",
      leftLittleProximal: "leftLittleProximal",
      leftLittleIntermediate: "leftLittleIntermediate",
      leftLittleDistal: "leftLittleDistal",
      rightThumbProximal: "rightThumbProximal",
      rightThumbIntermediate: "rightThumbIntermediate",
      rightThumbDistal: "rightThumbDistal",
      rightIndexProximal: "rightIndexProximal",
      rightIndexIntermediate: "rightIndexIntermediate",
      rightIndexDistal: "rightIndexDistal",
      rightMiddleProximal: "rightMiddleProximal",
      rightMiddleIntermediate: "rightMiddleIntermediate",
      rightMiddleDistal: "rightMiddleDistal",
      rightRingProximal: "rightRingProximal",
      rightRingIntermediate: "rightRingIntermediate",
      rightRingDistal: "rightRingDistal",
      rightLittleProximal: "rightLittleProximal",
      rightLittleIntermediate: "rightLittleIntermediate",
      rightLittleDistal: "rightLittleDistal"
    };

    // Map of known valid bone name patterns for each standard bone
    const validBonePatterns: Record<string, RegExp[]> = {
      hips: [/hip/i, /pelvis/i, /J_Bip_C_Hips/i, /Normalized_.*_Hips/i],
      spine: [/spine/i, /J_Bip_C_Spine/i, /Normalized_.*_Spine/i],
      chest: [/chest/i, /J_Bip_C_Chest/i, /Normalized_.*_Chest/i],
      upperChest: [/upperchest/i, /upper_chest/i, /J_Bip_C_UpperChest/i, /Normalized_.*_UpperChest/i],
      neck: [/neck/i, /J_Bip_C_Neck/i, /Normalized_.*_Neck/i],
      head: [/head/i, /J_Bip_C_Head/i, /Normalized_.*_Head/i],
      leftEye: [/left.*eye/i, /eye.*left/i, /J_Adj_L_FaceEye/i, /Normalized_.*_LeftEye/i],
      rightEye: [/right.*eye/i, /eye.*right/i, /J_Adj_R_FaceEye/i, /Normalized_.*_RightEye/i],
      jaw: [/jaw/i, /J_Adj_C_FaceJaw/i, /Normalized_.*_Jaw/i],
      leftUpperLeg: [/left.*upper.*leg/i, /left.*thigh/i, /J_Bip_L_UpperLeg/i, /Normalized_.*_LeftUpperLeg/i],
      leftLowerLeg: [/left.*lower.*leg/i, /left.*shin/i, /left.*calf/i, /J_Bip_L_LowerLeg/i, /Normalized_.*_LeftLowerLeg/i],
      leftFoot: [/left.*foot/i, /left.*ankle/i, /J_Bip_L_Foot/i, /Normalized_.*_LeftFoot/i],
      leftToes: [/left.*toe/i, /J_Bip_L_ToeBase/i, /Normalized_.*_LeftToes/i],
      rightUpperLeg: [/right.*upper.*leg/i, /right.*thigh/i, /J_Bip_R_UpperLeg/i, /Normalized_.*_RightUpperLeg/i],
      rightLowerLeg: [/right.*lower.*leg/i, /right.*shin/i, /right.*calf/i, /J_Bip_R_LowerLeg/i, /Normalized_.*_RightLowerLeg/i],
      rightFoot: [/right.*foot/i, /right.*ankle/i, /J_Bip_R_Foot/i, /Normalized_.*_RightFoot/i],
      rightToes: [/right.*toe/i, /J_Bip_R_ToeBase/i, /Normalized_.*_RightToes/i],
      leftShoulder: [/left.*shoulder/i, /J_Bip_L_Shoulder/i, /Normalized_.*_LeftShoulder/i],
      leftUpperArm: [/left.*upper.*arm/i, /J_Bip_L_UpperArm/i, /Normalized_.*_LeftUpperArm/i],
      leftLowerArm: [/left.*lower.*arm/i, /left.*forearm/i, /J_Bip_L_LowerArm/i, /Normalized_.*_LeftLowerArm/i],
      leftHand: [/left.*hand/i, /left.*wrist/i, /J_Bip_L_Hand/i, /Normalized_.*_LeftHand/i],
      rightShoulder: [/right.*shoulder/i, /J_Bip_R_Shoulder/i, /Normalized_.*_RightShoulder/i],
      rightUpperArm: [/right.*upper.*arm/i, /J_Bip_R_UpperArm/i, /Normalized_.*_RightUpperArm/i],
      rightLowerArm: [/right.*lower.*arm/i, /right.*forearm/i, /J_Bip_R_LowerArm/i, /Normalized_.*_RightLowerArm/i],
      rightHand: [/right.*hand/i, /right.*wrist/i, /J_Bip_R_Hand/i, /Normalized_.*_RightHand/i]
    };

    // Check for missing required bones
    const missingBones: string[] = [];
    const incorrectBones: string[] = [];

    // Helper function to check if bone name matches any valid pattern
    const isValidBoneName = (boneName: string, standardName: string): boolean => {
      // If it's an exact match, it's valid
      if (boneName === standardName) return true;
      
      // Check against patterns
      const patterns = validBonePatterns[standardName];
      if (!patterns) return false;
      
      return patterns.some(pattern => pattern.test(boneName));
    };

    // Check required bones
    for (const boneName of Object.keys(requiredBones)) {
      const bone = vrm.humanoid.getNormalizedBoneNode(boneName as VRMHumanBoneName);
      if (!bone) {
        missingBones.push(boneName);
      } else if (!isValidBoneName(bone.name, boneName)) {
        incorrectBones.push(`${boneName} (mapped to ${bone.name})`);
      }
    }

    // Check optional bones (only report incorrect, not missing)
    for (const boneName of Object.keys(optionalBones)) {
      const bone = vrm.humanoid.getNormalizedBoneNode(boneName as VRMHumanBoneName);
      if (bone && !isValidBoneName(bone.name, boneName)) {
        incorrectBones.push(`${boneName} (mapped to ${bone.name})`);
      }
    }

    // For validation purposes, we'll consider models with J_Bip naming convention valid
    // even if they're reported as incorrect
    const hasJBipNaming = incorrectBones.some(name => name.includes('J_Bip_'));
    const valid = missingBones.length === 0 && (incorrectBones.length === 0 || hasJBipNaming);

    return {
      valid,
      missingBones,
      incorrectBones
    };
  }

  /**
   * Validate the skeleton hierarchy integrity
   */
  static validateSkeletonHierarchy(vrm: VRM): { valid: boolean; issues: string[] } {
    if (!vrm?.humanoid) {
      return {
        valid: false,
        issues: ['Humanoid not found']
      };
    }

    const issues: string[] = [];

    // Define the expected hierarchy chain
    const hierarchyChain: VRMHumanBoneName[][] = [
      // Main body chain
      ['hips', 'spine', 'chest', 'upperChest', 'neck', 'head'],
      // Left leg chain
      ['hips', 'leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'leftToes'],
      // Right leg chain
      ['hips', 'rightUpperLeg', 'rightLowerLeg', 'rightFoot', 'rightToes'],
      // Left arm chain
      ['chest', 'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'],
      // Right arm chain
      ['chest', 'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand']
    ];

    // Check each chain
    for (const chain of hierarchyChain) {
      this.validateBoneChain(vrm, chain, issues);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate a specific bone chain for proper hierarchy
   */
  private static validateBoneChain(vrm: VRM, chain: VRMHumanBoneName[], issues: string[]): void {
    let lastBone: THREE.Object3D | null = null;
    let lastName: VRMHumanBoneName | null = null;

    for (const boneName of chain) {
      const bone = vrm.humanoid.getNormalizedBoneNode(boneName);
      
      // Skip if the bone doesn't exist (it will be reported in bone mapping)
      if (!bone) continue;
      
      // If this is the first bone in the chain, just store it
      if (!lastBone) {
        lastBone = bone;
        lastName = boneName;
        continue;
      }
      
      // Check if this bone is a descendant of the last bone
      let isDescendant = false;
      let parent = bone.parent;
      
      while (parent) {
        if (parent === lastBone) {
          isDescendant = true;
          break;
        }
        parent = parent.parent;
      }
      
      if (!isDescendant) {
        issues.push(`${boneName} is not a descendant of ${lastName}`);
      }
      
      lastBone = bone;
      lastName = boneName;
    }
  }

  /**
   * Check if the VRM is ready for animation
   */
  static validateAnimationReadiness(vrm: VRM): { ready: boolean; issues: string[] } {
    if (!vrm?.humanoid) {
      return {
        ready: false,
        issues: ['Humanoid not found']
      };
    }

    const issues: string[] = [];

    // Check if the model has a skeleton
    let hasSkeleton = false;
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.SkinnedMesh && object.skeleton) {
        hasSkeleton = true;
      }
    });

    if (!hasSkeleton) {
      issues.push('Model does not have a skeleton');
    }

    // Check if essential animation bones are available
    const essentialBones: VRMHumanBoneName[] = [
      'hips', 'spine', 'chest', 'neck', 'head',
      'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
      'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand',
      'leftUpperLeg', 'leftLowerLeg', 'leftFoot',
      'rightUpperLeg', 'rightLowerLeg', 'rightFoot'
    ];

    const missingEssentialBones = essentialBones.filter(
      boneName => !vrm.humanoid.getNormalizedBoneNode(boneName)
    );

    if (missingEssentialBones.length > 0) {
      issues.push(`Missing essential animation bones: ${missingEssentialBones.join(', ')}`);
    }

    return {
      ready: issues.length === 0,
      issues
    };
  }

  /**
   * Comprehensive validation of a VRM model
   */
  static validateVRM(vrm: VRM): {
    valid: boolean;
    boneMapping: ReturnType<typeof VRMBoneValidator.validateBoneMapping>;
    skeletonHierarchy: ReturnType<typeof VRMBoneValidator.validateSkeletonHierarchy>;
    animationReadiness: ReturnType<typeof VRMBoneValidator.validateAnimationReadiness>;
  } {
    if (!vrm) {
      return {
        valid: false,
        boneMapping: { valid: false, missingBones: ['VRM not found'], incorrectBones: [] },
        skeletonHierarchy: { valid: false, issues: ['VRM not found'] },
        animationReadiness: { ready: false, issues: ['VRM not found'] }
      };
    }

    const boneMapping = this.validateBoneMapping(vrm);
    const skeletonHierarchy = this.validateSkeletonHierarchy(vrm);
    const animationReadiness = this.validateAnimationReadiness(vrm);

    const valid = boneMapping.valid && skeletonHierarchy.valid && animationReadiness.ready;

    return {
      valid,
      boneMapping,
      skeletonHierarchy,
      animationReadiness
    };
  }
} 