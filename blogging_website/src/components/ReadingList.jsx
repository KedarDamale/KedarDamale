import { useState } from 'react';

export default function ReadingList() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      className="save-button"
      type="button"
      aria-pressed={saved}
      onClick={() => setSaved((value) => !value)}
    >
      <span aria-hidden="true">{saved ? '✓' : '+'}</span>
      {saved ? 'Saved to your reading list' : 'Save this space for later'}
    </button>
  );
}
