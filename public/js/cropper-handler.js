let cropper;

document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById('imageUpload');
  const previewImage = document.getElementById('imagePreview');
  const croppedImageInput = document.getElementById('croppedImageInput');
  const form = document.querySelector('form');

  if (!uploadInput || !previewImage || !croppedImageInput || !form) return;
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, e => e.preventDefault());
  });

  document.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    uploadInput.files = dt.files;

    // Trigger the same logic as input change
    const event = new Event('change');
    uploadInput.dispatchEvent(event);
  });

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      previewImage.src = event.target.result;
      previewImage.style.display = 'block';

      // Destroy any existing cropper instance
      if (cropper) cropper.destroy();

      // Initialize new cropper
      cropper = new Cropper(previewImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true
      });
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', (e) => {
    if (!cropper) return; // No cropping, just submit as-is

    e.preventDefault(); // Prevent default form submission

    cropper.getCroppedCanvas({
      width: 300,
      height: 300
    }).toBlob((blob) => {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      croppedImageInput.files = dataTransfer.files;

      form.submit(); // Submit form with cropped image
    }, 'image/jpeg');
  });
});
