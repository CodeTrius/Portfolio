import React from 'react';
import DOMPurify from 'dompurify';

const MemoizedPostContent = React.memo(({ htmlContent }) => {
  const sanitizedContent = DOMPurify.sanitize(htmlContent || '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
  });

  return (
    <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  );
});

export default MemoizedPostContent;