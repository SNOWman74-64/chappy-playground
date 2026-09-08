from pathlib import Path
root=Path(__file__).resolve().parent
path=root/'app.js';text=path.read_text(encoding='utf-8')
old="'SEIKAN CHRONICLE / PLAYER’S GUIDE')}<div class=\"layout\">"
new="'SEIKAN CHRONICLE / PLAYER’S GUIDE')}<a class=\"mobile-start\" href=\"#guide/g01\"><span>はじめての旅人へ</span><strong>最初の3日ガイド →</strong></a><div class=\"layout\">"
assert text.count(old)==1
text=text.replace(old,new)
path.write_text(text,encoding='utf-8')
path=root/'style.css'
with path.open('a',encoding='utf-8') as f:
    f.write('\n/* Post-initial self refinement: keep headings balanced and source images intact. */\n.page-title{text-wrap:balance}.mobile-start{display:none}\n@media(max-width:640px){.event-card img{aspect-ratio:2;object-fit:contain}.mobile-start{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:48px;padding:10px 12px;margin:-4px 0 22px;border-left:3px solid #c69a50;background:#fffdf7;color:var(--ink);text-decoration:none;font-size:12px}.mobile-start strong{color:var(--teal)}}\n')
