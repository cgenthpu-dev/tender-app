/**
 * Splits HTML content into pages based on precise pixel height measurement.
 * Implements recursive splitting to handle overflows at the word level while preserving HTML structure.
 * 
 * @param {string} htmlContent - The full HTML string.
 * @returns {string[]} - Array of HTML strings, one for each page.
 */

// A4 Height = 1123px (96 DPI)
// Footer space + Margins = ~150px buffer needed.
// Usable Height = ~970px.
// Setting to 880px to be extremely safe and ensure NO overlap with footer.
const MAX_PAGE_HEIGHT = 880;

export const paginateContent = (htmlContent) => {
    if (!htmlContent) return [];

    // 1. Setup Measurement Container
    // Must match the styling of the real page EXACTLY
    const container = document.createElement('div');
    container.className = 'doc-font';
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '190mm'; // 210mm - 20mm padding
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.5';
    container.style.color = 'black';
    container.style.boxSizing = 'border-box';
    document.body.appendChild(container);

    // 2. Parse Content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const sourceNodes = Array.from(doc.body.childNodes);

    const pages = [];
    let currentPageNodes = [];

    // Helper to finalize a page
    const pushPage = () => {
        if (currentPageNodes.length > 0) {
            const pageDiv = document.createElement('div');
            currentPageNodes.forEach(node => pageDiv.appendChild(node.cloneNode(true)));
            pages.push(pageDiv.innerHTML);
            currentPageNodes = [];
            container.innerHTML = ''; // Clear container for next page
        }
    };

    // Recursive function to add nodes to the current page
    // Returns the 'overflow' node if it didn't fit completely, or null if it fit.
    const addNodeToPage = (node) => {
        // Clone node to test fit
        const clone = node.cloneNode(true);
        container.appendChild(clone);

        // Check if it fits
        if (container.offsetHeight <= MAX_PAGE_HEIGHT) {
            // Fits completely, BUT check for orphan headers
            const isHeader = /^H[1-6]$/.test(node.tagName) || (node.tagName === 'STRONG' && node.textContent.length < 100);
            const spaceRemaining = MAX_PAGE_HEIGHT - container.offsetHeight;

            // If it's a header and we have less than 60px (approx 3 lines) remaining, 
            // and it's not the only thing on the page, push it to next page.
            if (isHeader && spaceRemaining < 60 && currentPageNodes.length > 0) {
                container.removeChild(clone);
                return node; // Treat as overflow
            }

            currentPageNodes.push(clone); // Keep the clone in our list
            return null; // No overflow
        }

        // Doesn't fit. Backtrack.
        container.removeChild(clone);

        // If it's a Header or very small element, and we aren't at the very top, 
        // prefer pushing the whole thing to next page rather than splitting.
        const isHeader = /^H[1-6]$/.test(node.tagName);
        const isSmall = node.nodeType === Node.ELEMENT_NODE && node.textContent.length < 50;

        if (container.innerHTML !== '' && (isHeader || isSmall)) {
            return node; // Return whole node as overflow
        }

        // Must split.
        // If Text Node
        if (node.nodeType === Node.TEXT_NODE) {
            return splitTextNode(node);
        }

        // If Element Node
        if (node.nodeType === Node.ELEMENT_NODE) {
            return splitElementNode(node);
        }

        return node; // Fallback
    };

    const splitTextNode = (textNode) => {
        const words = textNode.textContent.split(' ');
        const fitTextNode = document.createTextNode('');
        container.appendChild(fitTextNode);
        currentPageNodes.push(fitTextNode);

        let fitText = '';
        let overflowText = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testText = (i === 0 ? '' : ' ') + word;
            fitTextNode.textContent = fitText + testText;

            if (container.offsetHeight > MAX_PAGE_HEIGHT) {
                // Overflowed. Revert.
                fitTextNode.textContent = fitText;
                overflowText = words.slice(i).join(' ');
                break;
            }

            fitText += testText;
        }

        if (!overflowText) return null; // Surprisingly fit all?

        return document.createTextNode(overflowText);
    };

    const splitElementNode = (element) => {
        // Create a shell for the current page
        const fitElement = element.cloneNode(false);
        container.appendChild(fitElement);
        currentPageNodes.push(fitElement);

        // If the empty shell itself overflows (margin/padding), we have a problem.
        // But we assume it fits since we checked the whole node earlier and it didn't fit, 
        // but hopefully the empty shell fits.
        if (container.offsetHeight > MAX_PAGE_HEIGHT) {
            // Even empty shell doesn't fit.
            container.removeChild(fitElement);
            currentPageNodes.pop();
            return element; // Whole thing overflows
        }

        const overflowElement = element.cloneNode(false);
        let hasOverflow = false;

        // We need to temporarily redirect 'currentPageNodes' to be children of fitElement
        // But our structure is flat list of nodes for the page root.
        // Here we are recursing. We need to append children to 'fitElement' directly.

        const children = Array.from(element.childNodes);

        for (const child of children) {
            if (hasOverflow) {
                overflowElement.appendChild(child.cloneNode(true));
                continue;
            }

            // Try appending child to fitElement
            const childClone = child.cloneNode(true);
            fitElement.appendChild(childClone);

            if (container.offsetHeight <= MAX_PAGE_HEIGHT) {
                // Fits
                continue;
            }

            // Doesn't fit. Backtrack.
            fitElement.removeChild(childClone);

            // Recurse split
            // We need a custom splitter that appends to fitElement instead of currentPageNodes
            // Let's inline the logic or make a helper?
            // Inline logic for child split:

            if (child.nodeType === Node.TEXT_NODE) {
                // Split text inside element
                const words = child.textContent.split(' ');
                const fitTextNode = document.createTextNode('');
                fitElement.appendChild(fitTextNode);

                let fitText = '';
                let overflowText = '';

                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const testText = (i === 0 ? '' : ' ') + word;
                    fitTextNode.textContent = fitText + testText;

                    if (container.offsetHeight > MAX_PAGE_HEIGHT) {
                        fitTextNode.textContent = fitText;
                        overflowText = words.slice(i).join(' ');
                        break;
                    }
                    fitText += testText;
                }

                if (overflowText) {
                    hasOverflow = true;
                    overflowElement.appendChild(document.createTextNode(overflowText));
                }
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                // Deep recurse? 
                // For simplicity/robustness, if a nested element doesn't fit, 
                // we just push it to overflow unless it's huge.
                // Let's try one level deep split?
                // Or just push to overflow.
                hasOverflow = true;
                overflowElement.appendChild(child.cloneNode(true));
            }
        }

        if (hasOverflow) {
            // Check if fitElement ended up empty?
            if (fitElement.childNodes.length === 0) {
                // If it's empty, remove it and return whole element as overflow
                container.removeChild(fitElement);
                currentPageNodes.pop();
                return element;
            }
            return overflowElement;
        }

        return null;
    };

    // Main Loop
    let queue = [...sourceNodes];
    while (queue.length > 0) {
        const node = queue.shift();
        const overflow = addNodeToPage(node);

        if (overflow) {
            // Page is full.
            pushPage();
            // Process the overflow on the next page
            queue.unshift(overflow);
        }
    }

    pushPage();
    document.body.removeChild(container);
    return pages.length > 0 ? pages : [''];
};
