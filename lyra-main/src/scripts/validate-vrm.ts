import * as fs from 'fs';
import * as path from 'path';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM } from '@pixiv/three-vrm';
import { VRMBoneValidator } from '../lib/vrmBoneValidator';
import { VRMBoneFixerTool } from '../lib/vrmBoneFixerTool';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Parse command line arguments
const args = process.argv.slice(2);
let vrmFilePath = '';
let shouldFix = false;
let outputPath = '';

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fix' || args[i] === '-f') {
    shouldFix = true;
  } else if (args[i] === '--output' || args[i] === '-o') {
    outputPath = args[i + 1];
    i++;
  } else if (!vrmFilePath) {
    vrmFilePath = args[i];
  }
}

// Check if a file path is provided
if (!vrmFilePath) {
  console.error('Usage: npx ts-node validate-vrm.ts <path-to-vrm-file> [--fix] [--output <output-path>]');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(vrmFilePath)) {
  console.error(`File not found: ${vrmFilePath}`);
  process.exit(1);
}

// If output path is not specified but fix is enabled, create a default output path
if (shouldFix && !outputPath) {
  const parsedPath = path.parse(vrmFilePath);
  outputPath = path.join(parsedPath.dir, `${parsedPath.name}-fixed${parsedPath.ext}`);
}

// Load and validate VRM
async function processVRMFile(filePath: string): Promise<void> {
  try {
    // Create a scene
    const scene = new THREE.Scene();
    
    // Set up loaders
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);
    
    // Load the VRM file
    console.log(`Loading VRM file: ${filePath}`);
    const arrayBuffer = fs.readFileSync(filePath);
    
    // Parse the VRM file
    const gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.parse(
        arrayBuffer, 
        '', 
        (gltf) => resolve(gltf), 
        (error) => reject(error)
      );
    });
    
    // Import as VRM
    let vrm: VRM;
    try {
      // Try to get VRM from userData
      vrm = gltf.userData.vrm;
      if (!vrm) {
        console.error('File is not a valid VRM model');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error loading VRM:', error);
      process.exit(1);
    }
    
    // Add the VRM to the scene
    scene.add(vrm.scene);
    
    // Validate the VRM
    console.log('\n=== VRM VALIDATION REPORT ===');
    const validationResult = VRMBoneValidator.validateVRM(vrm);
    
    // Print validation results
    if (validationResult.valid) {
      console.log('✓ VRM is valid and ready for animation');
    } else {
      console.log('✗ VRM has issues that need to be addressed');
    }
    
    // Print bone mapping results
    console.log('\nBone Mapping');
    if (validationResult.boneMapping.valid) {
      console.log('✓ Valid');
    } else {
      console.log('✗ Invalid');
      
      if (validationResult.boneMapping.missingBones.length > 0) {
        console.log('Missing Bones:');
        validationResult.boneMapping.missingBones.forEach(bone => {
          console.log(bone);
        });
      }
      
      if (validationResult.boneMapping.incorrectBones.length > 0) {
        console.log('Incorrect Bone Names:');
        validationResult.boneMapping.incorrectBones.forEach(bone => {
          console.log(bone);
        });
      }
    }
    
    // Print skeleton hierarchy results
    console.log('\nSkeleton Hierarchy');
    if (validationResult.skeletonHierarchy.valid) {
      console.log('✓ Valid');
    } else {
      console.log('✗ Invalid');
      console.log('Hierarchy Issues:');
      validationResult.skeletonHierarchy.issues.forEach(issue => {
        console.log(`- ${issue}`);
      });
    }
    
    // Print animation readiness results
    console.log('\nAnimation Readiness');
    if (validationResult.animationReadiness.ready) {
      console.log('✓ Ready for Animation');
    } else {
      console.log('✗ Not Ready for Animation');
      console.log('Animation Issues:');
      validationResult.animationReadiness.issues.forEach(issue => {
        console.log(`- ${issue}`);
      });
    }
    
    // If fix is enabled and there are issues, try to fix them
    if (shouldFix && !validationResult.valid) {
      console.log('\n=== ATTEMPTING TO FIX VRM ISSUES ===');
      
      // Create a fixer tool
      const fixerTool = new VRMBoneFixerTool(vrm, scene);
      
      // Try to fix the issues
      const fixSuccess = fixerTool.fix();
      
      if (fixSuccess) {
        console.log('✓ Successfully applied fixes');
        
        // Re-validate to show the new status
        const newValidationResult = fixerTool.validate();
        
        console.log('\n=== UPDATED VRM VALIDATION REPORT ===');
        if (newValidationResult.valid) {
          console.log('✓ VRM is now valid and ready for animation');
        } else {
          console.log('✗ VRM still has some issues that need manual attention');
        }
        
        // TODO: Save the fixed VRM
        console.log(`\nFixed VRM would be saved to: ${outputPath}`);
        console.log('(Saving functionality not yet implemented)');
      } else {
        console.log('✗ Could not automatically fix all issues');
        console.log('Some issues require manual intervention in a 3D modeling application');
      }
    }
    
  } catch (error) {
    console.error('Error processing VRM file:', error);
    process.exit(1);
  }
}

// Run the validation
processVRMFile(vrmFilePath).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 