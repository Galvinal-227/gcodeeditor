// Debug file to test electronAPI
console.log('Debug: Checking electronAPI');
if (window.electronAPI) {
  console.log('Debug: electronAPI exists');
  console.log('Debug: Available methods:', Object.keys(window.electronAPI));
} else {
  console.error('Debug: electronAPI is NOT available!');
}