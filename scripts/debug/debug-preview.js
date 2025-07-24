// Test script to check if live preview is working
// This will be run in the browser console

console.log('🧪 MDSG Live Preview Debug Test - Enhanced');

// Check if editor exists
const editor = document.getElementById('markdown-editor');
console.log('1️⃣ Editor element:', editor ? '✅ Found' : '❌ Not found');

if (editor) {
  console.log('   Editor value:', `${editor.value?.substring(0, 50)}...`);
  console.log('   Editor type:', editor.tagName, editor.type);

  // Test basic input event
  editor.addEventListener('input', e => {
    console.log(
      '2️⃣ Direct input event fired:',
      `${e.target.value?.substring(0, 30)}...`,
    );
  });

  // Test manual input dispatch
  console.log('3️⃣ Testing manual input event...');
  editor.value = '# Test Markdown\n\n**Bold text** and *italic text*';
  editor.dispatchEvent(new Event('input', { bubbles: true }));

  // Check if events are properly bound by checking observable system
  setTimeout(() => {
    console.log('4️⃣ Testing after 500ms delay...');
    editor.value =
      '# Second Test\n\nThis should trigger debounced update after 300ms';
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }, 500);
} else {
  console.log('❌ Editor not found. Are you in editor mode?');
  console.log('💡 Try: Click "Try Demo" button first');
}

// Check if preview element exists
const preview = document.getElementById('preview');
console.log('5️⃣ Preview element:', preview ? '✅ Found' : '❌ Not found');

if (preview) {
  console.log(
    '   Preview content (first 100 chars):',
    `${preview.innerHTML?.substring(0, 100)}...`,
  );
}

// Check MDSG instance
if (window.mdsg) {
  console.log('6️⃣ MDSG instance:', '✅ Available');
  console.log('   Authenticated:', window.mdsg.authenticated);
  console.log('   Content:', `${window.mdsg.content?.substring(0, 30)}...`);

  // Test manual preview update
  console.log('7️⃣ Testing manual preview update...');
  const originalContent = window.mdsg.content;
  window.mdsg.content = '# Manual Test\n\nThis is a **manual** preview test.';
  window.mdsg.updatePreview();

  setTimeout(() => {
    const updatedPreview = document.getElementById('preview');
    if (updatedPreview) {
      console.log(
        '   Updated preview (first 100 chars):',
        `${updatedPreview.innerHTML?.substring(0, 100)}...`,
      );
      console.log(
        '8️⃣ Manual update:',
        updatedPreview.innerHTML.includes('Manual Test')
          ? '✅ Working'
          : '❌ Failed',
      );

      // Restore original content
      window.mdsg.content = originalContent;
      window.mdsg.updatePreview();
    }
  }, 100);

  // Check event handler
  if (window.mdsg.eventHandler) {
    console.log('9️⃣ Event handler stats:', window.mdsg.eventHandler.stats);
    console.log(
      '   Subscriptions:',
      window.mdsg.eventHandler.subscriptions?.size || 'Unknown',
    );
  }
} else {
  console.log('❌ MDSG instance not available on window object');
}

console.log('🔍 Check browser console for debug output from event handlers!');
console.log(
  '📝 After running this, type in the editor and watch for console logs.',
);
