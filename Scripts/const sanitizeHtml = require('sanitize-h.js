const sanitizeHtml = require('sanitize-html');

// Custom function to remove Microsoft Word-specific tags, namespaces, and styles
const removeMsWordTags = (html) => {
  if (!html) return ''; // Check if html is undefined or null, return empty string
  return html
    .replace(/<\/*(v|o|w|m)(:[^>]+)?>/gi, '') // Remove namespaces (v: o: w: m:)
    .replace(/<\?xml.*?>/gi, '') // Remove XML headers
    .replace(/<style[^>]*>.*?<\/style>/gsi, '') // Remove style tags
    .replace(/<!\[if !mso\]>.*?<!\[endif\]>/gsi, '') // Remove MS Office conditional comments
    .replace(/<!\[if.*?<!\[endif\]>/gsi, '') // Remove MSO-specific conditional comments
    .replace(/mso-[a-z\-]+:[^;"]+;/gi, ''); // Remove Mso-specific inline styles
};

// 🛠️ Loop through each item in the input array
return items.map(item => {
  const dirtyHtml = item.json.textHtml || ''; // Get the HTML from the current item (default to empty if not found)
  
  // 🛠️ Debug: Log the first 500 characters of the HTML
  console.log('🔍 Original HTML:', dirtyHtml.slice(0, 500));
  
  if (!dirtyHtml) {
    console.warn('⚠️ No textHtml found for item');
    return {
      json: {
        originalHtml: '',
        cleanedHtml: ''
      }
    };
  }

  // 🛠️ Step 1: Remove Microsoft Word-specific tags and styles
  const cleanedWordHtml = removeMsWordTags(dirtyHtml);
  console.log('After Removing MS Word Tags:', cleanedWordHtml.slice(0, 500));

  // 🛠️ Step 2: Clean <p class="MsoNormal"> to <p> and remove inline styles
  let cleanedHtml = cleanedWordHtml
    .replace(/<p class="MsoNormal">/gi, '<p>') // Replace <p class="MsoNormal"> with <p>
    .replace(/<span[^>]*style="[^"]*"[^>]*>/gi, '<span>') // Remove inline styles from <span> tags
    .replace(/<(\w+)(\s+class="[^"]*")/gi, '<$1') // Remove all 'class' attributes
    .replace(/<(\w+)(\s+style="[^"]*")/gi, '<$1') // Remove all 'style' attributes from any tag
    .replace(/[\r\n]+/g, '')  // Remove line breaks from the content
    .replace(/\s\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Trim leading and trailing whitespace

  // 🛠️ Step 3: Sanitize the cleaned HTML
  cleanedHtml = sanitizeHtml(cleanedHtml, {
    allowedTags: [
      'address', 'article', 'aside', 'footer', 'header', 'h1', 'h2', 'h3', 'h4',
      'h5', 'h6', 'blockquote', 'div', 'dl', 'dt', 'figcaption', 'figure', 'hr',
      'li', 'ol', 'p', 'pre', 'ul', 'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite',
      'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rb', 'rp', 'rt',
      'rtc', 'ruby', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time',
      'u', 'var', 'wbr', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'width', 'height'],
      '*': ['class', 'id', 'name', 'data-*', 'aria-*'] // We no longer need 'style' as it's stripped
    },
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
    disallowedTagsMode: 'discard'
  });

  // 🛠️ Debug: Log the first 500 characters of the cleaned HTML
  console.log('🧼 Cleaned HTML:', cleanedHtml.slice(0, 500));

  // 🛠️ Return the result for this item
  return {
    json: {
      originalHtml: dirtyHtml,
      cleanedHtml: cleanedHtml
    }
  };
});