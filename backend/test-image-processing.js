const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function testImageProcessing() {
  console.log('Testing image processing functionality...');
  
  try {
    // Create a simple test image (1x1 pixel)
    const testImagePath = path.join(__dirname, 'test-input.jpg');
    const outputImagePath = path.join(__dirname, 'test-output.jpg');
    
    // Create a simple test image
    await sharp({
      create: {
        width: 800,
        height: 1200,
        channels: 4,
        background: { r: 100, g: 150, b: 200, alpha: 1 }
      }
    })
    .jpeg({ quality: 100 })
    .toFile(testImagePath);
    
    console.log('✓ Test input image created');
    
    // Test the image processing pipeline
    await sharp(testImagePath)
      .resize(400, 600, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 90,
        progressive: true
      })
      .toFile(outputImagePath);
    
    console.log('✓ Image processing pipeline completed');
    
    // Get image info
    const inputInfo = await sharp(testImagePath).metadata();
    const outputInfo = await sharp(outputImagePath).metadata();
    
    console.log('Input image:', {
      width: inputInfo.width,
      height: inputInfo.height,
      format: inputInfo.format,
      size: inputInfo.size
    });
    
    console.log('Output image:', {
      width: outputInfo.width,
      height: outputInfo.height,
      format: outputInfo.format,
      size: outputInfo.size
    });
    
    // Calculate compression ratio
    const compressionRatio = ((inputInfo.size - outputInfo.size) / inputInfo.size * 100).toFixed(2);
    console.log(`✓ Compression achieved: ${compressionRatio}% size reduction`);
    
    // Clean up test files
    fs.unlinkSync(testImagePath);
    fs.unlinkSync(outputImagePath);
    
    console.log('✓ Image processing test completed successfully');
    return true;
    
  } catch (error) {
    console.error('✗ Image processing test failed:', error.message);
    return false;
  }
}

// Run the test
testImageProcessing().then(success => {
  process.exit(success ? 0 : 1);
});
