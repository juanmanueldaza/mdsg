/**
 * 🧪 MDSG Live Preview Final Verification
 * Copy and paste this into browser console at http://localhost:3000
 * After logging in or entering demo mode
 */

console.log('🧪 MDSG Live Preview Final Test - Code Alchemist');

// Test 1: Verify DOM elements exist
const editor = document.getElementById('markdown-editor');
const preview = document.getElementById('preview');

if (!editor) {
  console.error('❌ Editor not found - need to be in editor mode');
  console.log('💡 Click "Try Demo" or login first');
} else if (!preview) {
  console.error('❌ Preview not found - DOM structure issue');
} else {
  console.log('✅ Editor and preview elements found');

  // Test 2: Check if events are bound
  const originalValue = editor.value;

  // Test 3: Simulate typing
  editor.value =
    '# Live Preview Test\n\nThis should appear in preview **immediately**!';
  editor.dispatchEvent(new Event('input', { bubbles: true }));

  console.log('📝 Simulated input event');

  // Test 4: Check preview update after delay
  setTimeout(() => {
    const previewContent = preview.innerHTML;
    if (previewContent.includes('Live Preview Test')) {
      console.log('✅ Live preview is working! Content updated in preview');
      console.log('🎉 All systems operational - MDSG Code Alchemist success!');
    } else {
      console.log('❌ Preview not updated - investigating further...');
      console.log('Preview content:', previewContent.substring(0, 200));
    }

    // Restore original content
    editor.value = originalValue;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }, 500);

  // Test 5: Check event system
  console.log('🔍 Event handler status:');
  if (window.mdsgInstance && window.mdsgInstance.eventHandler) {
    console.log('✅ Event handler exists');
    console.log('Stats:', window.mdsgInstance.eventHandler.stats);
  } else {
    console.log('❌ Event handler not accessible');
  }
}
