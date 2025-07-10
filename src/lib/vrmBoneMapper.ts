import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import * as THREE from 'three';

/**
 * Utility for mapping and fixing VRM bone issues
 */
export class VRMBoneMapper {
  /**
   * Attempts to automatically map bones based on common naming patterns
   */
  static autoMapBones(vrm: VRM, scene: THREE.Scene): boolean {
    if (!vrm?.humanoid) {
      console.error('VRM humanoid not found');
      return false;
    }

    // Common naming patterns for major bones
    const commonMappings: Record<string, string[]> = {
      'hips': ['hip', 'pelvis', 'root', 'waist', 'cog', 'origin'],
      'spine': ['spine', 'spine1', 'chest_lower', 'torso'],
      'chest': ['chest', 'spine2', 'torso_upper', 'upperchest_lower'],
      'upperChest': ['upperchest', 'spine3', 'chest_upper'],
      'neck': ['neck', 'neckbase'],
      'head': ['head', 'skull', 'face'],
      'leftEye': ['eye_l', 'eye.l', 'eyeL', 'lefteye'],
      'rightEye': ['eye_r', 'eye.r', 'eyeR', 'righteye'],
      'jaw': ['jaw', 'mandible', 'chin'],
      'leftShoulder': ['shoulder_l', 'shoulder.l', 'shoulderL', 'leftshoulder', 'clavicle_l'],
      'rightShoulder': ['shoulder_r', 'shoulder.r', 'shoulderR', 'rightshoulder', 'clavicle_r'],
      'leftUpperArm': ['upperarm_l', 'arm_l', 'armL', 'leftarm', 'arm.l'],
      'rightUpperArm': ['upperarm_r', 'arm_r', 'armR', 'rightarm', 'arm.r'],
      'leftLowerArm': ['lowerarm_l', 'forearm_l', 'elbow_l', 'forearmL', 'leftforearm', 'forearm.l'],
      'rightLowerArm': ['lowerarm_r', 'forearm_r', 'elbow_r', 'forearmR', 'rightforearm', 'forearm.r'],
      'leftHand': ['hand_l', 'hand.l', 'handL', 'lefthand'],
      'rightHand': ['hand_r', 'hand.r', 'handR', 'righthand'],
      'leftUpperLeg': ['upperleg_l', 'thigh_l', 'thighL', 'leftthigh', 'thigh.l'],
      'rightUpperLeg': ['upperleg_r', 'thigh_r', 'thighR', 'rightthigh', 'thigh.r'],
      'leftLowerLeg': ['lowerleg_l', 'calf_l', 'shin_l', 'calfL', 'leftcalf', 'calf.l'],
      'rightLowerLeg': ['lowerleg_r', 'calf_r', 'shin_r', 'calfR', 'rightcalf', 'calf.r'],
      'leftFoot': ['foot_l', 'foot.l', 'footL', 'leftfoot'],
      'rightFoot': ['foot_r', 'foot.r', 'footR', 'rightfoot'],
      'leftToes': ['toe_l', 'toes_l', 'toe.l', 'toeL', 'lefttoe'],
      'rightToes': ['toe_r', 'toes_r', 'toe.r', 'toeR', 'righttoe']
    };

    // Finger mappings
    const fingerBones = [
      'Thumb', 'Index', 'Middle', 'Ring', 'Little'
    ];
    
    const fingerParts = [
      'Proximal', 'Intermediate', 'Distal'
    ];
    
    // Add finger mappings
    for (const finger of fingerBones) {
      for (const part of fingerParts) {
        for (const side of ['left', 'right']) {
          const vrmBoneName = `${side}${finger}${part}` as VRMHumanBoneName;
          const commonNames = [
            `${finger.toLowerCase()}_${part.toLowerCase()}_${side.toLowerCase()}`,
            `${finger.toLowerCase()}${part}_${side[0].toLowerCase()}`,
            `${side.toLowerCase()}_${finger.toLowerCase()}_${part.toLowerCase()}`,
            `${side[0].toLowerCase()}_${finger.toLowerCase()}_${part.toLowerCase()}`,
            `${finger.toLowerCase()}.${part.toLowerCase()}.${side.toLowerCase()}`,
            `${finger.toLowerCase()}${part.toLowerCase()}.${side.toLowerCase()}`,
            `${finger.toLowerCase()}${part.toLowerCase()}_${side[0].toLowerCase()}`,
          ];
          
          if (finger === 'Thumb' && part === 'Metacarpal') {
            commonNames.push(`${side.toLowerCase()}_${finger.toLowerCase()}_base`);
            commonNames.push(`${side[0].toLowerCase()}_${finger.toLowerCase()}_base`);
          }
          
          commonMappings[vrmBoneName] = commonNames;
        }
      }
    }

    // Find all bones in the scene
    const allBones: THREE.Bone[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Bone) {
        allBones.push(object);
      }
    });

    console.log(`Found ${allBones.length} bones in the scene`);

    // Try to map bones by name
    let mappedCount = 0;
    const humanBones = vrm.humanoid.humanBones;
    
    for (const [vrmBoneName, possibleNames] of Object.entries(commonMappings)) {
      // Skip if this bone is already mapped
      if (humanBones[vrmBoneName as VRMHumanBoneName]) {
        continue;
      }
      
      // Try to find a matching bone
      for (const bone of allBones) {
        const boneName = bone.name.toLowerCase();
        
        // Check if the bone name matches any of the possible names
        if (possibleNames.some(name => boneName.includes(name.toLowerCase()))) {
          // Map the bone
          vrm.humanoid.humanBones[vrmBoneName as VRMHumanBoneName] = { node: bone };
          console.log(`Mapped ${vrmBoneName} to ${bone.name}`);
          mappedCount++;
          break;
        }
      }
    }

    console.log(`Automatically mapped ${mappedCount} bones`);
    return mappedCount > 0;
  }

  /**
   * Manually map a specific bone
   */
  static mapBone(vrm: VRM, vrmBoneName: VRMHumanBoneName, sceneBoneName: string): boolean {
    if (!vrm?.humanoid || !vrm.scene) {
      console.error('VRM humanoid or scene not found');
      return false;
    }

    // Find the bone in the scene
    let bone: THREE.Object3D | null = null;
    vrm.scene.traverse((object) => {
      if (object.name === sceneBoneName) {
        bone = object;
      }
    });

    if (!bone) {
      console.error(`Bone "${sceneBoneName}" not found in the scene`);
      return false;
    }

    // Map the bone
    vrm.humanoid.humanBones[vrmBoneName] = { node: bone };
    console.log(`Manually mapped ${vrmBoneName} to ${sceneBoneName}`);
    return true;
  }

  /**
   * Create missing bones if needed
   */
  static createMissingBones(vrm: VRM): boolean {
    if (!vrm?.humanoid || !vrm.scene) {
      console.error('VRM humanoid or scene not found');
      return false;
    }

    // Essential bones that must exist
    const essentialBones: VRMHumanBoneName[] = [
      'hips', 'spine', 'chest', 'neck', 'head'
    ];

    // Check if we have the essential bones
    const missingEssentialBones = essentialBones.filter(
      boneName => !vrm.humanoid.getBoneNode(boneName)
    );

    if (missingEssentialBones.length === 0) {
      console.log('All essential bones exist');
      return true;
    }

    // If Hips is missing, we need to create a root bone
    if (!vrm.humanoid.getBoneNode('hips')) {
      const hips = new THREE.Bone();
      hips.name = 'hips';
      hips.position.set(0, 1, 0);
      vrm.scene.add(hips);
      vrm.humanoid.humanBones.hips = { node: hips };
      console.log('Created Hips bone');
    }

    // Get the hips bone
    const hips = vrm.humanoid.getBoneNode('hips');
    if (!hips) return false;

    // Create spine if missing
    if (!vrm.humanoid.getBoneNode('spine')) {
      const spine = new THREE.Bone();
      spine.name = 'spine';
      spine.position.set(0, 0.1, 0);
      hips.add(spine);
      vrm.humanoid.humanBones.spine = { node: spine };
      console.log('Created Spine bone');
    }

    // Get the spine bone
    const spine = vrm.humanoid.getBoneNode('spine');
    if (!spine) return false;

    // Create chest if missing
    if (!vrm.humanoid.getBoneNode('chest')) {
      const chest = new THREE.Bone();
      chest.name = 'chest';
      chest.position.set(0, 0.1, 0);
      spine.add(chest);
      vrm.humanoid.humanBones.chest = { node: chest };
      console.log('Created Chest bone');
    }

    // Get the chest bone
    const chest = vrm.humanoid.getBoneNode('chest');
    if (!chest) return false;

    // Create neck if missing
    if (!vrm.humanoid.getBoneNode('neck')) {
      const neck = new THREE.Bone();
      neck.name = 'neck';
      neck.position.set(0, 0.1, 0);
      chest.add(neck);
      vrm.humanoid.humanBones.neck = { node: neck };
      console.log('Created Neck bone');
    }

    // Get the neck bone
    const neck = vrm.humanoid.getBoneNode('neck');
    if (!neck) return false;

    // Create head if missing
    if (!vrm.humanoid.getBoneNode('head')) {
      const head = new THREE.Bone();
      head.name = 'head';
      head.position.set(0, 0.1, 0);
      neck.add(head);
      vrm.humanoid.humanBones.head = { node: head };
      console.log('Created Head bone');
    }

    return true;
  }

  /**
   * Fix the bone hierarchy to ensure proper parent-child relationships
   */
  static fixBoneHierarchy(vrm: VRM): boolean {
    if (!vrm?.humanoid) {
      console.error('VRM humanoid not found');
      return false;
    }

    // Main skeletal chain
    const mainChain: VRMHumanBoneName[] = [
      'hips', 'spine', 'chest', 'upperChest', 'neck', 'head'
    ];

    // Get all existing bones in the chain
    const existingBones = mainChain
      .map(name => ({ name, bone: vrm.humanoid.getBoneNode(name) }))
      .filter(item => item.bone !== null);

    // Ensure proper parent-child relationships
    for (let i = 1; i < existingBones.length; i++) {
      const current = existingBones[i];
      const previous = existingBones[i - 1];

      // Skip UpperChest if it doesn't exist
      if (current.name === 'upperChest' && !current.bone) continue;

      if (current.bone && previous.bone) {
        // Check if the current bone is already a child of the previous bone
        let isChild = false;
        let parent = current.bone.parent;
        
        while (parent) {
          if (parent === previous.bone) {
            isChild = true;
            break;
          }
          parent = parent.parent;
        }

        // If not, reparent the bone
        if (!isChild) {
          const worldPos = new THREE.Vector3();
          current.bone.getWorldPosition(worldPos);
          
          // Remove from current parent
          if (current.bone.parent) {
            current.bone.parent.remove(current.bone);
          }
          
          // Add to new parent
          previous.bone.add(current.bone);
          
          // Restore world position
          current.bone.position.copy(worldPos);
          
          console.log(`Reparented ${current.name} to ${previous.name}`);
        }
      }
    }

    return true;
  }

  /**
   * Apply all fixes to the VRM model
   */
  static fixVRMBones(vrm: VRM, scene: THREE.Scene): boolean {
    if (!vrm) return false;

    let success = true;
    
    // Step 1: Try to auto-map bones
    success = this.autoMapBones(vrm, scene) && success;
    
    // Step 2: Create any missing essential bones
    success = this.createMissingBones(vrm) && success;
    
    // Step 3: Fix the bone hierarchy
    success = this.fixBoneHierarchy(vrm) && success;
    
    return success;
  }
} 