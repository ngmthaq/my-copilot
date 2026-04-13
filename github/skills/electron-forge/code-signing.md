# Electron Forge — Code Signing

## Overview

Code signing is required for:

- **macOS**: Apps must be signed and notarized to run without Gatekeeper warnings
- **Windows**: Unsigned apps show SmartScreen warnings; signing is needed for auto-update

## macOS Signing & Notarization

### Prerequisites

1. Apple Developer account ($99/year)
2. Developer ID Application certificate
3. Developer ID Installer certificate (for `.pkg`)
4. App-specific password for notarization

### Configuration

```typescript
// forge.config.ts
packagerConfig: {
  osxSign: {
    identity: "Developer ID Application: Your Name (TEAM_ID)",
    // Or let it auto-detect from keychain:
    // identity: undefined, // Finds the first valid signing identity
  },
  osxNotarize: {
    appleId: process.env.APPLE_ID!,
    appleIdPassword: process.env.APPLE_PASSWORD!, // App-specific password
    teamId: process.env.APPLE_TEAM_ID!,
  },
},
```

### Environment Variables

```bash
# .env (never commit this)
APPLE_ID=your@apple.id
APPLE_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App-specific password from appleid.apple.com
APPLE_TEAM_ID=ABCDE12345
```

### Using Keychain (CI/CD)

```bash
# Import certificate into CI keychain
security create-keychain -p "" build.keychain
security default-keychain -s build.keychain
security unlock-keychain -p "" build.keychain
security import certificate.p12 -k build.keychain -P "$CERT_PASSWORD" -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
```

### Entitlements

Create an entitlements file for macOS sandboxed apps:

```xml
<!-- entitlements.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
</dict>
</plist>
```

```typescript
osxSign: {
  optionsForFile: (filePath) => ({
    entitlements: "./entitlements.plist",
    entitlementsInherit: "./entitlements.plist",
  }),
},
```

### Hardened Runtime

Electron apps require the hardened runtime with specific exceptions:

```typescript
osxSign: {
  optionsForFile: () => ({
    entitlements: "./entitlements.plist",
    entitlementsInherit: "./entitlements.plist",
    hardenedRuntime: true,
    "gatekeeper-assess": false,
  }),
},
```

## Windows Signing

### Prerequisites

1. Code signing certificate (EV or standard) from a Certificate Authority
2. Certificate in `.pfx` format

### Configuration with Squirrel

```typescript
import { MakerSquirrel } from "@electron-forge/maker-squirrel";

new MakerSquirrel({
  certificateFile: process.env.WINDOWS_CERT_FILE,
  certificatePassword: process.env.WINDOWS_CERT_PASSWORD,
}),
```

### Configuration with packagerConfig

```typescript
packagerConfig: {
  windowsSign: {
    certificateFile: process.env.WINDOWS_CERT_FILE!,
    certificatePassword: process.env.WINDOWS_CERT_PASSWORD!,
  },
},
```

### Using SignTool Directly

```typescript
packagerConfig: {
  windowsSign: {
    signToolPath: "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\signtool.exe",
    certificateFile: "./cert.pfx",
    certificatePassword: process.env.CERT_PASSWORD,
    timestampServer: "http://timestamp.digicert.com",
  },
},
```

### Azure Trusted Signing (Cloud HSM)

For EV certificates stored in Azure Key Vault:

```typescript
packagerConfig: {
  windowsSign: async (filePath) => {
    // Use azure-sign-tool or custom signing logic
    execSync(`AzureSignTool sign -kvu "${process.env.AZURE_KEY_VAULT_URL}" -kvt "${process.env.AZURE_TENANT_ID}" -kvi "${process.env.AZURE_CLIENT_ID}" -kvs "${process.env.AZURE_CLIENT_SECRET}" -kvc "${process.env.AZURE_CERT_NAME}" -tr "http://timestamp.digicert.com" -td sha256 "${filePath}"`);
  },
},
```

## CI/CD Code Signing

### GitHub Actions — macOS

```yaml
- name: Import signing certificate
  env:
    MACOS_CERTIFICATE: ${{ secrets.MACOS_CERTIFICATE }}
    MACOS_CERTIFICATE_PWD: ${{ secrets.MACOS_CERTIFICATE_PWD }}
  run: |
    echo $MACOS_CERTIFICATE | base64 --decode > certificate.p12
    security create-keychain -p "" build.keychain
    security default-keychain -s build.keychain
    security unlock-keychain -p "" build.keychain
    security import certificate.p12 -k build.keychain -P "$MACOS_CERTIFICATE_PWD" -T /usr/bin/codesign
    security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain

- name: Build and sign
  env:
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
    APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
  run: npm run make
```

### GitHub Actions — Windows

```yaml
- name: Import signing certificate
  env:
    WINDOWS_CERT: ${{ secrets.WINDOWS_CERT }}
    WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
  run: |
    echo $env:WINDOWS_CERT | Out-File -Encoding ascii cert.b64
    certutil -decode cert.b64 cert.pfx
  shell: powershell

- name: Build and sign
  env:
    WINDOWS_CERT_FILE: ./cert.pfx
    WINDOWS_CERT_PASSWORD: ${{ secrets.WINDOWS_CERT_PASSWORD }}
  run: npm run make
```

## Verification

### macOS

```bash
# Verify code signature
codesign --verify --deep --strict --verbose=2 "out/My App-darwin-arm64/My App.app"

# Check notarization
spctl --assess --verbose=4 --type execute "out/My App-darwin-arm64/My App.app"

# Verify notarization ticket is stapled
xcrun stapler validate "out/My App-darwin-arm64/My App.app"
```

### Windows

```powershell
# Verify signature
Get-AuthenticodeSignature "out\make\squirrel.windows\x64\MyApp-Setup.exe"
```

## Best Practices

1. **Never commit certificates or passwords** — use environment variables and CI secrets
2. **Use app-specific passwords** — don't use your main Apple ID password
3. **Test signing locally first** — before setting up CI
4. **Use hardened runtime** — required for macOS notarization
5. **Timestamp signatures** — so they remain valid after certificate expiry
6. **Keep certificates secure** — use hardware tokens (EV) or cloud HSM for production
7. **Verify signatures** — always verify the output after signing
8. **Disable signing in dev** — only sign production builds to speed up development
