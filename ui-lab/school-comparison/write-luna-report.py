import json
from pathlib import Path
ROOT=Path(__file__).resolve().parent
m=json.loads((ROOT/'luna-experiment-metrics.json').read_text(encoding='utf-8'))
def dur(v):
    if v is None:return '未取得'
    v=round(v);return f'{v//60}分{v%60:02d}秒'
def num(v):return '未取得' if v is None else f'{v:,}'
def usage(v,key):return num((v or {}).get(key))
rows=[]
for key,label in [('initial_seconds','初回制作時間'),('execution_seconds','モデル実行時間合計（修正含む）')]:rows.append('| '+label+' | '+' | '.join(dur(m[e][key]) for e in ['medium','high'])+' |')
for key,label in [('input_tokens','入力トークン（修正・キャッシュ含む）'),('cached_input_tokens','うちキャッシュ入力'),('output_tokens','出力トークン（修正含む）'),('reasoning_output_tokens','うち推論出力'),('total_tokens','入力＋出力')]:rows.append('| '+label+' | '+' | '.join(usage(m[e]['usage'],key) for e in ['medium','high'])+' |')
for key,label in [('input_tokens','初回のみの入力'),('output_tokens','初回のみの出力')]:rows.append('| '+label+' | '+' | '.join(usage(m[e]['initial_usage'],key) for e in ['medium','high'])+' |')
stages=[]
for e in ['medium','high']:
    for s in m[e]['stages']:stages.append(f"| {e} / {s['name']} | {s['start_utc']} | {s['end_utc']} | {dur(s['seconds'])} | {s['exit_code']} |")
text='''# Luna medium / high：同一設計での追加制作ログ

共通の[設計計画書](DESIGN-PLAN.md)を使い、Luna mediumとLuna highを別プロセスで並行制作した。設計書と写真は同一で、相手や既存案の実装を読まない独立Writerとして委託した。共通計画のハッシュ、写真のハッシュ、起動プロンプトのハッシュは[LUNA-EXPERIMENT.json](LUNA-EXPERIMENT.json)に保存している。

- [Luna medium](../school-luna-medium/)
- [Luna high](../school-luna-high/)
- [比較画面](index.html)

## 条件と確認できた設定

モデルは両方gpt-5.6-luna。推論はmedium / high、Fastはservice_tier=priorityで要求した。turn_contextのmodelとeffortを確認し、要求値と観測値を別項目として保存した。実配信tierはログに記録されておらず、要求値から推測しない。

静的HTML/CSS/JavaScript、同じ学校設定・共有写真、検索・絞り込み・詳細・予約と問い合わせの確認/修正/完了、PCとスマホ対応、設計判断・振り返り・検証記録という条件を揃えた。共通ファイルは親担当のみが編集し、各モデルは自身のフォルダーだけを編集する。ブラウザ検証と比較画面の統合は親担当が受け持つ。

新しい2案は、開始時点から5枚の共通写真が揃っている。元のxhigh制作は写真準備が制作と重なっていたため、その条件まで完全に同じではない。実行日時、利用可能なツール、キャッシュ状態も異なり、一般的なモデル性能の順位を示す実験ではない。

## 計測結果

| 項目 | Luna medium | Luna high |
| --- | ---: | ---: |
'''+ '\n'.join(rows)+'''

入力にはキャッシュ入力、出力には推論出力が含まれる。内数を重ねて加算していない。CLI再開時にはカウンターがリセットされるため、初回と修正それぞれのturn.completedのusageを合算する。親担当の調整・ブラウザ検証・統合の使用量は、どちらのモデルの数値にも含めない。

## 時刻と実行段階

時刻はUTC。日本時間は9時間を加える。

| 実行 | 開始UTC | 終了UTC | 経過時間 | 終了コード |
| --- | --- | --- | --- | ---: |
'''+ '\n'.join(stages)+f'''

初回実行の重複時間：{dur(m.get('initial_overlap_seconds'))}。これは壁時計の重複であり、GPU処理時間ではない。モデル実行時間には自分で行った静的検証を含む。親側の待機・ブラウザ検証・公開処理は含まない。

集計保存時点：{m['captured_utc']}。

## 検証記録と修正

- [medium 検証記録](../school-luna-medium/TEST-REPORT.md)
- [high 検証記録](../school-luna-high/TEST-REPORT.md)
- [medium 振り返り](../school-luna-medium/RETROSPECTIVE.md)
- [high 振り返り](../school-luna-high/RETROSPECTIVE.md)

モデルの自己申告と、親側が実ブラウザで確認した結果を分けて記録する。検証後に修正が発生した場合も同じモデル・同じ推論設定へ戻し、追加実行を別のstageとして残す。画面が表示できたことだけをフォーム成功の証拠にはしない。

## ログの保存先

[luna-experiment-metrics.json](luna-experiment-metrics.json)が集計データ。logs/school-luna-medium-* と logs/school-luna-high-* に開始終了、プロンプト、モデル終了文、usageタイムライン、画面キャプチャ、ブラウザ結果を保存する。イベントJSONLとstderrの生ログは従来と同じくローカル保管し、集計値と検証結果をGitへ保存する。

先行実験のmetrics.jsonは再集計しない。今回の数値はcollect-luna-experiment.pyで抽出した。このスクリプトを実行するにはローカルのCodexセッションログが必要で、公開サイトの表示には不要。

## サイトの位置づけ

追加修正起動時のセッション指定訂正は[起動訂正ログ](logs/DISPATCH-INCIDENT.md)に記録。この中断実行は完了usage未取得で表に含めていない。

学校名、人物、日程、学費などは架空。フォームはブラウザ内のデモであり、実際の予約、出願、送信、メール、資料発送は行わない。
'''
(ROOT/'LUNA-COMPARISON.md').write_text(text,encoding='utf-8')
print('Additional experiment report written.')
