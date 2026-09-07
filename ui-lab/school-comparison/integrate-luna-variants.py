"""Register completed additional variants, preserving existing gallery entries."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
LAB=ROOT.parent
p=ROOT/'index.html'
s=p.read_text(encoding='utf-8')
if 'data-luna-additions' not in s:
    cards=[]
    for effort,letter in [('medium','D'),('high','E')]:
        variant='school-luna-'+effort
        for path in [LAB/variant/'index.html',ROOT/'logs'/(variant+'-desktop.png')]:
            if not path.exists():raise SystemExit('Missing completed artifact: '+str(path))
        cards.append(f'''      <article class="site" data-luna-additions="{effort}">
        <a class="preview" href="../{variant}/"><img src="logs/{variant}-desktop.png" alt="Luna {effort}制作サイトのプレビュー"></a>
        <div class="body">
          <small>VARIANT {letter} / {effort.upper()} / PRIORITY REQUESTED</small>
          <h2>GPT-5.6 Luna / {effort}</h2>
          <p>同じ設計書と写真を使い、推論を{effort}に設定して独立制作した学校サイト。</p>
          <a class="open" href="../{variant}/">サイト{letter}を開く →</a>
        </div>
      </article>''')
    anchor='    </div>\n\n    <div class="links">'
    if anchor not in s:raise SystemExit('Comparison card insertion point changed; review before updating.')
    s=s.replace(anchor,'\n'+'\n\n'.join(cards)+'\n'+anchor,1)
    s=s.replace('3サイト制作比較','5サイト制作比較').replace('ひとつの設計、みっつの青葉。','ひとつの設計、5つの青葉。').replace('3つの制作環境','5つのモデル設定・制作環境')
    s=s.replace('<h2>GPT-5.6 Luna</h2>','<h2>GPT-5.6 Luna / xhigh</h2>')
    s=s.replace('<a href="metrics.json">計測データ</a>','<a href="metrics.json">初回の計測データ</a>\n      <a href="LUNA-COMPARISON.md">Luna medium / high の制作ログ</a>\n      <a href="luna-experiment-metrics.json">追加案の計測データ</a>')
    s=s.replace('min-width:650px','min-width:980px')
    s=s.replace('<th>Luna</th><th>ChatGPT Web</th>','<th>Luna xhigh</th><th>ChatGPT Web</th><th>Luna medium</th><th>Luna high</th>').replace('colspan="4"','colspan="6"')
    start=s.index('    <p class="note">');end=s.index('</p>',start)+4
    s=s[:start]+'''    <p class="note">Astra・Luna xhighは初回、ChatGPT WebはVariant C、Luna medium・highは追加の並行制作です。トークンにはキャッシュ入力を含み、初回制作時間と修正込みの使用量を分けています。Astraは共通準備と検証も担当。Fastはpriorityとして要求し、実配信tierは未確認です。追加2案は素材を最初から用意しており、初回とは準備条件に差があります。全サイトとも架空校のデモで、外部送信は行いません。</p>'''+s[end:]
    start=s.index('  <script>');end=s.index('  </script>',start)+len('  </script>')
    script='''  <script>
    Promise.all(['metrics.json','luna-experiment-metrics.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw new Error('metrics unavailable');return r.json()}))).then(([m,extra])=>{
      const n=v=>v==null?'未取得':Number(v).toLocaleString('ja-JP');
      const duration=s=>{if(s==null)return '未取得';const value=Math.round(s);return Math.floor(value/60)+'分'+value%60+'秒'};
      const variants=[m.astra,m.luna,null,extra.medium,extra.high];
      const rows=[
        ['初回制作の経過時間',...variants.map(v=>duration(v?.initial_seconds))],
        ['入力トークン（修正・キャッシュ含む）',...variants.map(v=>n(v?.usage?.input_tokens))],
        ['うちキャッシュ入力',...variants.map(v=>n(v?.usage?.cached_input_tokens))],
        ['出力トークン（修正含む）',...variants.map(v=>n(v?.usage?.output_tokens))],
        ['初回のみの出力トークン',n(m.astra.initial_interval_usage_delta?.output_tokens),n(m.luna.cli_first_turn_usage?.[0]?.output_tokens),'未取得',n(extra.medium.initial_usage?.output_tokens),n(extra.high.initial_usage?.output_tokens)],
        ['推論設定',m.astra.reasoning,m.luna.reasoning,'xhigh',extra.medium.observed_effort??'未確認',extra.high.observed_effort??'未確認']
      ];
      const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      document.querySelector('#metrics').innerHTML=rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('');
    }).catch(()=>{document.querySelector('#metrics').innerHTML='<tr><td colspan="6">計測データを読み込めませんでした。上の制作ログをご確認ください。</td></tr>'});
  </script>'''
    s=s[:start]+script+s[end:]
    p.write_text(s,encoding='utf-8')

p=LAB/'catalog.json';catalog=json.loads(p.read_text(encoding='utf-8'))
for effort in ['medium','high']:
    variant='school-luna-'+effort
    if any(v['id']==variant for v in catalog['mocks']):continue
    catalog['mocks'].append({'id':variant,'title':'青葉高等学校 — Luna '+effort,'shortTitle':'青葉高等学校 — Luna '+effort,'summary':'同じ設計・写真からLuna '+effort+' / Fast指定で独立制作。学校紹介・部活・検索・予約フォームを備える比較案。','previewPath':'./'+variant+'/','designPath':'./'+variant+'/DESIGN.md','retrospectivePath':'./'+variant+'/RETROSPECTIVE.md','referenceUrl':'./school-comparison/DESIGN-PLAN.md','thumbnail':'./school-comparison/logs/'+variant+'-desktop.png','tags':['SCHOOL','LUNA '+effort.upper(),'MODEL COMPARISON'],'principles':['共通設計と素材で独立制作','推論設定と実行ログを記録','表示と主要操作をブラウザで確認']})
p.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Comparison and gallery updated.')
