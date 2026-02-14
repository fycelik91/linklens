# LinkLens: URL Previewer

LinkLens is a Next.js 14 application that allows you to preview URLs by fetching their metadata (title, description, and Open Graph image) with built-in SSRF protection and caching.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## Features

- **URL Preview**: Fetches and displays title, description, and `og:image` from any valid HTTP/HTTPS URL.
- **SSRF Protection**: Prevents access to private IP ranges (localhost, 127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x) and local domains (`*.local`).
- **In-memory Cache**: Caches preview results for 10 minutes to reduce redundant requests and improve performance.
- **Responsive Frontend**: Single-page application with URL input, preview card, and raw JSON display.

## Getting Started

### Local Development

1.  **Clone the repository (if applicable) or navigate to the project directory:**

    ```bash
    cd /tmp/linklens
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API Usage

The application exposes a single API endpoint for fetching URL previews.

`GET /api/preview?url={targetUrl}`

-   **`targetUrl`**: The URL you want to preview. Must be `http` or `https` and pass SSRF checks.

**Example Request:**

```
GET /api/preview?url=https://www.google.com
```

**Example Success Response:**

```json
{
  "url": "https://www.google.com",
  "title": "Google",
  "description": "Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.",
  "ogImage": "/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
  "favicon": "https://www.google.com/favicon.ico"
}
```

**Example Error Response (Invalid URL):**

```json
{
  "error": "Invalid URL format"
}
```

**Example Error Response (SSRF Protection):**

```json
{
  "error": "SSRF protection triggered: Access to private or local resources is forbidden."
}
```

## Security Notes (SSRF Protection)

LinkLens implements Server-Side Request Forgery (SSRF) protection to prevent malicious users from using the API to access internal resources or other sensitive information on the server's network. The following are blocked:

-   `localhost` and `127.0.0.1`
-   Private IPv4 ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
-   Local domains ending with `.local`

Always ensure that the `url` parameter provided to the API is from a trusted source or properly validated on the client-side as well.
