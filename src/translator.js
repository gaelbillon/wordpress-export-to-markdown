const turndown = require('turndown');

function initTurndownService() {
	const turndownService = new turndown({
		headingStyle: 'atx',
		bulletListMarker: '-',
		codeBlockStyle: 'fenced'
	});

	// preserve embedded tweets
	turndownService.addRule('tweet', {
		filter: node => node.nodeName === 'BLOCKQUOTE' && node.getAttribute('class') === 'twitter-tweet',
		replacement: (content, node) => '\n\n' + node.outerHTML
	});

	// preserve embedded codepens
	turndownService.addRule('codepen', {
		filter: node => {
			// codepen embed snippets have changed over the years
			// but this series of checks should find the commonalities
			return (
				['P', 'DIV'].includes(node.nodeName) &&
				node.attributes['data-slug-hash'] &&
				node.getAttribute('class') === 'codepen'
			);
		},
		replacement: (content, node) => '\n\n' + node.outerHTML
	});

	// preserve embedded scripts (for tweets, codepens, gists, etc.)
	turndownService.addRule('script', {
		filter: 'script',
		replacement: (content, node) => {
			let before = '\n\n';
			if (node.previousSibling && node.previousSibling.nodeName !== '#text') {
				// keep twitter and codepen <script> tags snug with the element above them
				before = '\n';
			}
			const html = node.outerHTML.replace('async=""', 'async');
			return before + html + '\n\n';
		}
	});

	// preserve iframes (common for embedded audio/video)
	turndownService.addRule('iframe', {
		filter: 'iframe',
		replacement: (content, node) => {
			const html = node.outerHTML.replace('allowfullscreen=""', 'allowfullscreen');
			return '\n\n' + html + '\n\n';
		}
	});

	return turndownService;
}

function getPostContent(post, turndownService, config) {
	let content = post.encoded[0];
	// console.log(post);
	// console.log(post.postmeta);
	// console.log(post.category);

	// insert an empty div element between double line breaks
	// this nifty trick causes turndown to keep adjacent paragraphs separated
	// without mucking up content inside of other elemnts (like <code> blocks)
	content = content.replace(/(\r?\n){2}/g, '\n<div></div>\n');

	if (config.saveScrapedImages) {
		// writeImageFile() will save all content images to a relative /images
        // folder so update references in post content to match
        const date = post.post_date[0].substring(0,10);         
        const imageFolderName = "/media/" + date + "---" + post.post_name; //   ../../static		
		content = content.replace(/(<img[^>]*src=").*?([^/"]+\.(?:gif|jpe?g|png))("[^>]*>)/gi, '$1' + imageFolderName + '/$2$3');
	}

	// this is a hack to make <iframe> nodes non-empty by inserting a "." which
	// allows the iframe rule declared in initTurndownService() to take effect
	// (using turndown's blankRule() and keep() solution did not work for me)
	content = content.replace(/(<\/iframe>)/gi, '.$1');

	// use turndown to convert HTML to Markdown
	content = turndownService.turndown(content);

	// clean up extra spaces in list items
	content = content.replace(/(-|\d+\.) +/g, '$1 ');

	// clean up the "." from the iframe hack above
	content = content.replace(/\.(<\/iframe>)/gi, '$1');

	// Replace internal links
	content = content.replace(/(http|https):\/\/(dev\.)?gaelbillon\.com\/(.*)\//gi, '/posts/$3/');
	// https://dev.gaelbillon.com/cms-headless-avantages-inconvenients-comparatif-des-5-leaders/
	// http://gaelbillon.com/debugger-facilement-des-applications-sites-mobiles/
	// https://dev.gaelbillon.com
	// http://dev.gaelbillon.com
	// https://gaelbillon.com
	// http://gaelbillon.com

	return content;
}

exports.initTurndownService = initTurndownService;
exports.getPostContent = getPostContent;
