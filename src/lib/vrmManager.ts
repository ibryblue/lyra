import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class VRMManager {
  private loader: GLTFLoader;
  private scene: THREE.Scene;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMLoaderPlugin(parser));
  }
  
  // Load VRM file
  async loadVRM(url: string): Promise<VRM> {
    try {
      const gltf = await this.loader.loadAsync(url);
      const vrm = gltf.userData.vrm as VRM;
      
      if (!vrm) {
        throw new Error('VRM data not found');
      }
      
      // Optimize VRM model using recommended methods
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      
      // Use combineSkeletons instead of deprecated removeUnnecessaryJoints
      VRMUtils.combineSkeletons(gltf.scene);
      
      // Enable shadows
      vrm.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      return vrm;
    } catch (error) {
      console.error('VRM loading failed:', error);
      // Instead of creating fallback shapes, just rethrow the error
      throw error;
    }
  }
  
  // Load VRM from file
  async loadVRMFromFile(file: File): Promise<VRM> {
    const url = URL.createObjectURL(file);
    try {
      const vrm = await this.loadVRM(url);
      return vrm;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  
  // Set VRM expression
  setVRMExpression(vrm: VRM, expressionName: string, weight: number = 1.0) {
    if (vrm.expressionManager) {
      vrm.expressionManager.setValue(expressionName, weight);
    }
  }
  
  // Apply VRM pose
  applyVRMPose(vrm: VRM, pose: Record<string, THREE.Quaternion>) {
    if (!vrm.humanoid) return;
    
    // First reset to neutral pose
    Object.values(vrm.humanoid.humanBones).forEach(bone => {
      if (bone && bone.node) {
        bone.node.quaternion.set(0, 0, 0, 1);
      }
    });
    
    // Then apply the new pose with smooth interpolation
    Object.entries(pose).forEach(([boneName, rotation]) => {
      const bone = vrm.humanoid?.getNormalizedBoneNode(boneName as any);
      if (bone) {
        // Use slerp for smooth rotation
        bone.quaternion.slerp(rotation, 1);
      }
    });
    
    // Ensure natural hand positions
    const leftHand = vrm.humanoid?.getNormalizedBoneNode('leftHand');
    const rightHand = vrm.humanoid?.getNormalizedBoneNode('rightHand');
    
    if (leftHand) {
      leftHand.quaternion.slerp(new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, -0.1)
      ), 0.5);
    }
    
    if (rightHand) {
      rightHand.quaternion.slerp(new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, 0, 0.1)
      ), 0.5);
    }
  }
  
  // Update VRM
  updateVRM(vrm: VRM, deltaTime: number) {
    if (vrm) {
      vrm.update(deltaTime);
    }
  }
  
  // Get available expressions for VRM
  getAvailableExpressions(vrm: VRM): string[] {
    if (!vrm.expressionManager) return [];
    
    const expressions: string[] = [];
    const expressionManager = vrm.expressionManager;
    
    // Get preset expressions
    const presetExpressions = ['neutral', 'happy', 'angry', 'sad', 'relaxed', 'surprised'];
    presetExpressions.forEach(expr => {
      if (expressionManager.getExpression(expr)) {
        expressions.push(expr);
      }
    });
    
    return expressions;
  }
  
  // Apply animation to VRM
  applyAnimation(vrm: VRM, animationClip: THREE.AnimationClip, mixer: THREE.AnimationMixer): THREE.AnimationAction | null {
    if (!vrm || !animationClip || !mixer) return null;
    
    try {
      // Check for missing bones and create them if needed
      this.createMissingBones(vrm, animationClip);
      
      // Retarget the animation for VRM
      const retargetedClip = this.retargetAnimation(vrm, animationClip);
      
      // Fix hand rotations for all animations
      this.fixHandsForAllAnimations(vrm, retargetedClip);
      
      // Keep arms down by default unless explicitly animated
      this.keepArmsDown(vrm, retargetedClip);
      
      // Create and configure the action
      const action = mixer.clipAction(retargetedClip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = true;
      
      return action;
    } catch (error) {
      console.error('Failed to apply animation to VRM:', error);
      return null;
    }
  }
  
  // Fix hand rotations for all animations to prevent unnatural poses
  fixHandsForAllAnimations(vrm: VRM, clip: THREE.AnimationClip): void {
    if (!vrm || !clip) return;
    
    console.log(`Analyzing animation clip "${clip.name}" for hand animations...`);
    
    // Get all VRM hand bones
    const leftHand = vrm.humanoid.getNormalizedBoneNode('leftHand');
    const rightHand = vrm.humanoid.getNormalizedBoneNode('rightHand');
    
    console.log(`VRM hand bones:`, {
      leftHand: leftHand?.name || 'not found',
      rightHand: rightHand?.name || 'not found'
    });
    
    if (!leftHand && !rightHand) {
      console.warn('No hand bones found in VRM model');
      return;
    }
    
    // Log all tracks in the animation for debugging
    console.log(`Animation has ${clip.tracks.length} tracks`);
    if (clip.tracks.length < 20) {
      clip.tracks.forEach((track, index) => {
        console.log(`- Track ${index}: ${track.name}`);
      });
    }
    
    // Find any tracks that might be targeting hands but using incorrect names
    const allTracks = clip.tracks;
    const handRelatedTracks: THREE.KeyframeTrack[] = [];
    
    // Common hand-related keywords to check in track names
    const handKeywords = [
      'hand', 'wrist', 'palm', 
      'finger', 'thumb', 'index', 'middle', 'ring', 'little', 'pinky',
      'te_', 'te.', 'hand_', 'wrist_', 'finger_'
    ];
    
    // Find all tracks that might be related to hands
    allTracks.forEach(track => {
      const trackName = track.name.toLowerCase();
      if (handKeywords.some(keyword => trackName.includes(keyword))) {
        handRelatedTracks.push(track);
      }
    });
    
    console.log(`Found ${handRelatedTracks.length} potential hand-related tracks`);
    
    // If we found hand-related tracks, remap them to the correct bones
    if (handRelatedTracks.length > 0) {
      this.remapHandTracks(vrm, clip, handRelatedTracks, leftHand, rightHand);
    } else {
      console.log('No hand-related tracks found, creating neutral hand positions');
      
      // If no hand tracks were found, create neutral ones
      if (leftHand && !clip.tracks.some(track => track.name.startsWith(`${leftHand.name}.quaternion`))) {
        this.createNeutralHandTrack(leftHand.name, clip);
      }
      
      if (rightHand && !clip.tracks.some(track => track.name.startsWith(`${rightHand.name}.quaternion`))) {
        this.createNeutralHandTrack(rightHand.name, clip);
      }
    }
    
    console.log('Hand animation processing complete');
  }
  
  // Remap hand tracks to the correct bones
  remapHandTracks(
    vrm: VRM, 
    clip: THREE.AnimationClip, 
    handTracks: THREE.KeyframeTrack[],
    leftHand: THREE.Object3D | null,
    rightHand: THREE.Object3D | null
  ): void {
    // Track whether we've found and remapped left and right hand tracks
    let leftHandRemapped = false;
    let rightHandRemapped = false;
    
    // New tracks to add
    const newTracks: THREE.KeyframeTrack[] = [];
    
    // Tracks to remove (will be replaced by remapped ones)
    const tracksToRemove: THREE.KeyframeTrack[] = [];
    
    // Create a mapping of common hand bone names to VRM bone names
    const boneNameMapping: Record<string, string> = {};
    
    // Add mappings for hands with various common formats
    if (leftHand) {
      boneNameMapping['lefthand'] = leftHand.name;
      boneNameMapping['left_hand'] = leftHand.name;
      boneNameMapping['hand_l'] = leftHand.name;
      boneNameMapping['handl'] = leftHand.name;
      boneNameMapping['l_hand'] = leftHand.name;
      boneNameMapping['lhand'] = leftHand.name;
      boneNameMapping['left.hand'] = leftHand.name;
      boneNameMapping['leftwrist'] = leftHand.name;
      boneNameMapping['left_wrist'] = leftHand.name;
      boneNameMapping['wrist_l'] = leftHand.name;
      boneNameMapping['wristl'] = leftHand.name;
      boneNameMapping['l_wrist'] = leftHand.name;
      boneNameMapping['lwrist'] = leftHand.name;
    }
    
    if (rightHand) {
      boneNameMapping['righthand'] = rightHand.name;
      boneNameMapping['right_hand'] = rightHand.name;
      boneNameMapping['hand_r'] = rightHand.name;
      boneNameMapping['handr'] = rightHand.name;
      boneNameMapping['r_hand'] = rightHand.name;
      boneNameMapping['rhand'] = rightHand.name;
      boneNameMapping['right.hand'] = rightHand.name;
      boneNameMapping['rightwrist'] = rightHand.name;
      boneNameMapping['right_wrist'] = rightHand.name;
      boneNameMapping['wrist_r'] = rightHand.name;
      boneNameMapping['wristr'] = rightHand.name;
      boneNameMapping['r_wrist'] = rightHand.name;
      boneNameMapping['rwrist'] = rightHand.name;
    }
    
    console.log('Animation clip tracks:', clip.tracks.map(t => t.name).join(', '));
    console.log('Hand tracks found:', handTracks.map(t => t.name).join(', '));
    
    // Process each hand-related track
    handTracks.forEach(track => {
      if (!(track instanceof THREE.QuaternionKeyframeTrack)) return;
      
      const trackName = track.name.toLowerCase();
      const bonePart = trackName.split('.')[0]; // Get the bone name part before the dot
      
      console.log(`Processing track: ${track.name}, bone part: ${bonePart}`);
      
      // Try to find a matching bone name in our mapping
      let targetBoneName = null;
      
      // First try exact matches
      if (boneNameMapping[bonePart]) {
        targetBoneName = boneNameMapping[bonePart];
        console.log(`Found exact match: ${bonePart} -> ${targetBoneName}`);
      } else {
        // If no exact match, try to find the closest match
        for (const [mappingKey, mappingValue] of Object.entries(boneNameMapping)) {
          if (bonePart.includes(mappingKey) || mappingKey.includes(bonePart)) {
            targetBoneName = mappingValue;
            console.log(`Found partial match: ${bonePart} -> ${mappingKey} -> ${targetBoneName}`);
            break;
          }
        }
        
        // If still no match, try to determine if it's left or right
        if (!targetBoneName) {
          if ((bonePart.includes('left') || bonePart.includes('l_') || bonePart.startsWith('l') || 
               bonePart.includes('_l') || bonePart.endsWith('l')) && leftHand) {
            targetBoneName = leftHand.name;
            console.log(`Determined as left hand: ${bonePart} -> ${targetBoneName}`);
          } else if ((bonePart.includes('right') || bonePart.includes('r_') || bonePart.startsWith('r') || 
                      bonePart.includes('_r') || bonePart.endsWith('r')) && rightHand) {
            targetBoneName = rightHand.name;
            console.log(`Determined as right hand: ${bonePart} -> ${targetBoneName}`);
          }
        }
      }
      
      // If we found a target bone, create a new track
      if (targetBoneName) {
        // Create a new track with the correct bone name
        const newTrackName = `${targetBoneName}.quaternion`;
        
        // Create a new track with the same data but correct name
        const newTrack = new THREE.QuaternionKeyframeTrack(
          newTrackName,
          track.times.slice(),
          track.values.slice()
        );
        
        // Add the new track and mark the old one for removal
        newTracks.push(newTrack);
        tracksToRemove.push(track);
        
        console.log(`Remapped ${track.name} to ${newTrackName}`);
        
        // Mark this hand as remapped
        if (targetBoneName === leftHand?.name) leftHandRemapped = true;
        if (targetBoneName === rightHand?.name) rightHandRemapped = true;
      } else {
        console.log(`Could not find matching bone for track: ${track.name}`);
      }
    });
    
    // Remove the old tracks
    tracksToRemove.forEach(track => {
      const index = clip.tracks.indexOf(track);
      if (index !== -1) {
        clip.tracks.splice(index, 1);
      }
    });
    
    // Add the new tracks
    clip.tracks.push(...newTracks);
    console.log(`Added ${newTracks.length} remapped hand tracks`);
    
    // If we still don't have tracks for either hand, create neutral ones
    if (leftHand && !leftHandRemapped) {
      this.createNeutralHandTrack(leftHand.name, clip);
    }
    
    if (rightHand && !rightHandRemapped) {
      this.createNeutralHandTrack(rightHand.name, clip);
    }
  }
  
  // Create a neutral hand track if none exists
  createNeutralHandTrack(handBoneName: string, clip: THREE.AnimationClip): void {
    // Create a simple track with two keyframes at the start and end
    const times = [0, clip.duration];
    const values = [0, 0, 0, 1, 0, 0, 0, 1]; // Two identical quaternions (neutral position)
    
    const newTrack = new THREE.QuaternionKeyframeTrack(
      `${handBoneName}.quaternion`,
      times,
      values
    );
    
    clip.tracks.push(newTrack);
    console.log(`Created neutral hand track for ${handBoneName}`);
  }
  
  // Fix hand rotations to prevent unnatural poses
  fixHandRotations(vrm: VRM, clip: THREE.AnimationClip): void {
    // This method is now deprecated, using fixHandsForAllAnimations instead
    this.fixHandsForAllAnimations(vrm, clip);
  }
  
  // Create missing bones needed for animation
  createMissingBones(vrm: VRM, animationClip: THREE.AnimationClip): void {
    if (!vrm || !vrm.scene || !animationClip) return;
    
    const humanoid = vrm.humanoid;
    if (!humanoid) return;
    
    // Get all bone names used in the animation
    const animationBoneNames = new Set<string>();
    animationClip.tracks.forEach(track => {
      const trackSplit = track.name.split('.');
      if (trackSplit.length >= 2) {
        animationBoneNames.add(trackSplit[0]);
      }
    });
    
    // Common parent bones to attach missing bones to
    const commonParents: Record<string, string> = {
      'rightArm': 'rightShoulder',
      'leftArm': 'leftShoulder',
      'rightForeArm': 'rightUpperArm',
      'leftForeArm': 'leftUpperArm',
      'rightHand': 'rightLowerArm',
      'leftHand': 'leftLowerArm',
      'rightUpLeg': 'hips',
      'leftUpLeg': 'hips',
      'rightLeg': 'rightUpperLeg',
      'leftLeg': 'leftUpperLeg',
      'rightFoot': 'rightLowerLeg',
      'leftFoot': 'leftLowerLeg',
      // J_Bip mappings
      'J_Bip_R_UpperArm': 'J_Bip_R_Shoulder',
      'J_Bip_L_UpperArm': 'J_Bip_L_Shoulder',
      'J_Bip_R_LowerArm': 'J_Bip_R_UpperArm',
      'J_Bip_L_LowerArm': 'J_Bip_L_UpperArm',
      'J_Bip_R_Hand': 'J_Bip_R_LowerArm',
      'J_Bip_L_Hand': 'J_Bip_L_LowerArm'
    };
    
    // Check each bone used in the animation
    animationBoneNames.forEach(boneName => {
      // Skip if we already have a mapping for this bone
      const existingBone = this.findBoneInVRM(vrm, boneName);
      if (existingBone) return;
      
      // If we don't have a mapping, try to create a bone
      const parentBoneName = commonParents[boneName];
      if (!parentBoneName) return;
      
      const parentBone = this.findBoneInVRM(vrm, parentBoneName);
      if (!parentBone) return;
      
      // Create a new bone as a child of the parent
      const newBone = new THREE.Bone();
      newBone.name = boneName;
      
      // Position the new bone relative to its parent
      newBone.position.set(0, -0.1, 0); // Simple offset
      
      // Add the new bone to the parent
      parentBone.add(newBone);
      
      console.log(`Created missing bone '${boneName}' as child of '${parentBoneName}'`);
    });
  }
  
  // Find a bone in VRM by name or common alternatives
  findBoneInVRM(vrm: VRM, boneName: string): THREE.Object3D | null {
    if (!vrm || !vrm.humanoid) return null;
    
    // Try direct mapping from VRM humanoid
    const humanoidBone = vrm.humanoid.getNormalizedBoneNode(boneName as any);
    if (humanoidBone) return humanoidBone;
    
    // Check if this is a J_Bip_ bone name and map it to standard name
    if (boneName.startsWith('J_Bip_')) {
      const standardName = this.mapBipBoneToStandard(boneName);
      if (standardName) {
        const mappedBone = vrm.humanoid.getNormalizedBoneNode(standardName as any);
        if (mappedBone) return mappedBone;
      }
    }
    
    // Common alternative names
    const alternatives: Record<string, string[]> = {
      'rightArm': ['rightUpperArm', 'rightShoulder'],
      'leftArm': ['leftUpperArm', 'leftShoulder'],
      'rightForeArm': ['rightLowerArm', 'rightElbow'],
      'leftForeArm': ['leftLowerArm', 'leftElbow'],
      'rightHand': ['rightPalm', 'rightWrist'],
      'leftHand': ['leftPalm', 'leftWrist'],
      'rightUpLeg': ['rightUpperLeg', 'rightHip'],
      'leftUpLeg': ['leftUpperLeg', 'leftHip'],
      'rightLeg': ['rightLowerLeg', 'rightKnee'],
      'leftLeg': ['leftLowerLeg', 'leftKnee'],
      'rightFoot': ['rightAnkle'],
      'leftFoot': ['leftAnkle']
    };
    
    // Check for alternatives
    const altNames = alternatives[boneName] || [];
    for (const altName of altNames) {
      const bone = vrm.humanoid.getNormalizedBoneNode(altName as any);
      if (bone) return bone;
    }
    
    // Search the entire scene as a last resort
    let result: THREE.Object3D | null = null;
    vrm.scene.traverse((obj) => {
      if (obj.name === boneName || obj.name.toLowerCase() === boneName.toLowerCase()) {
        result = obj;
      }
    });
    
    return result;
  }
  
  // Map J_Bip bone names to standard VRM bone names
  mapBipBoneToStandard(bipName: string): string | null {
    const bipMappings: Record<string, string> = {
      'J_Bip_C_Hips': 'hips',
      'J_Bip_C_Spine': 'spine',
      'J_Bip_C_Chest': 'chest',
      'J_Bip_C_Neck': 'neck',
      'J_Bip_C_Head': 'head',
      'J_Bip_L_Shoulder': 'leftShoulder',
      'J_Bip_L_UpperArm': 'leftUpperArm',
      'J_Bip_L_LowerArm': 'leftLowerArm',
      'J_Bip_L_Hand': 'leftHand',
      'J_Bip_R_Shoulder': 'rightShoulder',
      'J_Bip_R_UpperArm': 'rightUpperArm',
      'J_Bip_R_LowerArm': 'rightLowerArm',
      'J_Bip_R_Hand': 'rightHand',
      'J_Bip_L_UpperLeg': 'leftUpperLeg',
      'J_Bip_L_LowerLeg': 'leftLowerLeg',
      'J_Bip_L_Foot': 'leftFoot',
      'J_Bip_L_ToeBase': 'leftToes',
      'J_Bip_R_UpperLeg': 'rightUpperLeg',
      'J_Bip_R_LowerLeg': 'rightLowerLeg',
      'J_Bip_R_Foot': 'rightFoot',
      'J_Bip_R_ToeBase': 'rightToes'
    };
    
    return bipMappings[bipName] || null;
  }
  
  // Retarget animation to match VRM bone structure
  retargetAnimation(vrm: VRM, animationClip: THREE.AnimationClip): THREE.AnimationClip {
    // Create a copy of the animation clip to avoid modifying the original
    const retargetedClip = animationClip.clone();
    
    // Get the humanoid bone mapping from the VRM
    const humanoid = vrm.humanoid;
    if (!humanoid) return retargetedClip;
    
    // Map of standard bone names to VRM bone names
    const boneNameMap: Record<string, string> = {};
    
    // Build the bone name mapping
    Object.keys(humanoid.humanBones).forEach(boneName => {
      // Use getNormalizedBoneNode instead of deprecated getBoneNode
      const bone = humanoid.getNormalizedBoneNode(boneName as any);
      if (bone) {
        boneNameMap[boneName] = bone.name;
        // Also map common naming conventions
        boneNameMap[boneName.toLowerCase()] = bone.name;
        boneNameMap[boneName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()] = bone.name;
      }
    });
    
    // Add common alternative bone name mappings
    const commonMappings: Record<string, string[]> = {
      'rightArm': ['rightUpperArm', 'rightShoulder', 'rightArmUpper'],
      'leftArm': ['leftUpperArm', 'leftShoulder', 'leftArmUpper'],
      'rightForeArm': ['rightLowerArm', 'rightElbow', 'rightArmLower'],
      'leftForeArm': ['leftLowerArm', 'leftElbow', 'leftArmLower'],
      'rightHand': ['rightPalm', 'rightWrist'],
      'leftHand': ['leftPalm', 'leftWrist'],
      'rightUpLeg': ['rightUpperLeg', 'rightHip', 'rightThigh'],
      'leftUpLeg': ['leftUpperLeg', 'leftHip', 'leftThigh'],
      'rightLeg': ['rightLowerLeg', 'rightKnee', 'rightShin'],
      'leftLeg': ['leftLowerLeg', 'leftKnee', 'leftShin'],
      'rightFoot': ['rightAnkle'],
      'leftFoot': ['leftAnkle'],
      'spine': ['chest', 'torso'],
      'head': ['face', 'skull']
    };
    
    // Add the common mappings to our bone map
    Object.entries(commonMappings).forEach(([commonName, alternatives]) => {
      alternatives.forEach(alt => {
        // If we have a mapping for the alternative name, map the common name to it
        if (boneNameMap[alt]) {
          boneNameMap[commonName] = boneNameMap[alt];
        }
      });
    });
    
    // Add mappings for J_Bip_ naming convention
    const bipMappings: Record<string, string> = {
      'J_Bip_C_Hips': 'hips',
      'J_Bip_C_Spine': 'spine',
      'J_Bip_C_Chest': 'chest',
      'J_Bip_C_Neck': 'neck',
      'J_Bip_C_Head': 'head',
      'J_Bip_L_Shoulder': 'leftShoulder',
      'J_Bip_L_UpperArm': 'leftUpperArm',
      'J_Bip_L_LowerArm': 'leftLowerArm',
      'J_Bip_L_Hand': 'leftHand',
      'J_Bip_R_Shoulder': 'rightShoulder',
      'J_Bip_R_UpperArm': 'rightUpperArm',
      'J_Bip_R_LowerArm': 'rightLowerArm',
      'J_Bip_R_Hand': 'rightHand',
      'J_Bip_L_UpperLeg': 'leftUpperLeg',
      'J_Bip_L_LowerLeg': 'leftLowerLeg',
      'J_Bip_L_Foot': 'leftFoot',
      'J_Bip_L_ToeBase': 'leftToes',
      'J_Bip_R_UpperLeg': 'rightUpperLeg',
      'J_Bip_R_LowerLeg': 'rightLowerLeg',
      'J_Bip_R_Foot': 'rightFoot',
      'J_Bip_R_ToeBase': 'rightToes',
      // Finger mappings
      'J_Bip_L_Thumb1': 'leftThumbProximal',
      'J_Bip_L_Thumb2': 'leftThumbIntermediate',
      'J_Bip_L_Thumb3': 'leftThumbDistal',
      'J_Bip_L_Index1': 'leftIndexProximal',
      'J_Bip_L_Index2': 'leftIndexIntermediate',
      'J_Bip_L_Index3': 'leftIndexDistal',
      'J_Bip_L_Middle1': 'leftMiddleProximal',
      'J_Bip_L_Middle2': 'leftMiddleIntermediate',
      'J_Bip_L_Middle3': 'leftMiddleDistal',
      'J_Bip_L_Ring1': 'leftRingProximal',
      'J_Bip_L_Ring2': 'leftRingIntermediate',
      'J_Bip_L_Ring3': 'leftRingDistal',
      'J_Bip_L_Little1': 'leftLittleProximal',
      'J_Bip_L_Little2': 'leftLittleIntermediate',
      'J_Bip_L_Little3': 'leftLittleDistal',
      'J_Bip_R_Thumb1': 'rightThumbProximal',
      'J_Bip_R_Thumb2': 'rightThumbIntermediate',
      'J_Bip_R_Thumb3': 'rightThumbDistal',
      'J_Bip_R_Index1': 'rightIndexProximal',
      'J_Bip_R_Index2': 'rightIndexIntermediate',
      'J_Bip_R_Index3': 'rightIndexDistal',
      'J_Bip_R_Middle1': 'rightMiddleProximal',
      'J_Bip_R_Middle2': 'rightMiddleIntermediate',
      'J_Bip_R_Middle3': 'rightMiddleDistal',
      'J_Bip_R_Ring1': 'rightRingProximal',
      'J_Bip_R_Ring2': 'rightRingIntermediate',
      'J_Bip_R_Ring3': 'rightRingDistal',
      'J_Bip_R_Little1': 'rightLittleProximal',
      'J_Bip_R_Little2': 'rightLittleIntermediate',
      'J_Bip_R_Little3': 'rightLittleDistal'
    };
    
    // Create reverse mappings for J_Bip bones
    Object.entries(bipMappings).forEach(([bipName, standardName]) => {
      // If we have a mapping for the standard name, map the bip name to the VRM bone
      if (boneNameMap[standardName]) {
        boneNameMap[bipName] = boneNameMap[standardName];
      } else {
        // Try to find the bone directly in the VRM
        vrm.scene.traverse((obj) => {
          if (obj.name === bipName) {
            boneNameMap[bipName] = obj.name;
          }
        });
      }
    });
    
    // Process each track in the animation
    const tracks: THREE.KeyframeTrack[] = [];
    const unmappedTracks: string[] = [];
    
    retargetedClip.tracks.forEach(track => {
      // Parse the track name to get the bone name
      // Format is typically "boneName.property"
      const trackSplit = track.name.split('.');
      if (trackSplit.length < 2) return;
      
      const boneName = trackSplit[0];
      const property = trackSplit[1];
      
      // Find the corresponding VRM bone
      const vrmBoneName = boneNameMap[boneName];
      
      if (vrmBoneName) {
        // Create a new track with the VRM bone name
        const newTrackName = `${vrmBoneName}.${property}`;
        
        let newTrack;
        if (track instanceof THREE.QuaternionKeyframeTrack) {
          newTrack = new THREE.QuaternionKeyframeTrack(
            newTrackName,
            track.times,
            track.values.slice()
          );
        } else if (track instanceof THREE.VectorKeyframeTrack) {
          newTrack = new THREE.VectorKeyframeTrack(
            newTrackName,
            track.times,
            track.values.slice()
          );
        } else {
          newTrack = new THREE.KeyframeTrack(
            newTrackName,
            track.times,
            track.values.slice()
          );
        }
        
        tracks.push(newTrack);
      } else {
        // Log unmapped tracks for debugging
        if (!unmappedTracks.includes(boneName)) {
          unmappedTracks.push(boneName);
        }
        
        // Keep the original track if no mapping is found
        tracks.push(track);
      }
    });
    
    // Log unmapped bones for debugging
    if (unmappedTracks.length > 0) {
      console.warn('Unmapped bones in animation:', unmappedTracks);
    }
    
    return new THREE.AnimationClip(
      retargetedClip.name,
      retargetedClip.duration,
      tracks
    );
  }
  
  // Keep arms down by default unless explicitly animated
  keepArmsDown(vrm: VRM, clip: THREE.AnimationClip): void {
    if (!vrm || !clip) return;
    
    // Get arm bones
    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
    
    if (!leftUpperArm && !rightUpperArm) return;
    
    // Check if this is the "wave" animation
    const isWaveAnimation = clip.name.toLowerCase().includes('wave');
    
    // If it's a wave animation, we'll modify it to only raise one arm slightly
    if (isWaveAnimation) {
      // Find upper arm tracks
      const leftArmTracks = clip.tracks.filter(track => 
        (leftUpperArm && track.name.startsWith(`${leftUpperArm.name}.quaternion`)) ||
        track.name.includes('leftUpperArm.quaternion')
      );
      
      const rightArmTracks = clip.tracks.filter(track => 
        (rightUpperArm && track.name.startsWith(`${rightUpperArm.name}.quaternion`)) ||
        track.name.includes('rightUpperArm.quaternion')
      );
      
      // For wave animation, we'll keep the left arm down completely
      leftArmTracks.forEach(track => {
        if (!(track instanceof THREE.QuaternionKeyframeTrack)) return;
        
        // Set all keyframes to identity quaternion (no rotation)
        for (let i = 0; i < track.values.length; i += 4) {
          track.values[i] = 0;     // x
          track.values[i + 1] = 0; // y
          track.values[i + 2] = 0; // z
          track.values[i + 3] = 1; // w (identity quaternion)
        }
      });
      
      // For the right arm (waving arm), we'll create a simple waving motion
      // without raising the arm too high
      rightArmTracks.forEach(track => {
        if (!(track instanceof THREE.QuaternionKeyframeTrack)) return;
        
        // Create a custom waving motion
        const times = track.times;
        const values = new Float32Array(track.values.length);
        
        // For each keyframe
        for (let i = 0; i < times.length; i++) {
          const index = i * 4;
          const normalizedTime = (times[i] % 1.0); // Normalize time to 0-1 range
          
          // Create a simple side-to-side waving motion
          // Use sine wave for smooth animation
          const waveAngle = Math.sin(normalizedTime * Math.PI * 2) * 0.3; // Max 0.3 radians (~17 degrees)
          
          // Create quaternion for a slight side-to-side motion (around Y axis)
          // with arm slightly raised (around X axis)
          const euler = new THREE.Euler(
            -0.2,                // Slight upward angle (negative X is up for right arm)
            waveAngle,           // Side to side wave motion
            0                    // No twist
          );
          
          const quat = new THREE.Quaternion().setFromEuler(euler);
          
          // Set the values
          values[index] = quat.x;
          values[index + 1] = quat.y;
          values[index + 2] = quat.z;
          values[index + 3] = quat.w;
        }
        
        // Replace the track values with our custom wave motion
        for (let i = 0; i < values.length; i++) {
          track.values[i] = values[i];
        }
      });
      
      // If we don't have right arm tracks, create them
      if (rightUpperArm && rightArmTracks.length === 0) {
        // Create a simple waving animation
        const times = [0, 0.25, 0.5, 0.75, 1.0];
        const values = new Float32Array(5 * 4); // 5 keyframes, 4 values per quaternion
        
        // Create wave motion
        for (let i = 0; i < 5; i++) {
          const index = i * 4;
          const normalizedTime = times[i];
          
          // Create a simple side-to-side waving motion
          const waveAngle = Math.sin(normalizedTime * Math.PI * 2) * 0.3; // Max 0.3 radians
          
          const euler = new THREE.Euler(
            -0.2,                // Slight upward angle
            waveAngle,           // Side to side wave motion
            0                    // No twist
          );
          
          const quat = new THREE.Quaternion().setFromEuler(euler);
          
          // Set the values
          values[index] = quat.x;
          values[index + 1] = quat.y;
          values[index + 2] = quat.z;
          values[index + 3] = quat.w;
        }
        
        // Create new track
        const newTrack = new THREE.QuaternionKeyframeTrack(
          `${rightUpperArm.name}.quaternion`,
          times,
          values
        );
        
        clip.tracks.push(newTrack);
      }
    }
  }
}

// VRMA animation manager
export class VRMAManager {
  private loader: GLTFLoader;
  
  constructor() {
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMLoaderPlugin(parser));
  }
  
  // Load VRMA animation file
  async loadVRMA(url: string): Promise<THREE.AnimationClip[]> {
    try {
      console.log('Loading VRMA from URL:', url);
      const gltf = await this.loader.loadAsync(url);
      
      if (!gltf.animations || gltf.animations.length === 0) {
        console.warn('No animations found in VRMA file');
        
        // Create a fallback animation if none exists
        return [this.createFallbackAnimation()];
      }
      
      // Validate animations to ensure they don't have invalid data
      const validAnimations: THREE.AnimationClip[] = [];
      
      for (const animation of gltf.animations) {
        try {
          // Validate tracks in the animation
          const validTracks: THREE.KeyframeTrack[] = [];
          
          for (const track of animation.tracks) {
            // Check if the track has valid data
            if (track.values && track.values.length > 0 && 
                track.times && track.times.length > 0 &&
                Number.isFinite(track.values[0])) {
              validTracks.push(track);
            } else {
              console.warn(`Skipping invalid track: ${track.name} in animation ${animation.name}`);
            }
          }
          
          if (validTracks.length > 0) {
            // Create a new animation clip with only valid tracks
            const validAnimation = new THREE.AnimationClip(
              animation.name,
              animation.duration,
              validTracks
            );
            validAnimations.push(validAnimation);
          }
        } catch (trackError) {
          console.warn(`Error validating animation ${animation.name}:`, trackError);
        }
      }
      
      if (validAnimations.length === 0) {
        console.warn('No valid animations found in VRMA file after validation');
        return [this.createFallbackAnimation()];
      }
      
      console.log('Loaded valid animations:', validAnimations.map(a => a.name));
      return validAnimations;
    } catch (error) {
      console.error('VRMA loading failed:', error);
      
      // Return a fallback animation on error
      return [this.createFallbackAnimation()];
    }
  }
  
  // Create a simple fallback animation
  createFallbackAnimation(): THREE.AnimationClip {
    // Create a simple waving animation as fallback
    const times = [0, 0.5, 1, 1.5, 2];
    const values = [
      // Initial position
      0, 0, 0, 1,
      // Raised arm
      0.3826834, 0, 0, 0.9238795,
      // Wave right
      0.3826834, 0.1950903, 0, 0.9038795,
      // Wave left
      0.3826834, -0.1950903, 0, 0.9038795,
      // Back to initial
      0, 0, 0, 1
    ];
    
    const track = new THREE.QuaternionKeyframeTrack(
      'rightArm.quaternion',
      times,
      values
    );
    
    return new THREE.AnimationClip('wave', 2, [track]);
  }
  
  // Load VRMA from file
  async loadVRMAFromFile(file: File): Promise<THREE.AnimationClip[]> {
    const url = URL.createObjectURL(file);
    try {
      const animations = await this.loadVRMA(url);
      return animations;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  
  // Apply animation to VRM
  applyAnimationToVRM(vrm: VRM, animation: THREE.AnimationClip, mixer: THREE.AnimationMixer) {
    if (!vrm || !animation) return null;
    
    // Get VRM manager to help with retargeting
    const vrmManager = getVRMManager();
    if (!vrmManager) {
    const action = mixer.clipAction(animation);
    return action;
  }
  
    // Use VRM manager to apply with retargeting
    return vrmManager.applyAnimation(vrm, animation, mixer);
  }
  
  // Create default test VRMA data
  createTestVRMAData() {
    return [
      {
        id: 'test-vrma-1',
        name: 'Wave Animation',
        file: null,
        url: '/animations/wave.vrma',
        animation: null
      },
      {
        id: 'test-vrma-2', 
        name: 'Nod Animation',
        file: null,
        url: '/animations/nod.vrma',
        animation: null
      },
      {
        id: 'test-vrma-3',
        name: 'Dance Animation',
        file: null,
        url: '/animations/dance.vrma',
        animation: null
      }
    ];
  }
}

// Singleton instances
let vrmManagerInstance: VRMManager | null = null;
let vrmaManagerInstance: VRMAManager | null = null;

export const getVRMManager = (scene?: THREE.Scene) => {
  if (!vrmManagerInstance && scene) {
    vrmManagerInstance = new VRMManager(scene);
  }
  return vrmManagerInstance;
};

export const getVRMAManager = () => {
  if (!vrmaManagerInstance) {
    vrmaManagerInstance = new VRMAManager();
  }
  return vrmaManagerInstance;
};
