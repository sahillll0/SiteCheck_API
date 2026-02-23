import axios from "axios";
import * as cheerio from "cheerio";

export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
};

export const fetchHTML = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 10000,
            httpsAgent: new (await import("https")).Agent({
                rejectUnauthorized: false
            })
        });
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch URL: ${error.message}`);
    }
};

export const analyzeSEO = ($) => {
    const issues = [];
    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content");
    const h1Count = $("h1").length;
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;
    const canonical = $('link[rel="canonical"]').attr("href");
    const robots = $('meta[name="robots"]').attr("content");
    const favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href");

    const images = $("img");
    const imagesWithoutAlt = [];

    if (!title) {
        issues.push("Missing <title> tag");
    } else if (title.length < 10 || title.length > 60) {
        issues.push("Title length should be between 10 and 60 characters");
    }

    if (!metaDescription) {
        issues.push("Missing meta description");
    } else if (metaDescription.length < 50 || metaDescription.length > 160) {
        issues.push("Meta description length should be between 50 and 160 characters");
    }

    if (h1Count === 0) {
        issues.push("Missing <h1> tag");
    } else if (h1Count > 1) {
        issues.push("Multiple <h1> tags found (should be only one)");
    }

    if (!canonical) {
        issues.push("Missing canonical tag");
    }

    if (!favicon) {
        issues.push("Missing favicon");
    }

    images.each((i, img) => {
        if (!$(img).attr("alt")) {
            imagesWithoutAlt.push($(img).attr("src") || "unknown image");
        }
    });

    if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    return {
        title,
        titleLength: title ? title.length : 0,
        metaDescription,
        metaDescriptionLength: metaDescription ? metaDescription.length : 0,
        h1Count,
        h2Count,
        h3Count,
        canonical,
        robots,
        favicon,
        imagesWithoutAlt: imagesWithoutAlt.length,
        issues,
    };
};

export const analyzePerformance = (html, $) => {
    const issues = [];
    const pageSizeBytes = Buffer.byteLength(html, "utf8");
    const pageSizeKB = (pageSizeBytes / 1024).toFixed(2);
    const imageCount = $("img").length;
    const scriptCount = $("script").length;
    const styleCount = $('link[rel="stylesheet"]').length + $('style').length;

    // Text to HTML Ratio
    const textContent = $.root().text().replace(/\s+/g, " ").trim();
    const textRatio = ((textContent.length / html.length) * 100).toFixed(2);

    if (pageSizeKB > 100) {
        issues.push(`Page size is ${pageSizeKB}KB (recommended < 100KB)`);
    }

    if (scriptCount > 20) {
        issues.push(`Too many scripts (${scriptCount}) found (recommended < 20)`);
    }

    if (styleCount > 10) {
        issues.push(`Too many stylesheets (${styleCount}) found (recommended < 10)`);
    }

    if (textRatio < 10) {
        issues.push(`Low text-to-HTML ratio (${textRatio}%). Add more content.`);
    }

    return {
        pageSizeKB,
        imageCount,
        scriptCount,
        styleCount,
        resourceCount: imageCount + scriptCount + styleCount,
        textRatio: parseFloat(textRatio),
        issues,
    };
};

export const analyzeSocial = ($) => {
    const issues = [];
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const ogDescription = $('meta[property="og:description"]').attr("content");
    const ogImage = $('meta[property="og:image"]').attr("content");
    const twitterCard = $('meta[name="twitter:card"]').attr("content");

    if (!ogTitle) issues.push("Missing Open Graph Title (og:title)");
    if (!ogDescription) issues.push("Missing Open Graph Description (og:description)");
    if (!ogImage) issues.push("Missing Open Graph Image (og:image)");

    return {
        ogTitle,
        ogDescription,
        ogImage,
        twitterCard,
        issues
    };
};

export const analyzeMobileAndSecurity = ($, url) => {
    const issues = [];
    const viewport = $('meta[name="viewport"]').attr("content");
    const isHttps = url.startsWith("https://");

    if (!viewport) issues.push("Missing viewport meta tag (mobile responsiveness issue)");
    if (!isHttps) issues.push("Website is not using HTTPS (security issue)");

    return {
        viewport,
        https: isHttps,
        issues
    };
};

export const calculateScore = (allIssues) => {
    let score = 100;
    // Weighted penalties
    allIssues.forEach(issue => {
        if (issue.includes("security") || issue.includes("HTTPS")) score -= 10;
        else if (issue.includes("viewport") || issue.includes("Missing <h1>") || issue.includes("Title")) score -= 5;
        else score -= 3;
    });

    return Math.max(0, score);
};

export const generateSuggestions = (issues) => {
    const suggestions = [];
    issues.forEach(issue => {
        if (issue.includes("Missing <title>")) suggestions.push("Add a descriptive <title> tag to your page head.");
        if (issue.includes("Title length")) suggestions.push("Optimize title length to be between 10-60 characters.");
        if (issue.includes("Missing meta description")) suggestions.push("Add a meta description to summarize page content.");
        if (issue.includes("Meta description length")) suggestions.push("Optimize meta description length to be between 50-160 characters.");
        if (issue.includes("Missing <h1>")) suggestions.push("Add a main <h1> heading to structure your page.");
        if (issue.includes("Multiple <h1>")) suggestions.push("Use only one <h1> tag per page to represent the main topic.");
        if (issue.includes("images missing alt")) suggestions.push("Add descriptive alt text to all images for accessibility.");
        if (issue.includes("Page size")) suggestions.push("Optimize HTML size by minifying code or reducing content.");
        if (issue.includes("Too many scripts")) suggestions.push("Combine or defer scripts to improve load time.");
        if (issue.includes("Too many stylesheets")) suggestions.push("Combine stylesheets to reduce HTTP requests.");
        if (issue.includes("text-to-HTML")) suggestions.push("Add more text content to improve SEO.");
        if (issue.includes("canonical")) suggestions.push("Add a canonical tag to prevent duplicate content issues.");
        if (issue.includes("favicon")) suggestions.push("Add a favicon to improve branding.");
        if (issue.includes("Open Graph")) suggestions.push("Add Open Graph tags to control how your site looks on social media.");
        if (issue.includes("viewport")) suggestions.push("Add a viewport meta tag for mobile responsiveness.");
        if (issue.includes("HTTPS")) suggestions.push("Secure your site with an SSL certificate to enable HTTPS.");
    });
    return suggestions;
}

export const analyzeWebsite = async (url) => {
    if (!validateURL(url)) {
        throw new Error("Invalid URL provided");
    }

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const seoResult = analyzeSEO($);
    const perfResult = analyzePerformance(html, $);
    const socialResult = analyzeSocial($);
    const mobileSecResult = analyzeMobileAndSecurity($, url);

    const allIssues = [
        ...seoResult.issues,
        ...perfResult.issues,
        ...socialResult.issues,
        ...mobileSecResult.issues
    ];

    const score = calculateScore(allIssues);
    const suggestions = generateSuggestions(allIssues);

    return {
        url,
        analyzedAt: new Date().toISOString(),
        score,
        metrics: {
            // SEO
            titleLength: seoResult.titleLength,
            metaDescriptionLength: seoResult.metaDescriptionLength,
            h1Count: seoResult.h1Count,
            h2Count: seoResult.h2Count,
            h3Count: seoResult.h3Count,
            canonical: seoResult.canonical,
            robots: seoResult.robots,
            favicon: seoResult.favicon,

            // Performance
            pageSize: perfResult.pageSizeKB + " KB", // maintain string format for compatibility
            imageCount: perfResult.imageCount,
            scriptCount: perfResult.scriptCount,
            styleCount: perfResult.styleCount,
            resourceCount: perfResult.resourceCount,
            textRatio: perfResult.textRatio,

            // Social
            ogTitle: socialResult.ogTitle,
            ogDescription: socialResult.ogDescription,
            ogImage: socialResult.ogImage,
            twitterCard: socialResult.twitterCard,

            // Mobile & Security
            viewport: mobileSecResult.viewport,
            https: mobileSecResult.https,
        },
        issues: allIssues,
        suggestions: suggestions,
    };
};
