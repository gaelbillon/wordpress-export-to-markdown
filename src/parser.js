const fs = require('fs');
const luxon = require('luxon');
const xml2js = require('xml2js');

const shared = require('./shared');
const translator = require('./translator');

async function parseFilePromise(config) {
	console.log('\nParsing...');
	const content = await fs.promises.readFile(config.input, 'utf8');
	const data = await xml2js.parseStringPromise(content, {
		trim: true,
		tagNameProcessors: [xml2js.processors.stripPrefix]
	});

	const posts = collectPosts(data, config);

	const images = [];
	if (config.saveAttachedImages) {
		images.push(...collectAttachedImages(data));
	}
	if (config.saveScrapedImages) {
		images.push(...collectScrapedImages(data));
	}

	mergeImagesIntoPosts(images, posts);

	return posts;
}

function getItemsOfType(data, type) {
	return data.rss.channel[0].item.filter(item => item.post_type[0] === type);
}

function collectPosts(data, config) {
	// this is passed into getPostContent() for the markdown conversion
	const turndownService = translator.initTurndownService();

	const posts = getItemsOfType(data, 'portfolio')
		.filter(post => post.status[0] !== 'trash' && post.status[0] !== 'draft')
		.map(post => ({
			// meta data isn't written to file, but is used to help with other things
			meta: {
				id: getPostId(post),
				slug: getPostSlug(post),
				coverImageId: getPostCoverImageId(post),
				imageUrls: [],
				date: getPostDate(post)
			},
			frontmatter: {
				posttype: "work",
				draft: "false",
				path: "/" + getPostSlug(post),
				title: getPostTitle(post),
				subtitle: "",
				date: getPostDate(post),
				category: getPostCategory(post),
				tags: getPostTags(post),
				intro: getPostMetaDescription(post),
				color: "#125E8A",
				url: "htttp://gaelbillon.com/"
			},
			content: translator.getPostContent(post, turndownService, config)
		}));

	console.log(posts.length + ' posts found.');
	return posts;
}

function getPostId(post) {
	// console.log(post.category);
	return post.post_id[0];
}

function getPostSlug(post) {
	return post.post_name[0];
}

function getPostTags(post) {
	// return post.category[0];
	// return '  - "Design"\n  - "Typography"\n  - "Web Development"';
	// return "  - Tomato'\n  - 'Typography'\n  - 'Web Development'";

	const categories = post.category;
	// console.log(post.category[0])
	
	// console.log("- - - - - - - -");
	
	const tags = [];

	for (const property in categories) {
	  // console.log(`${property}: ${tags[property]}`);
	  // console.log("-");
	  // console.log(`${property}`);
	  // console.log(`${categories[property]}`);
	  // console.log("-");
	  // console.log(property);
	  // console.log(categories[property]);
	  // console.log(categories[property]);
	  // console.log("-");
	  // console.log(categories[property]['_']);
	  
	  const tag = categories[property]['_'];
	  const tagListItem = '\n  - ' + '"' + tag + '"'; 
	  
	  tags.push(tagListItem);
	  
	  // console.log("~~~~");
	  // console.log(`${property['_']}: ${tags[property]['_:']}`);
	  // console.log(`${property[0]}: ${tags[property][0]}`);
	}
	// console.log("tags : " + tags);
	// console.log("tags : " + tags.toString());

	// const testString = '  - "Tomato"\n\t- "Typography"\n\t- "Web Development" ';
	// console.log("testString : " + testString);
	
	// console.log("===============")

	// return testString;
	// console.log(tags);
	return tags.toString();
}

function getPostCategory(post) {
	// return post.category[0];
	// return '  - "Design"\n  - "Typography"\n  - "Web Development"';
	// return "  - Tomato'\n  - 'Typography'\n  - 'Web Development'";

	const categories = post.category;
	// console.log(post.category[0])
	
	// console.log("- - - - - - - -");
	
	// const tags = null;

	for (const property in categories) {
	  // console.log(`${property}: ${tags[property]}`);
	  // console.log("-");
	  // console.log(`${property}`);
	  // console.log(`${categories[property]}`);
	  // console.log("-");
	  // console.log(property);
	  // console.log(categories[property]);
	  // console.log(categories[property]);
	  // console.log("-");
	  // console.log(categories[property]['_']);
	  
	  // const tag = categories[property]['_'];
	  // const tagListItem = '\n  - ' + '"' + tag + '"'; 
	  
	  // console.log(categories[property]);
	  // console.log(categories[property]['$']);
	  // console.log(categories[property]['$']['domain']);

	  if ( categories[property]['$']['domain'] ==='category' ) {
		// console.log(categories[property]['_']);
		return categories[property]['_'];
	  }

	  // console.log("----------------");
	  // tags.push(tagListItem);
	  
	  // console.log("~~~~");
	  // console.log(`${property['_']}: ${tags[property]['_:']}`);
	  // console.log(`${property[0]}: ${tags[property][0]}`);
	}
	// console.log("tags : " + tags);
	// console.log("tags : " + tags.toString());

	// const testString = '  - "Tomato"\n\t- "Typography"\n\t- "Web Development" ';
	// console.log("testString : " + testString);
	
	// console.log("===============")

	// return testString;
	// console.log(tags);
	// return tags.toString();
	// return "";
}

function getPostMetaDescription(post) {
	// console.log(post.postmeta[0].meta_value);
	// console.log(post.postmeta);
	var metaDescription = null;

	const postmeta = post.postmeta;
	
	for (const property in postmeta) {
		// const meta = postmeta[property]['_yoast_wpseo_metadesc'];
		// console.log(meta);

		// console.log("--------")
		// console.log(property);
		// console.log(postmeta[property]['meta_key']);
		// console.log(postmeta[property]['meta_key'][0]);
		// console.log(postmeta[property]['meta_value'][0]);
		// console.log("--------")

		if (postmeta[property]['meta_key'][0] === "_yoast_wpseo_metadesc") {
			metaDescription = postmeta[property]['meta_value'][0];
		// 	console.log("metaDescription : " + metaDescription);
			return metaDescription;
		// 	return "dog";
		// } else {
		// 	// return null;
		// 	return "cat";
		}
	}
	
	// return post.postmeta[0].meta_value;
}

function getPostCoverImageId(post) {
	if (post.postmeta === undefined) {
		return undefined;
	}

	const postmeta = post.postmeta.find(postmeta => postmeta.meta_key[0] === '_thumbnail_id');
	const id = postmeta ? postmeta.meta_value[0] : undefined;
	return id;
}

function getPostTitle(post) {
	return post.title[0];
}

function getPostDate(post) {
	// return luxon.DateTime.fromRFC2822(post.pubDate[0], { zone: 'utc' }).toISODate();
	return luxon.DateTime.fromRFC2822(post.pubDate[0], { zone: 'utc' }).toISO();
}

function getFileDatePrefix(post) {
	// console.log(post.meta.date);
	const dt = luxon.DateTime.fromISO(post.meta.date);
	// console.log(dt);
	
	// const yearMonthDay = post.meta.date.substring(0,10);
	// const yearMonthDayDashes = luxon.DateTime(dt).toISODate;
	// console.log(yearMonthDayDashes);
	
	slugFragment = dt.toFormat('yyyy-LL-dd') + '---'
	return slugFragment;
	
	// return yearMonthDay + "---";

}

function collectAttachedImages(data) {
	const images = getItemsOfType(data, 'attachment')
		// filter to certain image file types
		.filter(attachment => (/\.(gif|jpe?g|png)$/i).test(attachment.attachment_url[0]))
		.map(attachment => ({
			id: attachment.post_id[0],
			postId: attachment.post_parent[0],
			url: attachment.attachment_url[0]
		}));

	console.log(images.length + ' attached images found.');
	return images;
}

function collectScrapedImages(data) {
	const images = [];
	getItemsOfType(data, 'post').forEach(post => {
		const postId = post.post_id[0];
		const postContent = post.encoded[0];
		const postLink = post.link[0];

		const matches = [...postContent.matchAll(/<img[^>]*src="(.+?\.(?:gif|jpe?g|png))"[^>]*>/gi)];
		matches.forEach(match => {
			// base the matched image URL relative to the post URL
			const url = new URL(match[1], postLink).href;

			images.push({
				id: -1,
				postId: postId,
				url: url
			});
		});
	});

	console.log(images.length + ' images scraped from post body content.');
	return images;
}

function mergeImagesIntoPosts(images, posts) {
	// create lookup table for quicker traversal
	const postsLookup = posts.reduce((lookup, post) => {
		lookup[post.meta.id] = post;
		return lookup;
	}, {});

	images.forEach(image => {
		const post = postsLookup[image.postId];
		if (post) {
			if (image.id === post.meta.coverImageId) {
				// save cover image filename to frontmatter
				// post.frontmatter.coverImage = shared.getFilenameFromUrl(image.url);
				post.frontmatter.cover = "/media/" + getFileDatePrefix(post) + post.meta.slug + "/" + shared.getFilenameFromUrl(image.url);
			}
			
			// save (unique) full image URLs for downloading later
			if (!post.meta.imageUrls.includes(image.url)) {
				post.meta.imageUrls.push(image.url);
			}
		}
	});
}

exports.parseFilePromise = parseFilePromise;
