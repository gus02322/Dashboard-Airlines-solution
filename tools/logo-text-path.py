# Convert a text to an SVG path with a font file (used for the logo wordmark).
# Needs: pip install fonttools brotli
# Usage: python3 tools/logo-text-path.py barlow-600.woff2 "Ops On Time"
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
font = TTFont(sys.argv[1]); text = sys.argv[2]
gs = font.getGlyphSet(); cmap = font.getBestCmap(); hmtx = font['hmtx']
upm = font['head'].unitsPerEm
os2 = font['OS/2']; cap = os2.sCapHeight
# simple pair kerning from GPOS is skipped; advance widths only
pen = SVGPathPen(gs); x = 0
for ch in text:
    g = cmap[ord(ch)]
    gs[g].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
    x += hmtx[g][0]
print(upm, cap, x)
print(pen.getCommands())
