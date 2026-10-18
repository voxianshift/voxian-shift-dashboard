# Synthetic CV fixtures

All career details are invented. No real applicant or contact data.

- `career.txt`: minimal software-development career evidence.
- `career.pdf`: one-page, text-based PDF with a standard Helvetica font.
- `career-scan.pdf`: raster-only rendering of that PDF; contains no selectable text.
- `career.docx`: minimal OOXML document assembled with Python standard-library ZIP/XML.
- `career.doc`: binary Word 97 document converted from synthetic TXT using macOS textutil.

Fixtures test real parsers; structured AI outputs are mocked separately in unit tests.

- `career-embedded-font.pdf`: embedded Bitstream Vera TrueType font from bundled ReportLab.
- `career-locked.pdf`: password-protected PDF (`test-only-password`); must be rejected.
- `career-too-many-pages.pdf`: valid 21-page PDF; exceeds upload page limit.

- `oversized-content.docx`: synthetic compressed payload expands past 16 MB despite a false small ZIP size; verifies bounded decompression.
