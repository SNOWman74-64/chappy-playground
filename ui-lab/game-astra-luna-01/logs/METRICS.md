# 計測結果

ユーザーの役割変更から集計。キャッシュ入力と推論出力は内数。段階別CLI usageは各呼出しのturn.completedを1回だけ加算。親は累積値の差分。前回失敗分を含む総計はmetrics.jsonに別記。

| 担当 | input | cached input | output | reasoning output |
| --- | ---: | ---: | ---: | ---: |
| parent_since_role_change | 16505568 | 16347520 | 30447 | 3824 |
| worker_since_role_change | 3953640 | 3652352 | 112354 | 28495 |
| parent_plus_worker_since_role_change | 20459208 | 19999872 | 142801 | 32319 |

集計打切り：09/07/2026 16:21:17。これ以降の記録処理と最終回答は含まない。

親の経過時間（子待ち含む）：2515.65秒。子のプロセス時間合計：1469.41秒。
親子のプロセス時間合計（重複あり）：3985.07秒。実経過時間：2515.65秒。

親の純粋な作業時間と待機時間の正確な分割は取得不能のためnull。区間の開始終了はrun.jsonのparent_phase_windows。実費と実配信tierは不明。
