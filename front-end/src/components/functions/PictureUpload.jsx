import { useState, useRef } from 'react';

function AvatarUploadPage({route}) {
  const inputFileRef = useRef(null);
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const file = inputFileRef.current.files[0];
      if (!file) {
        setError('No file selected.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/${route}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const newBlob = await response.json();
      setBlob(newBlob);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="file" ref={inputFileRef} type="file" required />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {blob && <p>Upload successful: {JSON.stringify(blob)}</p>}
    </div>
  );
}

export default AvatarUploadPage;
