# VRM Humanoid Bone Validator and Fixer

This tool validates VRM models for proper humanoid bone mapping and animation readiness. It ensures that your VRM models adhere to the standard bone naming conventions and hierarchy structure required for proper animation. It can also attempt to automatically fix common bone mapping issues.

## Features

- **Bone Mapping Validation**: Verifies that all required bones are correctly set with proper names.
- **Skeleton Hierarchy Validation**: Checks the integrity of the skeleton hierarchy (e.g., Hips → Spine → Chest → etc.)
- **Animation Readiness Check**: Ensures that bones are properly bound for animation retargeting.
- **Automatic Bone Fixing**: Attempts to automatically fix common bone mapping issues:
  - Auto-maps bones based on common naming patterns
  - Creates missing essential bones if needed
  - Fixes bone hierarchy issues
- **Comprehensive Report**: Generates a full diagnostic report of any issues found.

## Usage

### Command Line

```bash
# Validate a VRM file
npm run validate-vrm /path/to/your/model.vrm

# Validate and attempt to fix issues
npm run fix-vrm /path/to/your/model.vrm

# Validate, fix, and specify output path
npm run fix-vrm /path/to/your/model.vrm -- --output /path/to/output/fixed-model.vrm
```

### In-App Validation

The validator is integrated into the Lyra Companion app. To use it:

1. Load your VRM model in the app
2. Go to the "Validation" tab in the character panel
3. Click "Validate VRM Bone Structure" to check your model
4. If issues are found, click "Auto-Fix Bone Issues" to attempt automatic fixes

## Common Issues and Solutions

### Missing Bones

If bones are missing, the validator will list them. The automatic fixer will:

1. Try to find bones with similar names in your model
2. Create essential bones if they don't exist
3. Establish proper parent-child relationships

### Incorrect Bone Names

If bones are incorrectly named, the validator will list them. The automatic fixer will:

1. Map bones based on common naming patterns
2. Establish proper connections between bones

### Hierarchy Issues

If the bone hierarchy is incorrect, the validator will report issues like "X is not a descendant of Y". The automatic fixer will:

1. Reparent bones to establish the correct hierarchy
2. Preserve the original world positions of bones

## Manual Fixing

If automatic fixing doesn't resolve all issues, you'll need to manually fix your model:

1. Export the list of available bones from the validator
2. Use a 3D modeling application (like Blender) to rename bones according to the VRM standard
3. Ensure proper bone hierarchy (Hips → Spine → Chest → etc.)
4. Re-export your model as VRM

## VRM Bone Standard

The VRM standard requires the following bone structure:

```
- hips
  - spine
    - chest
      - upperChest (optional)
        - neck
          - head
            - leftEye
            - rightEye
            - jaw
        - leftShoulder
          - leftUpperArm
            - leftLowerArm
              - leftHand
                - leftThumb, leftIndex, leftMiddle, leftRing, leftLittle fingers
        - rightShoulder
          - rightUpperArm
            - rightLowerArm
              - rightHand
                - rightThumb, rightIndex, rightMiddle, rightRing, rightLittle fingers
    - leftUpperLeg
      - leftLowerLeg
        - leftFoot
          - leftToes
    - rightUpperLeg
      - rightLowerLeg
        - rightFoot
          - rightToes
```

## Technical Details

The validator and fixer are implemented in TypeScript and use Three.js for 3D operations. The main components are:

- `VRMBoneValidator`: Validates bone mapping, hierarchy, and animation readiness
- `VRMBoneMapper`: Maps bones based on common naming patterns
- `VRMBoneFixerTool`: Combines validation and fixing functionality

For developers, these utilities can be imported and used programmatically in your own applications. 