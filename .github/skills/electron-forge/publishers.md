# Electron Forge — Publishers

## Overview

Publishers upload your built distributables (from makers) to distribution platforms. They run as the final step in `electron-forge publish`.

## Available Publishers

| Publisher            | Target                  | Package                                             |
| -------------------- | ----------------------- | --------------------------------------------------- |
| `PublisherGithub`    | GitHub Releases         | `@electron-forge/publisher-github`                  |
| `PublisherS3`        | AWS S3                  | `@electron-forge/publisher-s3`                      |
| `PublisherSnapcraft` | Snap Store              | `@electron-forge/publisher-snapcraft`               |
| `PublisherBitbucket` | Bitbucket Downloads     | `@electron-forge/publisher-bitbucket`               |
| `PublisherNucleus`   | Nucleus Server          | `@electron-forge/publisher-nucleus`                 |
| `PublisherERS`       | Electron Release Server | `@electron-forge/publisher-electron-release-server` |

## GitHub Releases

```bash
npm install --save-dev @electron-forge/publisher-github
```

```typescript
import { PublisherGithub } from "@electron-forge/publisher-github";

// In publishers array:
new PublisherGithub({
  repository: {
    owner: "your-username",
    name: "your-repo",
  },
  prerelease: false,
  draft: true, // Create as draft — review before publishing
  tagPrefix: "v", // Tags like "v1.0.0"
  // Auth token from environment
  authToken: process.env.GITHUB_TOKEN,
}),
```

### GitHub Token

Set the `GITHUB_TOKEN` environment variable with a Personal Access Token (PAT) that has `repo` scope:

```bash
export GITHUB_TOKEN=your_github_pat_here
npm run publish
```

## AWS S3

```bash
npm install --save-dev @electron-forge/publisher-s3
```

```typescript
import { PublisherS3 } from "@electron-forge/publisher-s3";

new PublisherS3({
  bucket: "my-electron-releases",
  region: "us-east-1",
  public: true,
  // Folder structure in S3
  folder: "${name}/${version}/${platform}/${arch}",
  // AWS credentials from environment
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}),
```

## Snapcraft (Snap Store)

```bash
npm install --save-dev @electron-forge/publisher-snapcraft
```

```typescript
import { PublisherSnapcraft } from "@electron-forge/publisher-snapcraft";

new PublisherSnapcraft({
  release: "stable", // "stable", "candidate", "beta", "edge"
}),
```

Requires `snapcraft login` on the build machine.

## Bitbucket Downloads

```bash
npm install --save-dev @electron-forge/publisher-bitbucket
```

```typescript
import { PublisherBitbucket } from "@electron-forge/publisher-bitbucket";

new PublisherBitbucket({
  repository: {
    owner: "your-workspace",
    name: "your-repo",
  },
  auth: {
    username: process.env.BITBUCKET_USERNAME!,
    appPassword: process.env.BITBUCKET_APP_PASSWORD!,
  },
  replaceExistingFiles: true,
}),
```

## Multiple Publishers

You can configure multiple publishers — all will run during `publish`:

```typescript
publishers: [
  new PublisherGithub({
    repository: { owner: "user", name: "repo" },
    draft: true,
  }),
  new PublisherS3({
    bucket: "my-releases",
    region: "us-east-1",
  }),
],
```

## Publishing Commands

```bash
# Publish for current platform
npm run publish

# Publish with specific platform/arch
npx electron-forge publish --platform=darwin --arch=x64

# Dry run (builds but doesn't upload)
npx electron-forge publish --dry-run
```

## CI/CD Publishing

### GitHub Actions

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ["v*"]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Publish
        run: npm run publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Best Practices

1. **Use `draft: true` for GitHub** — review release notes before making public
2. **Store credentials in environment** — never hardcode tokens or passwords
3. **Use CI/CD for publishing** — automate cross-platform builds and uploads
4. **Tag releases** — use semantic versioning with `v` prefix (`v1.0.0`)
5. **Test with `--dry-run`** — verify the build pipeline before actually publishing
6. **Match version in package.json** — the publisher uses this for release naming
