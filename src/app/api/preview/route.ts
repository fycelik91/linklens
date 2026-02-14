import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// SSRF protection: block private IP ranges and localhost
const isSafeUrl = (url: URL): boolean => {
  const hostname = url.hostname;

  // Block localhost and loopback
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return false;
  }

  // Block private IP ranges
  const parts = hostname.split('.').map(Number);
  if (parts.length === 4) {
    // IPv4
    if (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    ) {
      return false;
    }
  }

  // Block local domains
  if (hostname.endsWith('.local')) {
    return false;
  }

  return true;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  let url;
  try {
    url = new URL(targetUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid URL protocol. Only http and https are allowed.' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  if (!isSafeUrl(url)) {
    return NextResponse.json({ error: 'SSRF protection triggered: Access to private or local resources is forbidden.' }, { status: 403 });
  }

  // Check cache
  const cached = cache.get(targetUrl);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    console.log('Serving from cache:', targetUrl);
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const title = document.querySelector('title')?.textContent || document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    const data = {
      url: targetUrl,
      title,
      description,
      ogImage,
      favicon: `${url.protocol}//${url.hostname}/favicon.ico`, // Simple favicon attempt
    };

    cache.set(targetUrl, { data, timestamp: Date.now() });
    return NextResponse.json(data);

  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ error: 'Failed to process URL', details: e.message }, { status: 500 });
  }
}
