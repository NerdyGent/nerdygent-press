'use client';

import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {REVIEW_EDITION_STORAGE} from '@/lib/preferences';
import type {Edition} from '@/lib/press';

export default function PostPrintReview({edition, onReview, onPhone}: {
  edition: Edition;
  onReview: () => void;
  onPhone: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVisible(false);
    setSaved(false);
    if (edition.sample) return;

    // Browsers report closing print preview, including cancellation, not delivery.
    function afterPrint() {
      try {
        localStorage.setItem(REVIEW_EDITION_STORAGE, JSON.stringify(edition));
        setSaved(true);
      } catch {
        setSaved(false);
      }
      setVisible(true);
    }
    window.addEventListener('afterprint', afterPrint);
    return () => window.removeEventListener('afterprint', afterPrint);
  }, [edition]);

  if (!visible || edition.sample) return null;

  return <section className="panel no-print" aria-labelledby="post-print-review-title">
    <p className="eyebrow">MAKE THE NEXT EDITION MORE YOURS</p>
    <h2 id="post-print-review-title">How did this paper feel?</h2>
    <p>When you’ve read it, tell us what earned its place and what you’d skip. Topic choices, dry writing and repeated stories each get their own feedback.</p>
    <div className="actions">
      <Button onClick={onReview}>Rate this paper</Button>
      <Button variant="outline" onClick={onPhone}>Review on my phone</Button>
      <Button variant="ghost" onClick={() => setVisible(false)}>I’ll read it first</Button>
    </div>
    <p className="small-note" role="status">{saved
      ? 'This edition is ready on the Review page whenever you are. Your interests change only through explicit feedback.'
      : 'Keep this page open to review later, or download a phone-review file. This browser could not save the edition.'}</p>
  </section>;
}
