# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-09-28

First public release.

### Added

- Upload an Instagram data export (`.zip`, or the two `.json` files) and see who doesn't follow you back.
  Everything runs in the browser; nothing is uploaded.
- Fuzzy parser that supports the known Instagram export formats, with clear errors for wrong files, HTML
  exports, format changes and files over 50 MB.
- Results with an odometer counter, stats, search, tabs and "Load more" pagination.
- Ignore list saved in the browser, with undo.
- Guide on how to request the file from Instagram, and a reminder toast after a minute of inactivity.
- Shareable story image (1080×1920) in three styles.
- Spanish and English, with Spanish as the default.
- "How it works" section and a transparency section about the risks of giving other apps your password.
- CI with Git Flow checks, and automatic deployment to GitHub Pages from `main`.

[0.1.0]: https://github.com/ricardoerl/nosoytufan.com/releases/tag/v0.1.0
